// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/check_guess.sol";

contract VerifierTest is Test {
    GuessVerifier public verifier;

    function setUp() public {
        verifier = new GuessVerifier();
        //verifier.setNumber(0);
    }

    function testIncrement() public {
        //verifier.increment();
        //assertEq(verifier.number(), 1);
    }

    function testSetNumber(uint256 x) public {
        //verifier.setNumber(x);
        //assertEq(verifier.number(), x);
    }
}
