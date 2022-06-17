const CIRCUIT_WASM_PATH = '/zk/wordle.wasm'
const CIRCUIT_ZKEY_PATH = '/zk/wordle_final.zkey'

export interface SnarkJSProof {
  pi_a: [string, string, string]
  pi_b: [[string, string], [string, string], [string, string]]
  pi_c: [string, string, string]
}

export interface SnarkJSProofAndSignals {
  proof: SnarkJSProof
  publicSignals: number[]
}

export const generateProof = async (
  asciiGuess: number[],
  asciiSolution: number[]
): Promise<number[]> => {
  console.log(`Guess: ${asciiGuess}`)
  let proof = (await window.snarkjs.groth16.fullProve(
    {
      solution: asciiSolution,
      guess: asciiGuess,
    },
    CIRCUIT_WASM_PATH,
    CIRCUIT_ZKEY_PATH
  )) as SnarkJSProofAndSignals
  console.log(`Proof generated`)
  console.log(proof)
  return proof.publicSignals.slice(0, 5)
}
