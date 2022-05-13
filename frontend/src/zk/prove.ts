const CIRCUIT_WASM_PATH = '/zk/wordle.wasm'
const CIRCUIT_ZKEY_PATH = '/zk/wordle_final.zkey'

export const generateProof = async (
  asciiGuess: number[],
  asciiSolution: number[],
  greens: number[],
  yellows: number[]
): Promise<void> => {
  console.log(`Guess: ${asciiGuess}`)
  console.log(`Greens: ${greens}`)
  console.log(`Yellows: ${yellows}`)
  await window.snarkjs.groth16.fullProve(
    {
      word: asciiSolution,
      guess: asciiGuess,
      greens: greens,
      yellows: yellows,
    },
    CIRCUIT_WASM_PATH,
    CIRCUIT_ZKEY_PATH
  )
  console.log('Proven!')
}
