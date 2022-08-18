pragma solidity ^0.8.13;

import "./verifier.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract ZKWordle is PlonkVerifier, Ownable {
    mapping(uint256 => uint256) public solutionCommitment;

    function commitSolution(uint256 solutionIndex, uint256 solution)
        public
        onlyOwner
    {
        solutionCommitment[solutionIndex] = solution;
    }
}
