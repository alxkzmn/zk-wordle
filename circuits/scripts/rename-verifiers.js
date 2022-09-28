const fs = require('fs');

const verifierRegex = /contract PlonkVerifier/;

let guessVerifier = fs.readFileSync('./blockchain/src/check_guess.sol', {
  encoding: 'utf-8',
});
guessVerifier = guessVerifier.replace(verifierRegex, 'contract GuessVerifier');
fs.writeFileSync('./blockchain/src/check_guess.sol', guessVerifier);

let statsVerifier = fs.readFileSync('./blockchain/src/check_stats.sol', {
  encoding: 'utf-8',
});
statsVerifier = statsVerifier.replace(verifierRegex, 'contract StatsVerifier');
fs.writeFileSync('./blockchain/src/check_stats.sol', statsVerifier);
