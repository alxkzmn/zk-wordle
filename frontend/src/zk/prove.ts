import { Application } from '@feathersjs/feathers'

interface Proof {
  A: string[]
  B: string[]
  C: string[]
  Z: string[]
  T1: string[]
  T2: string[]
  T3: string[]
  eval_a: string
  eval_b: string
  eval_c: string
  eval_s1: string
  eval_s2: string
  eval_zw: string
  eval_r: string
  Wxi: string[]
  Wxiw: string[]
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
