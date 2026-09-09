// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title GageDeal
/// @notice Source-chain (Sepolia) escrow for Gage deals. A deal is opened on
///         Creditcoin and identified by the same id here; the counterparty pays
///         into this escrow and the payment event is exactly what the Attestcoin
///         proof verifies on Creditcoin to release the gage.
/// @dev    Deliberately dumb: no terms live here. Terms live on the Creditcoin
///         side where the value is locked; matching (amount + ref + emitter) is
///         enforced there. A payment made against an id nobody opened on
///         Creditcoin is recoverable by the payer after RECLAIM_DELAY.
contract GageDeal {
    struct Payment {
        address payer;
        uint96 amount;
        bytes32 ref;
        uint64 paidAt;
        bool reclaimed;
    }

    struct Deal {
        uint256 total;
        Payment[] payments;
    }

    uint256 public constant RECLAIM_DELAY = 3 days;

    uint256 public nextDealId = 1;

    mapping(uint256 => Deal) private _deals;

    event DealRegistered(uint256 indexed dealId);
    event PaymentMade(uint256 indexed dealId, address indexed payer, uint256 amount, bytes32 ref);
    event PaymentReclaimed(uint256 indexed dealId, address indexed payer, uint256 amount);

    error ZeroPayment();
    error NotPayer();
    error AlreadyReclaimed();
    error ReclaimTooEarly();

    /// @notice Reserve a deal id on the source side. Mirrors the id the maker
    ///         received from GageSettlement.open on Creditcoin.
    function registerDeal() external returns (uint256 dealId) {
        dealId = nextDealId++;
        emit DealRegistered(dealId);
    }

    /// @notice Escrow the Ethereum-side payment for a deal opened on Creditcoin.
    function pay(uint256 dealId, bytes32 ref) external payable {
        if (msg.value == 0) revert ZeroPayment();
        Deal storage d = _deals[dealId];
        d.total += msg.value;
        d.payments.push(
            Payment({payer: msg.sender, amount: uint96(msg.value), ref: ref, paidAt: uint64(block.timestamp), reclaimed: false})
        );
        emit PaymentMade(dealId, msg.sender, msg.value, ref);
    }

    /// @notice Safety valve: a payer recovers funds if the Creditcoin side never
    ///         settles (deal cancelled, never opened, or permanently stuck).
    function reclaim(uint256 dealId, uint256 paymentIndex) external {
        Deal storage d = _deals[dealId];
        if (paymentIndex >= d.payments.length) revert NotPayer();
        Payment storage p = d.payments[paymentIndex];
        if (p.payer != msg.sender) revert NotPayer();
        if (p.reclaimed) revert AlreadyReclaimed();
        if (block.timestamp < p.paidAt + RECLAIM_DELAY) revert ReclaimTooEarly();
        p.reclaimed = true;
        d.total -= p.amount;
        (bool sent, ) = msg.sender.call{value: p.amount}("");
        require(sent, "reclaim transfer failed");
        emit PaymentReclaimed(dealId, msg.sender, p.amount);
    }

    function dealTotal(uint256 dealId) external view returns (uint256) {
        return _deals[dealId].total;
    }

    function paymentCount(uint256 dealId) external view returns (uint256) {
        return _deals[dealId].payments.length;
    }

    function payments(uint256 dealId, uint256 index)
        external
        view
        returns (address payer, uint96 amount, bytes32 ref, uint64 paidAt, bool reclaimed)
    {
        Payment storage p = _deals[dealId].payments[index];
        return (p.payer, p.amount, p.ref, p.paidAt, p.reclaimed);
    }
}
