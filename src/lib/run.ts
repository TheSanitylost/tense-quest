import type { Exercise } from '../data/exercises'
import {
  gradeFillOrTransform,
  gradeMatch,
  gradeMcqOrSpot,
} from '../lib/quiz'

export function gradeExercise(exercise: Exercise, userAnswer: string): boolean {
  if (exercise.type === 'match') {
    try {
      const pairs = JSON.parse(userAnswer) as { left: string; right: string }[]
      return gradeMatch(pairs, exercise)
    } catch {
      return false
    }
  }
  if (exercise.type === 'mcq' || exercise.type === 'spot') {
    return gradeMcqOrSpot(userAnswer, exercise)
  }
  return gradeFillOrTransform(userAnswer, exercise)
}

export interface RunResult {
  mode: 'mission' | 'boss' | 'mega' | 'sublevel'
  tenseId?: string
  sublevel?: number
  correct: number
  total: number
  percent: number
  xpGained: number
  maxCombo: number
  starsEarned: number
  cleared: boolean
  mistakes: {
    prompt: string
    sentence?: string
    userAnswer: string
    expected: string
    tip: string
    tenseId: string
  }[]
}

const RESULT_KEY = 'czasogra-last-result'

export function storeResult(result: RunResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
}

export function loadResult(): RunResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as RunResult
  } catch {
    return null
  }
}
