// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ZKWordle.sol";
import "../src/check_guess.sol";
import "../src/check_stats.sol";
import "forge-std/console.sol";

contract ZKWordleScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        GuessVerifier guessVerifier = new GuessVerifier();
        StatsVerifier statsVerifier = new StatsVerifier();
        ZKWordle zkWordle = new ZKWordle(
            address(guessVerifier),
            address(statsVerifier)
        );

        _copyBroadcast();

        vm.stopBroadcast();
    }

    function _copyBroadcast() internal {
        string[] memory inputs = new string[](1);
        inputs[0] = "script/copy-broadcast.sh";
        vm.ffi(inputs);
    }
}
