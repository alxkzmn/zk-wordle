#!/bin/bash

cd circuits
if [ -f ./powers-of-tau/powersOfTau28_hez_final_12.ptau ]; then
    echo "powersOfTau28_hez_final_12.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_12.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O ./powers-of-tau/powersOfTau28_hez_final_12.ptau
fi

echo "Compiling circuit.circom..."
find ./src -type f -name "*.circom" -maxdepth 1
for circuit in `find ./src -type f -name "*.circom" -maxdepth 1`; do
    name=`basename $circuit .circom`
    # compile circuit
    circom ./src/${name}.circom --r1cs --wasm --sym --output compiled
    snarkjs r1cs info compiled/${name}.r1cs
    cp compiled/${name}_js/${name}.wasm ./../backend/src/zk/${name}.wasm

    # Create and export the zkey

    snarkjs groth16 setup compiled/${name}.r1cs powers-of-tau/powersOfTau28_hez_final_12.ptau compiled/${name}_0000.zkey
    snarkjs zkey contribute compiled/${name}_0000.zkey compiled/${name}_final.zkey --name="1st Contributor Name" -v
    cp compiled/${name}_final.zkey ./../backend/src/zk/${name}_final.zkey
    cd compiled
    snarkjs zkey export verificationkey ${name}_final.zkey ${name}_verification_key.json

    # generate solidity contract
    snarkjs zkey export solidityverifier ${name}_final.zkey ./../../blockchain/src/${name}.sol
    cd ..
done
cd ..