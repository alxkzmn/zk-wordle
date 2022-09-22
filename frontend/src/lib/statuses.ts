import { asAsciiArray } from './asAsciiArray'
import { Groth16Proof, requestProof } from './../zk/prove'
import { unicodeSplit } from './words'
import { Application } from '@feathersjs/feathers'

export type CharStatus = 'absent' | 'present' | 'correct'

export const getStatuses = (
  guesses: string[],
  statuses: Map<string, CharStatus[]>
): { [key: string]: CharStatus } => {
  const charObj: { [key: string]: CharStatus } = {}

  guesses.forEach((guess) => {
    let status = statuses.get(guess) ?? []
    unicodeSplit(guess).forEach((letter, i) => {
      if (status[i] === 'correct') charObj[letter] = 'correct'
      if (!charObj[letter] && status[i] === 'present')
        charObj[letter] = 'present'
      if (!charObj[letter]) charObj[letter] = 'absent'
    })
  })

  return charObj
}

export interface StatusesAndProof {
  statuses: CharStatus[]
  proof: Groth16Proof
}

export const getGuessStatuses = async (
  feathersClient: Application,
  guess: string
): Promise<StatusesAndProof> => {
  return requestProof(feathersClient, asAsciiArray(guess)).then((proof) => {
    let clue = proof.publicSignals.slice(0, 5).map((ascii) => Number(ascii))
    return {
      statuses: Array.from(
        clue
          .map((status) =>
            status === 0 ? 'absent' : status === 1 ? 'correct' : 'present'
          )
          .values()
      ),
      proof: proof,
    }
  })
}
