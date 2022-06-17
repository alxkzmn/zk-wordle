import { CharStatus } from '../../lib/statuses'
import { Cell } from './Cell'
import { unicodeSplit } from '../../lib/words'

type Props = {
  guess: string
  status: CharStatus[]
  isRevealing?: boolean
}

export const CompletedRow = ({ guess, status, isRevealing }: Props) => {
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
    </div>
  )
}
