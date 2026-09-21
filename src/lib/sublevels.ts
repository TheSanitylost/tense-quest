import type { TenseId } from '../data/tenses'
import { TENSES } from '../data/tenses'
import type { PlayerSave } from './game'

export const SUBLEVELS_PER_TENSE = 10
export const QUESTIONS_PER_SUBLEVEL = 20
export const SUBLEVEL_PASS_PERCENT = 60
export const XP_SUBLEVEL_CLEAR = 50
export const XP_SUBLEVEL_PERFECT = 30

export type SublevelProgress = number[]

export function emptySublevelProgress(): SublevelProgress {
  return Array.from({ length: SUBLEVELS_PER_TENSE }, () => 0)
}

export function normalizeSublevelProgress(
  value: unknown,
): SublevelProgress {
  const base = emptySublevelProgress()
  if (!Array.isArray(value)) return base
  for (let i = 0; i < SUBLEVELS_PER_TENSE; i++) {
    const n = Number(value[i])
    base[i] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0
  }
  return base
}

/** A tense is “cleared” once the boss yielded at least 1★. */
export function isTenseCleared(save: PlayerSave, tenseId: TenseId): boolean {
  return (save.tenseProgress[tenseId]?.stars ?? 0) >= 1
}

export function clearedTenses(save: PlayerSave) {
  return TENSES.filter((t) => isTenseCleared(save, t.id))
}

export function getSublevelBest(
  save: PlayerSave,
  tenseId: TenseId,
  level: number,
): number {
  const list = save.tenseProgress[tenseId]?.sublevels
  if (!list) return 0
  return list[level - 1] ?? 0
}

export function isSublevelCleared(
  save: PlayerSave,
  tenseId: TenseId,
  level: number,
): boolean {
  return getSublevelBest(save, tenseId, level) >= SUBLEVEL_PASS_PERCENT
}

export function isSublevelUnlocked(
  save: PlayerSave,
  tenseId: TenseId,
  level: number,
): boolean {
  if (level < 1 || level > SUBLEVELS_PER_TENSE) return false
  if (!isTenseCleared(save, tenseId)) return false
  if (level === 1) return true
  return isSublevelCleared(save, tenseId, level - 1)
}

export function clearedSublevelCount(save: PlayerSave, tenseId: TenseId): number {
  let n = 0
  for (let i = 1; i <= SUBLEVELS_PER_TENSE; i++) {
    if (isSublevelCleared(save, tenseId, i)) n++
  }
  return n
}

export function totalClearedSublevels(save: PlayerSave): number {
  return TENSES.reduce((sum, t) => sum + clearedSublevelCount(save, t.id), 0)
}

/** Deterministic 32-bit hash for seeded shuffles. */
export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items]
  let s = seed >>> 0
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function sublevelDifficultyLabel(level: number): string {
  if (level <= 3) return 'Rozgrzewka'
  if (level <= 6) return 'Trening'
  if (level <= 8) return 'Wyzwanie'
  return 'Ekstremum'
}
