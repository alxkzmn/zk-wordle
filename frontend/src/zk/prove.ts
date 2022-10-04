import { Application } from '@feathersjs/feathers'

interface Proof {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
  protocol: string
  curve: string
}

export interface Groth16Proof {
  proof: Proof
  publicSignals: string[]
}

export const requestProof = async (
  feathersClient: Application,
  asciiGuess: number[]
): Promise<Groth16Proof> => {
  console.log(`Guess: ${asciiGuess}`)

  let result: Groth16Proof
  try {
    result = await feathersClient.service('clue').create({ guess: asciiGuess })
    console.log(result)
  } catch (e) {
    throw Error(e as any)
  }

  return result
}
