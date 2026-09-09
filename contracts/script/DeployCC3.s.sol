// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {GageSettlement} from "../src/GageSettlement.sol";

contract DeployCC3 is Script {
    function run() external returns (GageSettlement gage) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        gage = new GageSettlement();
        vm.stopBroadcast();
        console2.log("GageSettlement deployed at", address(gage));
    }
}
