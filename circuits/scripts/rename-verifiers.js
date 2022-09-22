const fs = require("fs");

const verifierRegex = /contract Verifier/;
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;
const pairingRegex = "Pairing";

let guessVerifier = fs.readFileSync("./blockchain/src/check_guess.sol", {
  encoding: "utf-8",
});
guessVerifier = guessVerifier.replace(solidityRegex, "pragma solidity ^0.8.13");
guessVerifier = guessVerifier.replace(verifierRegex, "contract GuessVerifier");
fs.writeFileSync("./blockchain/src/check_guess.sol", guessVerifier);

let statsVerifier = fs.readFileSync("./blockchain/src/check_stats.sol", {
  encoding: "utf-8",
});
statsVerifier = statsVerifier.replace(solidityRegex, "pragma solidity ^0.8.13");
statsVerifier = statsVerifier.replace(verifierRegex, "contract StatsVerifier");
statsVerifier = statsVerifier.replaceAll(pairingRegex, "Pairing2");
fs.writeFileSync("./blockchain/src/check_stats.sol", statsVerifier);
