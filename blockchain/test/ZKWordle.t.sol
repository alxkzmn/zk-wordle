// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ZKWordle.sol";
import "../src/check_guess.sol";
import "../src/check_stats.sol";

contract VerifierTest is Test {
    address constant DEFAULT_SIGNER =
        0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address constant NEW_SIGNER = 0xF39fD6e51Aad88F6f4CE6AB8827279CFffb92267;
    //Forge deployer, see https://book.getfoundry.sh/forge/writing-tests for reference
    address constant DEPLOYER = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
    ZKWordle public zkWordle;
    GuessVerifier public guessVerifier;
    StatsVerifier public statsVerifier;

    function setUp() public {
        guessVerifier = new GuessVerifier();
        statsVerifier = new StatsVerifier();
        zkWordle = new ZKWordle(
            address(guessVerifier),
            address(statsVerifier),
            DEPLOYER
        );
    }

    function testSignerChange() public {
        zkWordle.setSigner(NEW_SIGNER);
        vm.prank(address(0));
        vm.expectRevert("Ownable: caller is not the owner");
        zkWordle.setSigner(DEPLOYER);
    }

    function testCommitmentWithWrongSignatureNotMade() public {
        bytes
            memory dummySignature = hex"1cf53d2ab3c22d43becf449b21978fbb8d160df0d9eeecb3f6e66dbf5ec132fc302e031ec65b59a34cb4ac0720b4f5d97637cf5171e0712f7001fb89469b76871c";
        vm.expectRevert("Signature mismatch");
        zkWordle.commitSolution(
            1,
            0x5201afa16d758c3e75e63639fb20371463d34973b5d9d04cf20d12c80b11979,
            dummySignature
        );
    }

    function testCommitmentMade() public {
        zkWordle.setSigner(DEFAULT_SIGNER);
        assertEq(zkWordle.solutionCommitment(269), 0);
        bytes
            memory signature = hex"1cf53d2ab3c22d43becf449b21978fbb8d160df0d9eeecb3f6e66dbf5ec132fc302e031ec65b59a34cb4ac0720b4f5d97637cf5171e0712f7001fb89469b76871c";
        zkWordle.commitSolution(
            269,
            2318289536786382509651858531288693186368073365867419991124997557363993024889,
            signature
        );
        assertEq(
            zkWordle.solutionCommitment(269),
            2318289536786382509651858531288693186368073365867419991124997557363993024889
        );
    }

    function testGuessVerified() public {
        assertEq(
            zkWordle.verifyClues(
                [
                    2129687194795867968006967515041007785934044452952050877498151689790762668813,
                    4659446366458619975187937442535888644804526490563369374839107478524455225940
                ],
                [
                    [
                        4687978534181292353714354484544244982664077573227074934397088608926561457370,
                        3758361400296785606805990361406388590231945719858290498991471290600796461392
                    ],
                    [
                        21733610163656725103082645438776870226283543882840358231835223117009124437413,
                        18201434579992038494193446832660243705307882861699268814817312529016742994746
                    ]
                ],
                [
                    21741109911522375072463394811344229741426969275354605739908542122052590624395,
                    14285313199406863956784005156298227536725647389977686558301124713583278901502
                ],
                [
                    2,
                    0,
                    2,
                    2,
                    0,
                    83,
                    84,
                    65,
                    82,
                    84,
                    12712306925672885864262427677183129153604184585548733491246491168260041610099
                ]
            ),
            true
        );
    }

    function testWrongGuessNotVerified() public {
        uint256 o = 0;
        uint256[11] memory input;
        for (uint256 i = 0; i < 11; i++) {
            input[i] = 0;
        }
        assertEq(
            zkWordle.verifyClues([o, o], [[o, o], [o, o]], [o, o], input),
            false
        );
    }

    function testStatsVerified() public {
        assertEq(
            zkWordle.verifyStats(
                [
                    1798977333436471117382024826469814851138758551221354393508916101069409399542,
                    14924595529700676805989765089208688211438235032036457115293376458283675988746
                ],
                [
                    [
                        7485299579872628514350836707902657723638531788673458541475739811263838575180,
                        3014478729772173852838655120797605364421127624916045766073312053546987411501
                    ],
                    [
                        1588525158811465386764102811943691554067841456782838273758680779102146702100,
                        2296273619629026851578569836381070553323654537892862911695837229412590962388
                    ]
                ],
                [
                    12386820492295888712550011536338157983564086210731308306105953460027456963137,
                    14478000093748443130776078322509905711658887159161800376218655455467008171923
                ],
                [
                    0,
                    1,
                    0,
                    0,
                    0,
                    2,
                    1,
                    1,
                    0,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    12712306925672885864262427677183129153604184585548733491246491168260041610099
                ]
            ),
            true
        );
    }

    function testWrongStatsNotVerified() public {
        uint256 o = 0;
        uint256[31] memory input;
        for (uint256 i = 0; i < 31; i++) {
            input[i] = 0;
        }
        assertEq(
            zkWordle.verifyStats([o, o], [[o, o], [o, o]], [o, o], input),
            false
        );
    }
}
