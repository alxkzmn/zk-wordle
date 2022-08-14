import { asAsciiArray } from './asAsciiArray'
import { requestProof } from './../zk/prove'
import { unicodeSplit } from './words'

export type CharStatus = 'absent' | 'present' | 'correct'

export const getStatuses = (
  guesses: string[],
  statuses: Map<string, CharStatus[]>
): { [key: string]: CharStatus } => {
  const charObj: { [key: string]: CharStatus } = {}

  guesses.forEach((guess) => {
    let status = statuses.get(guess) ?? []
    unicodeSplit(guess).forEach((letter, i) => {
      if (status[i] == 'correct') charObj[letter] = 'correct'
      if (!charObj[letter] && status[i] == 'present')
        charObj[letter] = 'present'
      if (!charObj[letter]) charObj[letter] = 'absent'
    })
  })

  return charObj
}

export const getGuessStatuses = async (
  guess: string
): Promise<CharStatus[]> => {
  return requestProof(asAsciiArray(guess)).then((proof) =>
    Array.from(
      proof
        .map((status) =>
          status == 0 ? 'absent' : status == 1 ? 'correct' : 'present'
        )
        .values()
    )
  )
}
