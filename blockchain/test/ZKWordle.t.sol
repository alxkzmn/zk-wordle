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
        uint256[] memory publicSignals = new uint256[](31);
        uint256[11] memory publicSignalsFixed = [
            0,
            1,
            0,
            0,
            0,
            86,
            65,
            71,
            85,
            69,
            12712306925672885864262427677183129153604184585548733491246491168260041610099
        ];
        for (uint256 i = 0; i < 11; i++) {
            publicSignals[i] = publicSignalsFixed[i];
        }
        assertEq(
            zkWordle.verifyClues(
                hex"2472645a1eba4c85f0de16429a8d6cc1efe33367511671e2cdf67ebdcd29d38b233d02ebd1fd1d4d1474919bff9dccef4f12e1e0f3269c98756437a9c2a11e291557a4610fca5c19a87f58d44aa2b4292b584d3600ab4da255194d70df5dc0ac2b2117f033991ddf75d5922620c5342e5defd1c90efcd11d3b50e9551949fc3e05181bc03c964adccade0e73ece12675dc4bdc7ce7aff5d525548c249e166ab2233fac3f1e277752480d7740fa8136e4ee359d50c35df7cbd3d9ad420fd00b2a03f4f0f17fa4a1798a8796edfcf9729ed83b104ee53cd81efaebf418e71b7bbe13d5ad1ce25a258cd636661847e75c2dcd080df515a36d2f0ac7337ce8ee5d461a6943fdceeddb9bc1c3ae4105e8ce7f1922ffc4d9ef27fa4de843fbc58375111e64fd46c1ac9187a57a5dce5284c7fb58f27acbeba5803df1d7060791ab62c30eecdc6cdeb63b960137842fc3729f865bd61ab6aa8786d4784eb4504b751a880f878e549dc9025cabac2a279184104cea06f86e70d44f73fa57e0180ecd368e30366f94a1ecd1b01ac5c3529fca49585e856f7838a9c0e421c3c51abfe8d24f061a73d06d8a4c4e9570815251271606918d76369204fbbbbcbdd8ba824051c219506101fb50da3d7a1e75409b3ef4175ac1897ee91de9451aa9ce707039f18306161b8ba151963f25a11d94eaa8219ce87866851aceeb95f3faf0e69fb99e811c15dafa1605caf19b3e01e83cfdaee75c9a0b09d80d576c4c03bb813fc2a74611d1aae6019c77a6cd6b04595ce5bd31aa9fcf15f688c4f81350ed3596b2b86f0afdd7e565bbe562f500c2791dfa39191d246bb264e110fba66a8a0d6b756951068447267c9f68cdcbbbbbe3a6357e53957a2ad9f1b8b20a4f37a93898b224f61f1f7bedd46f9c0760c6d993d4e007796864c6498e01497cabd1b5a3458933e00c920f25eee666270ecfd47e7bab657778840f0d7f530bf827fdfaa9f754b4c410e3f4e5c0dd7e126ef8c350eef274f9b093531221e4fd01aac206a50a0d303d1ced454c8fba98e4533c0ba5226ae6b61b7a15b4b89309c6d9df4c1e1854231304ab8b819f18ed7b9ff0b3837b96fff017d725db45d0a3be5e72872eba8aed79",
                publicSignals
            ),
            true
        );
    }

    function testWrongGuessNotVerified() public {
        uint256[] memory publicSignals = new uint256[](31);
        uint256[11] memory publicSignalsFixed = [
            1,
            1,
            1,
            1,
            1,
            86,
            65,
            71,
            85,
            69,
            12712306925672885864262427677183129153604184585548733491246491168260041610099
        ];
        for (uint256 i = 0; i < 11; i++) {
            publicSignals[i] = publicSignalsFixed[i];
        }
        assertEq(
            zkWordle.verifyClues(
                hex"2472645a1eba4c85f0de16429a8d6cc1efe33367511671e2cdf67ebdcd29d38b233d02ebd1fd1d4d1474919bff9dccef4f12e1e0f3269c98756437a9c2a11e291557a4610fca5c19a87f58d44aa2b4292b584d3600ab4da255194d70df5dc0ac2b2117f033991ddf75d5922620c5342e5defd1c90efcd11d3b50e9551949fc3e05181bc03c964adccade0e73ece12675dc4bdc7ce7aff5d525548c249e166ab2233fac3f1e277752480d7740fa8136e4ee359d50c35df7cbd3d9ad420fd00b2a03f4f0f17fa4a1798a8796edfcf9729ed83b104ee53cd81efaebf418e71b7bbe13d5ad1ce25a258cd636661847e75c2dcd080df515a36d2f0ac7337ce8ee5d461a6943fdceeddb9bc1c3ae4105e8ce7f1922ffc4d9ef27fa4de843fbc58375111e64fd46c1ac9187a57a5dce5284c7fb58f27acbeba5803df1d7060791ab62c30eecdc6cdeb63b960137842fc3729f865bd61ab6aa8786d4784eb4504b751a880f878e549dc9025cabac2a279184104cea06f86e70d44f73fa57e0180ecd368e30366f94a1ecd1b01ac5c3529fca49585e856f7838a9c0e421c3c51abfe8d24f061a73d06d8a4c4e9570815251271606918d76369204fbbbbcbdd8ba824051c219506101fb50da3d7a1e75409b3ef4175ac1897ee91de9451aa9ce707039f18306161b8ba151963f25a11d94eaa8219ce87866851aceeb95f3faf0e69fb99e811c15dafa1605caf19b3e01e83cfdaee75c9a0b09d80d576c4c03bb813fc2a74611d1aae6019c77a6cd6b04595ce5bd31aa9fcf15f688c4f81350ed3596b2b86f0afdd7e565bbe562f500c2791dfa39191d246bb264e110fba66a8a0d6b756951068447267c9f68cdcbbbbbe3a6357e53957a2ad9f1b8b20a4f37a93898b224f61f1f7bedd46f9c0760c6d993d4e007796864c6498e01497cabd1b5a3458933e00c920f25eee666270ecfd47e7bab657778840f0d7f530bf827fdfaa9f754b4c410e3f4e5c0dd7e126ef8c350eef274f9b093531221e4fd01aac206a50a0d303d1ced454c8fba98e4533c0ba5226ae6b61b7a15b4b89309c6d9df4c1e1854231304ab8b819f18ed7b9ff0b3837b96fff017d725db45d0a3be5e72872eba8aed79",
                publicSignals
            ),
            false
        );
    }

    function testStatsVerified() public {
        uint256[] memory publicSignals = new uint256[](31);
        uint256[31] memory publicSignalsFixed = [
            2,
            0,
            2,
            2,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            1,
            2,
            0,
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
            12712306925672885864262427677183129153604184585548733491246491168260041610099
        ];
        for (uint256 i = 0; i < 31; i++) {
            publicSignals[i] = publicSignalsFixed[i];
        }
        assertEq(
            zkWordle.verifyStats(
                hex"1df48af2cf8004005a8ddc3f60274dd19b963cd01a7a43baea359a294a5148361f6fe6f07298f765d8c86fe3663d6cc896744bdb6b93e3eea17c1d069a51736623a74d389dc767d83df002ef9a87fc5d16cb1bfe51a40defb26cb6dab06298f82be785411e609aeee0869c9c66af94beb681c99b39b3420b8d95b6d720f2165f17a1b76366a1323e7169113a7892607b69ec6b6c49cf9f7f9447ea7098c921b720e7466017231675aecdd18a371264c13bf42bd0e1a09fc32453add4c1befc5612c20f296de83b6ee6b97236502309c56125ce4d15d39f97454b06a4fccca0d21da2f28420b8f48b5fd6e7fe1c54f8057bd71bb6950796cb67559ae4d041bca31c4b4bb9c14e703ea9389dc15eff6ef4a99f2aa81ad55d3b397d8d2a2afd0c24053593ed1dc0e6d5ff94e217cc0e6fc222d172c8a03c1601e41fbacba90c82e1134a0e53ebb421fe6f5942ca1992e7432862ea5eba12a7208f70b01ce048810911333af8a788790747f96c7f620dbddaabcfc61b1ab198a8fc1400e9439ef52609858355fcd5ee764e14ec3d3e167b39237a044c70590b1cf1ee957eb37ffb1b01e748619cd638524773f725c08ae2ed1e665630367cb8428cdd55e216c4e0361c25691d05228b68fc4b5a55a5abf72a89369b504722a87360978ec9f0aded4e0fe5c61c442a5aa87781636f6dca4c0beb476326a97dc6b8cbf9d0da2aad4fe90064211510c5973485cfceba9dd71183b23b577ccf36e1c6665c469d96e1c929201bf0d2c4409bc6a7f7509294f464fe3406255da04d31e24e160b2f44e31dac2853196f3e1c0b946675bdaf98647fafea802c35edcdd641db573d0894b1e1d123cc721fd3c10206d19ec19c76ca7e743c54b9b46b69d7e47987d80ab9749fd81b36f9d5390cde4dcb612433289b72ab5cb2b69977891026478900bebbac10520220ee37f2e5c4bde9dcbce8e552a6902b87c7711b5aa6aba9d5bf37b9a1c79e10e183565a7b6986212512ce2983dc6423c05759a0ef8c24854cab23fb3fbcf016bbdcbbc57087f6a415ae24451f2465e058530686fc2de1a9957117c1cbb52a027ccd0a41d661ab6ccb1b6c4d29f3a3cdda7b73b3b278e595626694a522418d",
                publicSignals
            ),
            true
        );
    }

    function testWrongStatsNotVerified() public {
        uint256[] memory publicSignals = new uint256[](31);
        uint256[31] memory publicSignalsFixed = [
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
        ];
        for (uint256 i = 0; i < 31; i++) {
            publicSignals[i] = publicSignalsFixed[i];
        }
        assertEq(
            zkWordle.verifyStats(
                hex"1df48af2cf8004005a8ddc3f60274dd19b963cd01a7a43baea359a294a5148361f6fe6f07298f765d8c86fe3663d6cc896744bdb6b93e3eea17c1d069a51736623a74d389dc767d83df002ef9a87fc5d16cb1bfe51a40defb26cb6dab06298f82be785411e609aeee0869c9c66af94beb681c99b39b3420b8d95b6d720f2165f17a1b76366a1323e7169113a7892607b69ec6b6c49cf9f7f9447ea7098c921b720e7466017231675aecdd18a371264c13bf42bd0e1a09fc32453add4c1befc5612c20f296de83b6ee6b97236502309c56125ce4d15d39f97454b06a4fccca0d21da2f28420b8f48b5fd6e7fe1c54f8057bd71bb6950796cb67559ae4d041bca31c4b4bb9c14e703ea9389dc15eff6ef4a99f2aa81ad55d3b397d8d2a2afd0c24053593ed1dc0e6d5ff94e217cc0e6fc222d172c8a03c1601e41fbacba90c82e1134a0e53ebb421fe6f5942ca1992e7432862ea5eba12a7208f70b01ce048810911333af8a788790747f96c7f620dbddaabcfc61b1ab198a8fc1400e9439ef52609858355fcd5ee764e14ec3d3e167b39237a044c70590b1cf1ee957eb37ffb1b01e748619cd638524773f725c08ae2ed1e665630367cb8428cdd55e216c4e0361c25691d05228b68fc4b5a55a5abf72a89369b504722a87360978ec9f0aded4e0fe5c61c442a5aa87781636f6dca4c0beb476326a97dc6b8cbf9d0da2aad4fe90064211510c5973485cfceba9dd71183b23b577ccf36e1c6665c469d96e1c929201bf0d2c4409bc6a7f7509294f464fe3406255da04d31e24e160b2f44e31dac2853196f3e1c0b946675bdaf98647fafea802c35edcdd641db573d0894b1e1d123cc721fd3c10206d19ec19c76ca7e743c54b9b46b69d7e47987d80ab9749fd81b36f9d5390cde4dcb612433289b72ab5cb2b69977891026478900bebbac10520220ee37f2e5c4bde9dcbce8e552a6902b87c7711b5aa6aba9d5bf37b9a1c79e10e183565a7b6986212512ce2983dc6423c05759a0ef8c24854cab23fb3fbcf016bbdcbbc57087f6a415ae24451f2465e058530686fc2de1a9957117c1cbb52a027ccd0a41d661ab6ccb1b6c4d29f3a3cdda7b73b3b278e595626694a522418d",
                publicSignals
            ),
            false
        );
    }
}
