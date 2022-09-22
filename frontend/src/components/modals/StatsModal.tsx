import Countdown from 'react-countdown'
import { StatBar } from '../stats/StatBar'
import { Histogram } from '../stats/Histogram'
import { GameStats } from '../../lib/localStorage'
import { shareStatus } from '../../lib/share'
import { tomorrow } from '../../lib/words'
import { BaseModal } from './BaseModal'
import {
  STATISTICS_TITLE,
  GUESS_DISTRIBUTION_TEXT,
  NEW_WORD_TEXT,
  SHARE_TEXT,
} from '../../constants/strings'
import { CharStatus } from '../../lib/statuses'
import LoadingSpinner from '../progress/Spinner'
import { useState } from 'react'
import { MAX_CHALLENGES } from '../../constants/settings'
import { asAsciiArray } from '../../lib/asAsciiArray'
import { Groth16Proof } from '../../zk/prove'
import { Application } from '@feathersjs/feathers'

type Props = {
  isOpen: boolean
  handleClose: () => void
  guesses: string[]
  statuses: Map<string, CharStatus[]>
  gameStats: GameStats
  isGameLost: boolean
  isGameWon: boolean
  handleShareToClipboard: () => void
  isHardMode: boolean
  isDarkMode: boolean
  isHighContrastMode: boolean
  numberOfGuessesMade: number
  feathersClient: Application
}

export const StatsModal = ({
  isOpen,
  handleClose,
  guesses,
  statuses,
  gameStats,
  isGameLost,
  isGameWon,
  handleShareToClipboard,
  isHardMode,
  isDarkMode,
  isHighContrastMode,
  numberOfGuessesMade,
  feathersClient,
}: Props) => {
  const [isProving, setIsProving] = useState(false)

  if (gameStats.totalGames <= 0) {
    return (
      <BaseModal
        title={STATISTICS_TITLE}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <StatBar gameStats={gameStats} />
      </BaseModal>
    )
  }
  return (
    <BaseModal
      title={STATISTICS_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <StatBar gameStats={gameStats} />
      <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
        {GUESS_DISTRIBUTION_TEXT}
      </h4>
      <Histogram
        gameStats={gameStats}
        numberOfGuessesMade={numberOfGuessesMade}
      />
      {(isGameLost || isGameWon) && (
        <div className="mt-5 sm:mt-6 columns-2 dark:text-white">
          <div>
            <h5>{NEW_WORD_TEXT}</h5>
            <Countdown
              className="text-lg font-medium text-gray-900 dark:text-gray-100"
              date={tomorrow}
              daysInHours={true}
            />
          </div>
          {!isProving && (
            <button
              type="button"
              className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={() => {
                setIsProving(true)

                while (guesses.length < MAX_CHALLENGES) {
                  //Adding empty guesses after the last one to satisfy the 6x5 dimensions of the proof input
                  guesses.push('     ')
                }
                let asciiGuesses = guesses.map((guess) => asAsciiArray(guess))
                try {
                  feathersClient
                    .service('stats')
                    .create({
                      guesses: asciiGuesses,
                    })
                    .then((result: Groth16Proof) => {
                      console.log(result)
                      setIsProving(false)
                      shareStatus(
                        result,
                        guesses,
                        statuses,
                        isGameLost,
                        isHardMode,
                        isDarkMode,
                        isHighContrastMode,
                        handleShareToClipboard
                      )
                    })
                } catch (e) {
                  throw Error(e as any)
                }
              }}
            >
              {SHARE_TEXT}
            </button>
          )}
          {isProving && <LoadingSpinner />}
        </div>
      )}
    </BaseModal>
  )
}
