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
                    2501625963316221594569651861327214532182685311642155744785158552805886512236,
                    3455587665436402821877453999824012867736249530018528010421751070449004530096
                ],
                [
                    [
                        2599531899714411074363550744291454018650986191753148434395695071384108019264,
                        17705910302977105040428107910338065656305129380431550066529393114485728936693
                    ],
                    [
                        9014477152125893956843414711021735327217985984703961742401768286921592894697,
                        16029579476764930705899562364169888828876616601856110140286369168520348993295
                    ]
                ],
                [
                    564833829534579739059902004016968169146112667169141861706512551630849137906,
                    1771915337349019436092979143533663833996020705391081442935389188160509339564
                ],
                [
                    0,
                    0,
                    0,
                    2,
                    0,
                    83,
                    84,
                    65,
                    82,
                    84,
                    2318289536786382509651858531288693186368073365867419991124997557363993024889
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
                    5767126564365512884223491461224409809571281469032447307396504423665969421718,
                    4267018916170249872748202107547273171607850162630532652584718314067898340441
                ],
                [
                    [
                        9105937366062006991923585747698255680089187389390090319349331264478003931683,
                        4077050039271010101099114327502367196738221198907062193659452812636869794645
                    ],
                    [
                        16133660315017623490956733314888100685339950101619941055441064945895169129965,
                        7595314488205438506121303975158296215367698224768644925887201295266122205214
                    ]
                ],
                [
                    2742556603219050655698251237535008175990046118424149936657435142357240204796,
                    98202783822895482439046081684252520381823230755823992753716584310654514138
                ],
                [
                    0,
                    0,
                    0,
                    2,
                    0,
                    2,
                    0,
                    0,
                    0,
                    2,
                    2,
                    0,
                    0,
                    2,
                    1,
                    0,
                    2,
                    0,
                    1,
                    1,
                    1,
                    0,
                    0,
                    1,
                    1,
                    1,
                    0,
                    1,
                    1,
                    1,
                    83,
                    84,
                    65,
                    82,
                    84,
                    82,
                    73,
                    78,
                    83,
                    69,
                    69,
                    82,
                    82,
                    79,
                    82,
                    80,
                    79,
                    75,
                    69,
                    82,
                    79,
                    70,
                    70,
                    69,
                    82,
                    79,
                    82,
                    68,
                    69,
                    82,
                    2318289536786382509651858531288693186368073365867419991124997557363993024889
                ]
            ),
            true
        );
    }

    function testWrongStatsNotVerified() public {
        uint256 o = 0;
        uint256[61] memory input;
        for (uint256 i = 0; i < 61; i++) {
            input[i] = 0;
        }
        assertEq(
            zkWordle.verifyStats([o, o], [[o, o], [o, o]], [o, o], input),
            false
        );
    }
}
