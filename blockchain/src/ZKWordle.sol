pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

interface PlonkVerifier {
    function verifyProof(bytes memory proof, uint256[] memory pubSignals)
        external
        view
        returns (bool);
}

contract ZKWordle is Ownable {
    mapping(uint256 => uint256) public solutionCommitment;
    PlonkVerifier guessVerifier;
    PlonkVerifier statsVerifier;

    constructor(address _guessVerifier, address _statsVerifier) {
        guessVerifier = PlonkVerifier(_guessVerifier);
        statsVerifier = PlonkVerifier(_statsVerifier);
    }

    function commitSolution(uint256 solutionIndex, uint256 solution)
        public
        onlyOwner
    {
        solutionCommitment[solutionIndex] = solution;
    }
}
