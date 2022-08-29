import { CharStatus } from '../../lib/statuses'
import { Cell } from './Cell'
import { unicodeSplit } from '../../lib/words'
import { ShieldCheckIcon } from '@heroicons/react/outline'
import { GUESS_WAS_VERIFIED } from '../../constants/strings'

type Props = {
  guess: string
  status: CharStatus[]
  isRevealing?: boolean
  guessProven: boolean
}

export const CompletedRow = ({
  guess,
  status,
  isRevealing,
  guessProven,
}: Props) => {
  const splitGuess = unicodeSplit(guess)
  return (
    <div className="flex justify-center mb-1">
      {splitGuess.map((letter, i) => (
        <Cell
          key={i}
          value={letter}
          status={status[i]}
          position={i}
          isRevealing={isRevealing}
          isCompleted
        />
      ))}
      {guessProven && (
        <div title={GUESS_WAS_VERIFIED} className="p-2">
          <ShieldCheckIcon className="h-6 w-6 cursor-pointer dark:stroke-white" />
        </div>
      )}
    </div>
  )
}
