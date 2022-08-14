import feathers from '@feathersjs/client'
import rest from '@feathersjs/rest-client'
import axios from 'axios'

interface Result {
  proof: number[]
  hash: number
}

export const requestProof = async (asciiGuess: number[]): Promise<number[]> => {
  console.log(`Guess: ${asciiGuess}`)

  const feathersClient = feathers()
  //TODO prepare for deployment
  const restClient = rest('http://localhost:3030')

  feathersClient.configure(restClient.axios(axios))

  let result: Result
  try {
    result = await feathersClient.service('clue').create({ guess: asciiGuess })
    console.log(result)
  } catch (e) {
    throw Error(e as any)
  }

  return result.proof
}
