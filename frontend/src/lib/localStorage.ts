import { CharStatus } from './statuses'
const gameStateKey = 'gameState'
const highContrastKey = 'highContrast'

type StoredGameState = {
  guesses: string[]
  statuses: Map<string, CharStatus[]>
  solution: string
}

export const saveGameStateToLocalStorage = (gameState: StoredGameState) => {
  localStorage.setItem(
    gameStateKey,
    JSON.stringify(gameState, function replacer(key, value) {
      if (value instanceof Map) {
        return {
          dataType: 'Map',
          value: Array.from(value.entries()),
        }
      } else {
        return value
      }
    })
  )
}

export const loadGameStateFromLocalStorage = () => {
  const state = localStorage.getItem(gameStateKey)
  return state
    ? (JSON.parse(state, function reviver(key, value) {
        if (typeof value === 'object' && value !== null) {
          if (value.dataType === 'Map') {
            return new Map(value.value)
          }
        }
        return value
      }) as StoredGameState)
    : null
}

const gameStatKey = 'gameStats'

export type GameStats = {
  winDistribution: number[]
  gamesFailed: number
  currentStreak: number
  bestStreak: number
  totalGames: number
  successRate: number
}

export const saveStatsToLocalStorage = (gameStats: GameStats) => {
  localStorage.setItem(gameStatKey, JSON.stringify(gameStats))
}

export const loadStatsFromLocalStorage = () => {
  const stats = localStorage.getItem(gameStatKey)
  return stats ? (JSON.parse(stats) as GameStats) : null
}

export const setStoredIsHighContrastMode = (isHighContrast: boolean) => {
  if (isHighContrast) {
    localStorage.setItem(highContrastKey, '1')
  } else {
    localStorage.removeItem(highContrastKey)
  }
}

export const getStoredIsHighContrastMode = () => {
  const highContrast = localStorage.getItem(highContrastKey)
  return highContrast === '1'
}
