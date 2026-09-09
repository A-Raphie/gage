// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {GageDeal} from "../src/GageDeal.sol";

contract DeploySepolia is Script {
    function run() external returns (GageDeal gageDeal) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        gageDeal = new GageDeal();
        vm.stopBroadcast();
        console2.log("GageDeal deployed at", address(gageDeal));
    }
}
