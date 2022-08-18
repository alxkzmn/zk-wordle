// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ZKWordle.sol";
import "forge-std/console.sol";

contract ZKWordleScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        ZKWordle zkWordle = new ZKWordle();
        vm.stopBroadcast();
    }
}
