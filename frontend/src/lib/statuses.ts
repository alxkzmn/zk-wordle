import { asAsciiArray } from './asAsciiArray'
import { generateProof } from './../zk/prove'
import { solution, unicodeSplit } from './words'

export type CharStatus = 'absent' | 'present' | 'correct'

export const getStatuses = (
  guesses: string[]
): { [key: string]: CharStatus } => {
  const charObj: { [key: string]: CharStatus } = {}
  const splitSolution = unicodeSplit(solution)

  guesses.forEach((word) => {
    unicodeSplit(word).forEach((letter, i) => {
      if (!splitSolution.includes(letter)) {
        // make status absent
        return (charObj[letter] = 'absent')
      }

      if (letter === splitSolution[i]) {
        //make status correct
        return (charObj[letter] = 'correct')
      }

      if (charObj[letter] !== 'correct') {
        //make status present
        return (charObj[letter] = 'present')
      }
    })
  })

  return charObj
}

export const getGuessStatuses = async (
  guess: string
): Promise<CharStatus[]> => {
  return generateProof(asAsciiArray(guess), asAsciiArray(solution)).then(
    (proof) =>
      Array.from(
        proof
          .map((status) =>
            status == 0 ? 'absent' : status == 1 ? 'correct' : 'present'
          )
          .values()
      )
  )
}
