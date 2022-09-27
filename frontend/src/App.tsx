import { useState, useEffect, ChangeEvent } from 'react'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { useContract, useSigner, useSwitchNetwork } from 'wagmi'
import { groth16 } from 'snarkjs'
import contractAbi from './contracts/ZKWordle.sol/ZKWordle.json'

import {
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
  HARD_MODE_ALERT_MESSAGE,
  INCORRECT_PROOF_TEXT,
  PROOF_VERIFICATION_HINT,
  STATS_WAS_VERIFIED,
  VERIFYING,
  STATS_VALID,
  STATS_INVALID,
} from './constants/strings'
import {
  MAX_WORD_LENGTH,
  MAX_CHALLENGES,
  REVEAL_TIME_MS,
  GAME_LOST_INFO_DELAY,
  WELCOME_INFO_MODAL_MS,
} from './constants/settings'
import {
  isValidGuess,
  isWinningWord,
  findFirstUnusedReveal,
  unicodeLength,
} from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
  getStoredIsHighContrastMode,
} from './lib/localStorage'
import { default as GraphemeSplitter } from 'grapheme-splitter'

import './App.css'
import { AlertContainer } from './components/alerts/AlertContainer'
import { useAlert } from './context/AlertContext'
import { Navbar } from './components/navbar/Navbar'
import { CharStatus, getGuessStatuses } from './lib/statuses'
import { Groth16Proof } from './zk/prove'
import { utils } from 'ffjavascript'
import LoadingSpinner from './components/progress/Spinner'
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/outline'
import feathers, { rest } from '@feathersjs/client'
import axios from 'axios'
import { BigNumber } from 'ethers'

type ProofStatus = 'missing' | 'proving' | 'proven'
type CommitmentResponse = {
  solutionIndex: number
  hashedSolution: BigNumber
  signature: string
}
type GameRoundResponse = {
  solutionIndex: number
  tomorrow: number
}
function App() {
  const feathersClient = feathers()
  const restClient = rest(process.env.REACT_APP_SERVER_URL)

  feathersClient.configure(restClient.axios(axios))

  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
  const { showError: showErrorAlert, showSuccess: showSuccessAlert } =
    useAlert()
  const [solutionIndex, setSolutionIndex] = useState(0)
  const [tomorrow, setTomorrow] = useState(0)
  const [currentGuess, setCurrentGuess] = useState('')
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isGameWon, setIsGameWon] = useState(false)
  const [creatingCommitment, setIsCreatingCommitment] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [isGameLost, setIsGameLost] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )
  const [isRevealing, setIsRevealing] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (!loaded?.guesses || !loaded?.statuses) {
      return []
    }
    let gameWon = false
    loaded.guesses
      .map((guess) => loaded.statuses.get(guess))
      .forEach((status) => {
        if (
          status &&
          !status?.includes('absent') &&
          !status?.includes('present')
        )
          gameWon = true
      })
    if (gameWon) {
      setIsGameWon(true)
    } else if (loaded.guesses.length >= MAX_CHALLENGES) {
      setIsGameLost(true)
    }
    return loaded.guesses
  })

  const [statuses, setStatuses] = useState<Map<string, CharStatus[]>>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (
      !loaded?.statuses ||
      (solutionIndex > 0 && solutionIndex !== loaded?.solutionIndex)
    ) {
      return new Map()
    }
    return loaded!.statuses
  })

  const [guessesProven, setGuessProven] = useState<Map<string, boolean>>(
    new Map()
  )

  const [stats, setStats] = useState(() => loadStats())
  const [statsVerificationStatus, setStatsVerificationStatus] =
    useState<ProofStatus>('missing')
  const [isStatsValid, setIsStatsValid] = useState(false)

  const [isHardMode, setIsHardMode] = useState(
    localStorage.getItem('gameMode')
      ? localStorage.getItem('gameMode') === 'hard'
      : false
  )
  const { data: signer } = useSigner()
  const { switchNetwork } = useSwitchNetwork({
    onSuccess(data) {
      if (data.id === (process.env.NODE_ENV === 'production' ? 5 : 31337))
        setIsOnCorrectNetwork(true)
    },
  })

  useEffect(() => {
    if (!isOnCorrectNetwork) {
      signer?.getChainId().then((chainId) => {
        //If the wallet is not connected to Goerli testnet
        if (chainId !== (process.env.NODE_ENV === 'production' ? 5 : 31337)) {
          //Ask user to switch to Goerli testnet
          switchNetwork?.(process.env.NODE_ENV === 'production' ? 5 : 31337)
        } else {
          setIsOnCorrectNetwork(true)
        }
      })
    }
  }, [isOnCorrectNetwork, signer, switchNetwork])

  useEffect(() => {
    if (signer && isOnCorrectNetwork) {
      setIsConnected(true)
    }
  }, [isOnCorrectNetwork, signer])
  //TODO make compatible with local deployment
  const contract = useContract({
    addressOrName:
      process.env.NODE_ENV === 'production'
        ? '0x1adeff73be131a68fdea106bb1298370059fdf00'
        : '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
    contractInterface: contractAbi.abi,
    signerOrProvider: signer,
  })

  useEffect(() => {
    feathersClient
      .service('game-round')
      .find()
      .then(({ solutionIndex, tomorrow }: GameRoundResponse) => {
        const loaded = loadGameStateFromLocalStorage()
        if (solutionIndex !== loaded?.solutionIndex) {
          setGuesses([])
          setStatuses(new Map())
        }
        setSolutionIndex(solutionIndex)
        setTomorrow(tomorrow)
      })
  })
  useEffect(() => {
    if (isConnected && !creatingCommitment && solutionIndex !== 0) {
      setIsCreatingCommitment(true)
      try {
        console.log('Getting commitment...')
        contract.solutionCommitment(solutionIndex).then((commitment: any) => {
          if (commitment.isZero()) {
            console.log(`Commitment for solution #${solutionIndex} not found`)
            feathersClient
              .service('commitment')
              .create({})
              .then(
                ({
                  solutionIndex,
                  hashedSolution,
                  signature,
                }: CommitmentResponse) => {
                  contract
                    .commitSolution(solutionIndex, hashedSolution, signature)
                    .then((tx: any) => {
                      tx.wait().then((commitment: any) => {
                        if (commitment.status) {
                          console.log('Commitment successfully created')
                        } else {
                          setIsCreatingCommitment(false)
                        }
                      })
                    })
                }
              )
          } else {
            console.log(`Commitment found: ${commitment}, proceeding`)
          }
        })
      } catch (e) {
        setIsCreatingCommitment(false)
        console.log(e)
      }
    }
  }, [contract, creatingCommitment, feathersClient, isConnected, solutionIndex])

  useEffect(() => {
    // if no game state on load,
    // show the user the how-to info modal
    if (isConnected && !loadGameStateFromLocalStorage()) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
    }
  }, [isConnected])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const handleHardMode = (isHard: boolean) => {
    if (guesses.length === 0 || localStorage.getItem('gameMode') === 'hard') {
      setIsHardMode(isHard)
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
    } else {
      showErrorAlert(HARD_MODE_ALERT_MESSAGE)
    }
  }

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  const clearCurrentRowClass = () => {
    setCurrentRowClass('')
  }

  useEffect(() => {
    if (isConnected)
      saveGameStateToLocalStorage({ guesses, statuses, solutionIndex })
  }, [guesses, isConnected, solutionIndex, statuses])

  useEffect(() => {
    if (isConnected && isGameWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * MAX_WORD_LENGTH

      showSuccessAlert(winMessage, {
        delayMs,
        onClose: () => setIsStatsModalOpen(true),
      })
    }

    if (isConnected && isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isGameWon, isGameLost, showSuccessAlert, isConnected])

  const onChar = (value: string) => {
    if (
      unicodeLength(`${currentGuess}${value}`) <= MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(
      new GraphemeSplitter().splitGraphemes(currentGuess).slice(0, -1).join('')
    )
  }

  const onEnter = async () => {
    if (isGameWon || isGameLost) {
      return
    }

    if (!creatingCommitment) {
      setCurrentRowClass('jiggle')
      return showErrorAlert('Commitment not created, cannot verify proofs', {})
    }

    if (!(unicodeLength(currentGuess) === MAX_WORD_LENGTH)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    if (!isValidGuess(currentGuess)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    // enforce hard mode - all guesses must contain all previously revealed letters
    if (isHardMode) {
      const firstMissingReveal = await findFirstUnusedReveal(
        currentGuess,
        guesses,
        statuses
      )
      if (firstMissingReveal) {
        setCurrentRowClass('jiggle')
        return showErrorAlert(firstMissingReveal, {
          onClose: clearCurrentRowClass,
        })
      }
    }

    // turn this back off after all
    // chars have been revealed
    setIsRevealing(true)
    setGuesses([...guesses, currentGuess])

    let result = await getGuessStatuses(feathersClient, currentGuess)

    try {
      let calldata = await groth16.exportSolidityCallData(
        utils.unstringifyBigInts(result.proof.proof),
        utils.unstringifyBigInts(result.proof.publicSignals)
      )
      const argv = calldata
        .replace(/["[\]\s]/g, '')
        .split(',')
        .map((x: any) => BigInt(x).toString())
      const a = [argv[0], argv[1]]
      const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
      ]
      const c = [argv[6], argv[7]]
      const Input = argv.slice(8)
      contract.verifyClues(a, b, c, Input).then((verificationResult: any) => {
        guessesProven.set(currentGuess, verificationResult)
        setGuessProven(new Map(guessesProven))
      })
    } catch (e) {
      console.log(e)
    }

    setStatuses(new Map(statuses.set(currentGuess, result.statuses)))

    const gameWasWon =
      !result.statuses.includes('absent') &&
      !result.statuses.includes('present')
    if (gameWasWon) {
      setIsGameWon(true)
    }
    if (guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
      //TODO: get solution from backend
      showErrorAlert(CORRECT_WORD_MESSAGE('solution'), {
        persist: true,
      })
    }

    setIsRevealing(false)

    const winningWord = isWinningWord(currentGuess, statuses)

    if (
      unicodeLength(currentGuess) === MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess('')

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_CHALLENGES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
        //TODO: get solution from backend
        showErrorAlert(CORRECT_WORD_MESSAGE('solution'), {
          persist: true,
          delayMs: REVEAL_TIME_MS * MAX_WORD_LENGTH + 1,
        })
      }
    }
  }

  const handleProofChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setIsStatsValid(false)
    setStatsVerificationStatus('missing')
    let pasted = event?.target?.value.replace(/[\n\r\t\s]+/g, '')
    if (!pasted) return
    const proofStartIndex = pasted.indexOf('{"proof')
    if (proofStartIndex < 0) {
      showErrorAlert(INCORRECT_PROOF_TEXT)
      return
    }
    let proofString = pasted.substring(proofStartIndex)

    let proof = JSON.parse(proofString) as Groth16Proof
    let calldata = await groth16.exportSolidityCallData(
      utils.unstringifyBigInts(proof.proof),
      utils.unstringifyBigInts(proof.publicSignals)
    )
    const argv = calldata
      .replace(/["[\]\s]/g, '')
      .split(',')
      .map((x: any) => BigInt(x).toString())
    const a = [argv[0], argv[1]]
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ]
    const c = [argv[6], argv[7]]
    const Input = argv.slice(8)

    setStatsVerificationStatus('proving')
    try {
      let result = await contract.verifyStats(a, b, c, Input)
      setIsStatsValid(result)
      setStatsVerificationStatus('proven')
    } catch (e) {
      console.log(e)
      setIsStatsValid(false)
      setStatsVerificationStatus('missing')
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
      />
      <div className="pt-2 px-1 pb-8 md:max-w-7xl w-full mx-auto sm:px-6 lg:px-8 flex flex-col grow">
        <div className="pb-6 grow">
          <Grid
            guesses={guesses}
            statuses={statuses}
            currentGuess={currentGuess}
            isRevealing={isRevealing}
            currentRowClassName={currentRowClass}
            guessesProven={guessesProven}
          />
          <div className="flex justify-center mb-1">
            <input
              className="border-solid border-2 rounded"
              style={{ margin: 5, minWidth: 300, paddingInline: 5 }}
              type="text"
              name="proof"
              placeholder={PROOF_VERIFICATION_HINT}
              onChange={handleProofChange}
            />
          </div>

          <div className="flex justify-center mb-1 dark:text-white">
            {statsVerificationStatus === 'proving' && VERIFYING}
            {statsVerificationStatus === 'proving' && <LoadingSpinner />}
            {statsVerificationStatus === 'proven' &&
              (isStatsValid ? STATS_VALID : STATS_INVALID)}
            {statsVerificationStatus === 'proven' &&
              (isStatsValid ? (
                <div title={STATS_WAS_VERIFIED}>
                  <ShieldCheckIcon className="h-6 w-6 cursor-pointer dark:stroke-white" />
                </div>
              ) : (
                <ShieldExclamationIcon className="h-6 w-6 cursor-pointer dark:stroke-white" />
              ))}
          </div>
        </div>
        <Keyboard
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          guesses={guesses}
          statuses={statuses}
          isRevealing={isRevealing}
        />
        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={() => setIsInfoModalOpen(false)}
        />
        <StatsModal
          isOpen={isStatsModalOpen}
          handleClose={() => setIsStatsModalOpen(false)}
          guesses={guesses}
          statuses={statuses}
          gameStats={stats}
          isGameLost={isGameLost}
          isGameWon={isGameWon}
          handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
          isHardMode={isHardMode}
          isDarkMode={isDarkMode}
          isHighContrastMode={isHighContrastMode}
          numberOfGuessesMade={guesses.length}
          feathersClient={feathersClient}
          solutionIndex={solutionIndex}
          tomorrow={tomorrow}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          handleClose={() => setIsSettingsModalOpen(false)}
          isHardMode={isHardMode}
          handleHardMode={handleHardMode}
          isDarkMode={isDarkMode}
          handleDarkMode={handleDarkMode}
          isHighContrastMode={isHighContrastMode}
          handleHighContrastMode={handleHighContrastMode}
        />
        <AlertContainer />
      </div>
    </div>
  )
}

export default App
