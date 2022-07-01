# ZK-Wordle

Wordle game implemented using the Zero-Knowledge Proofs

## Compile the circuit and generate the reference zKey

```
npm run compile
```

Powers of Tau files are copied from here: https://github.com/iden3/snarkjs#7-prepare-phase-2

## Carry out phase 2 of the ceremony

```
npm run phase2
```

## Generate the witness

Copy `example.input.json` into `circuits/wordle_js` dir and rename it to `input.json`. Run

```
cd wordle_js
node generate_witness.js wordle.wasm input.json witness.wtns
```

## Powers of Tau ceremony

Return to home dir

```
cd ../..
```

Conduct the powers of Tau ceremony. The initial part of the ceremony is not circuit-specific and you can reuse the generated files if needed.

```
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

This part of the ceremony is circuit-specific (you need to run it after any change to the circuit)

```
snarkjs groth16 setup circuits/wordle.r1cs pot12_final.ptau wordle_0000.zkey
snarkjs zkey contribute wordle_0000.zkey wordle_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey export verificationkey wordle_0001.zkey verification_key.json
```

## Example proof

```
snarkjs groth16 prove wordle_0001.zkey circuits/wordle_js/witness.wtns proof.json public.json
```

## Example verification

```
snarkjs groth16 verify verification_key.json public.json proof.json
```
