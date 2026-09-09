// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ASCBase} from "@gluwa/asc-contracts/contracts/readability/ASCBase.sol";
import {EvmV1Decoder} from "@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol";
import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";

/// @title GageSettlement
/// @notice The Creditcoin side of a Gage: the maker locks a gage, the counterparty
///         pays on the source chain (Sepolia), and the Attestcoin proof of that
///         exact payment releases the gage to the taker. No bridge, no oracle
///         operator, no privileged relayer: settlement is permissionless and the
///         proof is checked synchronously by the native query verifier precompile.
/// @dev    Inherits ASCBase (verify + dedupe + delegate). Deal state is keyed by
///         the deal id shared with GageDeal on the source chain.
contract GageSettlement is ASCBase {
    enum State {
        Open,
        Settled,
        Cancelled
    }

    struct Deal {
        address maker; // locks the gage on Creditcoin
        address taker; // receives the gage on settlement
        uint96 amount; // gage size in native wei
        uint64 expiry; // after this the maker may cancel
        uint96 paymentAmount; // expected source-chain payment
        address sourceEmitter; // expected PaymentMade emitter (GageDeal on Sepolia)
        bytes32 ref; // expected payment reference
        State state;
    }

    struct ProofArgs {
        uint64 chainKey;
        uint64 blockHeight;
        bytes encodedTransaction;
        bytes32 merkleRoot;
        INativeQueryVerifier.MerkleProofEntry[] siblings;
        bytes32 lowerEndpointDigest;
        bytes32[] continuityRoots;
    }

    uint256 public constant MAX_BATCH = 10;

    /// keccak256("PaymentMade(uint256,address,uint256,bytes32)")
    bytes32 public constant PAYMENT_EVENT_SIGNATURE =
        0xd33aaa180016895d33ce7ad0841fe3c9e56cec30c0cf9a763f0e70825f732e3e;

    uint256 public nextDealId = 1;
    mapping(uint256 => Deal) public deals;

    event DealOpened(
        uint256 indexed dealId,
        address indexed maker,
        address indexed taker,
        uint256 amount,
        uint64 expiry,
        uint96 paymentAmount,
        address sourceEmitter,
        bytes32 ref
    );
    event GageReleased(uint256 indexed dealId, address indexed taker, uint256 amount, bytes32 queryId);
    event GageCancelled(uint256 indexed dealId, address indexed maker, uint256 amount);

    error DealNotOpen();
    error NotExpired();
    error ZeroAmount();
    error ExpiryPast();
    error EmitterMismatch();
    error TopicMismatch();
    error AmountMismatch();
    error RefMismatch();
    error PaymentTxFailed();
    error NoPaymentLog();
    error UnsupportedTxType();
    error BatchTooLarge();

    /// @notice Open a deal and lock the gage. The returned id is used on both
    ///         chains: pay(dealId, ref) on the source chain, settle() here.
    function open(address taker, uint64 expiry, uint96 paymentAmount, address sourceEmitter, bytes32 ref)
        external
        payable
        returns (uint256 dealId)
    {
        if (msg.value == 0) revert ZeroAmount();
        if (uint64(block.timestamp) >= expiry) revert ExpiryPast();
        dealId = nextDealId++;
        deals[dealId] = Deal({
            maker: msg.sender,
            taker: taker,
            amount: uint96(msg.value),
            expiry: expiry,
            paymentAmount: paymentAmount,
            sourceEmitter: sourceEmitter,
            ref: ref,
            state: State.Open
        });
        emit DealOpened(dealId, msg.sender, taker, msg.value, expiry, paymentAmount, sourceEmitter, ref);
    }

    /// @notice Settle one deal with one proved source-chain payment.
    function settle(
        uint64 chainKey,
        uint64 blockHeight,
        bytes calldata encodedTransaction,
        bytes32 merkleRoot,
        INativeQueryVerifier.MerkleProofEntry[] calldata siblings,
        bytes32 lowerEndpointDigest,
        bytes32[] calldata continuityRoots
    ) external returns (bool success) {
        success = _settleWithProof(
            chainKey, blockHeight, encodedTransaction, merkleRoot, siblings, lowerEndpointDigest, continuityRoots
        );
    }

    /// @notice Settle up to MAX_BATCH payments in a single Creditcoin transaction.
    ///         Each entry carries its own inclusion + continuity proof; every
    ///         proved payment must match an open deal or the whole call reverts.
    function settleMany(ProofArgs[] calldata proofs) external returns (uint256 settledCount) {
        if (proofs.length == 0 || proofs.length > MAX_BATCH) revert BatchTooLarge();
        for (uint256 i = 0; i < proofs.length; ++i) {
            ProofArgs calldata p = proofs[i];
            _settleWithProof(
                p.chainKey,
                p.blockHeight,
                p.encodedTransaction,
                p.merkleRoot,
                p.siblings,
                p.lowerEndpointDigest,
                p.continuityRoots
            );
            ++settledCount;
        }
    }

    /// @dev Mirrors ASCBase.execute (dedupe by queryId, verify via the precompile,
    ///      mark processed, then process) as an internal call so batch settlement
    ///      can run several proofs in one transaction.
    function _settleWithProof(
        uint64 chainKey,
        uint64 blockHeight,
        bytes calldata encodedTransaction,
        bytes32 merkleRoot,
        INativeQueryVerifier.MerkleProofEntry[] calldata siblings,
        bytes32 lowerEndpointDigest,
        bytes32[] calldata continuityRoots
    ) internal returns (bool success) {
        bytes32 queryId = _computeQueryId(chainKey, blockHeight, merkleRoot, siblings);
        require(!processedQueries[queryId], "Query already processed");
        bool verified = _verifyProof(chainKey, blockHeight, encodedTransaction, merkleRoot, siblings, lowerEndpointDigest, continuityRoots);
        require(verified, "Proof of inclusion verification failed");
        processedQueries[queryId] = true;
        _processAndEmitEvent(0, queryId, encodedTransaction);
        return true;
    }

    /// @notice Maker recovers the gage if no acceptable payment proved before expiry.
    function cancelExpired(uint256 dealId) external {
        Deal storage deal = deals[dealId];
        if (deal.state != State.Open) revert DealNotOpen();
        if (uint64(block.timestamp) < deal.expiry) revert NotExpired();
        deal.state = State.Cancelled;
        (bool sent, ) = deal.maker.call{value: deal.amount}("");
        require(sent, "cancel transfer failed");
        emit GageCancelled(dealId, deal.maker, deal.amount);
    }

    /// @inheritdoc ASCBase
    function _processAndEmitEvent(uint8 /* action */, bytes32 queryId, bytes memory encodedTransaction) internal override {
        uint8 txType = EvmV1Decoder.getTransactionType(encodedTransaction);
        require(EvmV1Decoder.isValidTransactionType(txType), "unsupported tx type");
        EvmV1Decoder.ReceiptFields memory receipt = EvmV1Decoder.decodeReceiptFields(encodedTransaction);
        if (receipt.receiptStatus != 1) revert PaymentTxFailed();

        EvmV1Decoder.LogEntry[] memory logs = EvmV1Decoder.getLogsByEventSignature(receipt, PAYMENT_EVENT_SIGNATURE);
        if (logs.length == 0) revert NoPaymentLog();

        _releaseFromLog(logs[0], queryId);
    }

    function _releaseFromLog(EvmV1Decoder.LogEntry memory log, bytes32 queryId) internal {
        // topics: [0] signature, [1] dealId, [2] payer ; data: (uint256 amount, bytes32 ref)
        if (log.topics.length != 3) revert TopicMismatch();
        uint256 dealId = uint256(log.topics[1]);
        Deal storage deal = deals[dealId];
        if (deal.state != State.Open) revert DealNotOpen();
        if (deal.sourceEmitter != log.address_) revert EmitterMismatch();

        (uint256 amount, bytes32 ref) = abi.decode(log.data, (uint256, bytes32));
        if (amount != deal.paymentAmount) revert AmountMismatch();
        if (ref != deal.ref) revert RefMismatch();

        deal.state = State.Settled;
        (bool sent, ) = deal.taker.call{value: deal.amount}("");
        require(sent, "release transfer failed");
        emit GageReleased(dealId, deal.taker, deal.amount, queryId);
    }

    /// @notice Deal terms hash used by the console to display an immutable
    ///         summary of what a proof must match.
    function termsOf(uint256 dealId)
        external
        view
        returns (
            address maker,
            address taker,
            uint96 amount,
            uint64 expiry,
            uint96 paymentAmount,
            address sourceEmitter,
            bytes32 ref,
            uint8 state
        )
    {
        Deal storage d = deals[dealId];
        return (d.maker, d.taker, d.amount, d.expiry, d.paymentAmount, d.sourceEmitter, d.ref, uint8(d.state));
    }
}
