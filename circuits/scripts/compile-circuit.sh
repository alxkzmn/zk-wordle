#!/bin/bash

cd circuits
if [ -f ./powers-of-tau/powersOfTau28_hez_final_12.ptau ]; then
    echo "powersOfTau28_hez_final_12.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_12.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O ./powers-of-tau/powersOfTau28_hez_final_12.ptau
fi

echo "Compiling circuit.circom..."

# compile circuit

circom wordle.circom --r1cs --wasm --sym --output compiled
snarkjs r1cs info compiled/wordle.r1cs
cp compiled/wordle_js/wordle.wasm ./../backend/src/zk/wordle.wasm

# Create and export the zkey

snarkjs plonk setup compiled/wordle.r1cs powers-of-tau/powersOfTau28_hez_final_12.ptau compiled/wordle_final.zkey
cp compiled/wordle_final.zkey ./../backend/src/zk/wordle_final.zkey
cd compiled
snarkjs zkey export verificationkey wordle_final.zkey wordle_verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier wordle_final.zkey ./../contracts/verifier.sol

cd ..