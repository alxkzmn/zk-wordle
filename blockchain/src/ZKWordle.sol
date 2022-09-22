pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

interface Verifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[11] memory input
    ) external view returns (bool);
}

contract ZKWordle is Ownable {
    using ECDSA for bytes32;

    address signer = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    mapping(uint256 => uint256) public solutionCommitment;
    Verifier guessVerifier;
    Verifier statsVerifier;

    constructor(
        address _guessVerifier,
        address _statsVerifier,
        address _signer
    ) {
        guessVerifier = Verifier(_guessVerifier);
        statsVerifier = Verifier(_statsVerifier);
        signer = _signer;
    }

    function commitSolution(
        uint256 _solutionIndex,
        uint256 _solution,
        bytes memory _signature
    ) external {
        bytes32 hash = hashTransaction(_solutionIndex, _solution);
        require(
            solutionCommitment[_solutionIndex] == 0,
            "Solution already committed"
        );
        require(matchSignerAdmin(hash, _signature), "Signature mismatch");
        _commitSolution(_solutionIndex, _solution);
    }

    function _commitSolution(uint256 _solutionIndex, uint256 _solution)
        internal
    {
        solutionCommitment[_solutionIndex] = _solution;
    }

    function verifyClues(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[11] memory input
    ) public view returns (bool) {
        return guessVerifier.verifyProof(a, b, c, input);
    }

    function verifyStats(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[11] memory input
    ) public view returns (bool) {
        return statsVerifier.verifyProof(a, b, c, input);
    }

    function setSignerAddress(address _newSigner) external onlyOwner {
        signer = _newSigner;
    }

    function hashTransaction(uint256 _solutionIndex, uint256 _solution)
        public
        pure
        returns (bytes32)
    {
        bytes32 _hash = keccak256(abi.encode(_solutionIndex, _solution));
        return _hash.toEthSignedMessageHash();
    }

    function matchSignerAdmin(bytes32 _payload, bytes memory _signature)
        public
        view
        returns (bool)
    {
        return signer == _payload.recover(_signature);
    }
}
