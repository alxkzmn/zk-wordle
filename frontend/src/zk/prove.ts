import feathers from '@feathersjs/client'
import rest from '@feathersjs/rest-client'
import axios from 'axios'

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

export interface PlonkProof {
  proof: Proof
  publicSignals: string[]
}

export const requestProof = async (asciiGuess: number[]): Promise<number[]> => {
  console.log(`Guess: ${asciiGuess}`)

  const feathersClient = feathers()
  //TODO prepare for deployment
  const restClient = rest('http://localhost:3030')

  feathersClient.configure(restClient.axios(axios))

  let result: PlonkProof
  try {
    result = await feathersClient.service('clue').create({ guess: asciiGuess })
    console.log(result)
  } catch (e) {
    throw Error(e as any)
  }

  return result.publicSignals.slice(0, 5).map((ascii) => Number(ascii))
}
