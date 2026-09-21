import type { TenseId } from '../data/tenses'
import { TENSES } from '../data/tenses'
import { BADGES } from '../data/badges'
import {
  SUBLEVEL_PASS_PERCENT,
  XP_SUBLEVEL_CLEAR,
  XP_SUBLEVEL_PERFECT,
  emptySublevelProgress,
  normalizeSublevelProgress,
  type SublevelProgress,
} from './sublevels'

export const SAVE_KEY = 'czasogra-save-v1'
export const MISSION_LIVES = 3
export const XP_PER_CORRECT = 10
export const XP_COMBO_BONUS = 2
export const XP_MISSION_CLEAR = 40
export const XP_BOSS_CLEAR = 80
export const XP_MEGA_CLEAR = 150
export const MEGA_BOSS_STARS_REQUIRED = 6
export const XP_PER_LEVEL = 200

export interface TenseProgress {
  lessonDone: boolean
  missionBest: number
  bossBest: number
  stars: number
  /** Best % for each of 10 practice sublevels (index 0 = sublevel 1). */
  sublevels: SublevelProgress
}

export interface PlayerSave {
  xp: number
  bestCombo: number
  badges: string[]
  megaBossBest: number
  tenseProgress: Record<TenseId, TenseProgress>
}

export function emptyTenseProgress(): TenseProgress {
  return {
    lessonDone: false,
    missionBest: 0,
    bossBest: 0,
    stars: 0,
    sublevels: emptySublevelProgress(),
  }
}

export function createDefaultSave(): PlayerSave {
  const tenseProgress = {} as Record<TenseId, TenseProgress>
  for (const t of TENSES) {
    tenseProgress[t.id] = emptyTenseProgress()
  }
  return {
    xp: 0,
    bestCombo: 0,
    badges: [],
    megaBossBest: 0,
    tenseProgress,
  }
}

export function loadSave(): PlayerSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return createDefaultSave()
    const parsed = JSON.parse(raw) as PlayerSave
    const base = createDefaultSave()
    const tenseProgress = { ...base.tenseProgress }
    for (const t of TENSES) {
      const incoming = parsed.tenseProgress?.[t.id]
      tenseProgress[t.id] = {
        ...base.tenseProgress[t.id],
        ...incoming,
        sublevels: normalizeSublevelProgress(incoming?.sublevels),
      }
    }
    return {
      ...base,
      ...parsed,
      tenseProgress,
      badges: parsed.badges ?? [],
    }
  } catch {
    return createDefaultSave()
  }
}

export function persistSave(save: PlayerSave): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

export function playerLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL
}

export function starsFromBossPercent(percent: number): number {
  if (percent >= 100) return 3
  if (percent >= 80) return 2
  if (percent >= 60) return 1
  return 0
}

export function totalStars(save: PlayerSave): number {
  return TENSES.reduce(
    (sum, t) => sum + (save.tenseProgress[t.id]?.stars ?? 0),
    0,
  )
}

export function isTenseUnlocked(save: PlayerSave, tenseId: TenseId): boolean {
  const tense = TENSES.find((t) => t.id === tenseId)
  if (!tense) return false
  if (tense.order === 1) return true
  const prev = TENSES.find((t) => t.order === tense.order - 1)
  if (!prev) return false
  return (save.tenseProgress[prev.id]?.stars ?? 0) >= 1
}

export function isMissionUnlocked(save: PlayerSave, tenseId: TenseId): boolean {
  return isTenseUnlocked(save, tenseId)
}

export function isBossUnlocked(save: PlayerSave, tenseId: TenseId): boolean {
  if (!isTenseUnlocked(save, tenseId)) return false
  return (save.tenseProgress[tenseId]?.missionBest ?? 0) > 0
}

export function isMegaBossUnlocked(save: PlayerSave): boolean {
  return totalStars(save) >= MEGA_BOSS_STARS_REQUIRED
}

export function comboXp(combo: number): number {
  if (combo <= 1) return XP_PER_CORRECT
  return XP_PER_CORRECT + (combo - 1) * XP_COMBO_BONUS
}

export function evaluateBadges(
  save: PlayerSave,
  extras?: { comboThisRun?: number; megaCleared?: boolean },
): string[] {
  const earned = new Set(save.badges)
  const stars = totalStars(save)

  const anyBoss = TENSES.some((t) => (save.tenseProgress[t.id]?.stars ?? 0) > 0)
  if (anyBoss) earned.add('first-boss')

  const anyThree = TENSES.some((t) => (save.tenseProgress[t.id]?.stars ?? 0) >= 3)
  if (anyThree) earned.add('three-star')

  const bestCombo = Math.max(save.bestCombo, extras?.comboThisRun ?? 0)
  if (bestCombo >= 10) earned.add('combo-10')

  if (stars >= 6) earned.add('six-stars')

  if (extras?.megaCleared || save.megaBossBest >= 60) earned.add('mega-boss')

  const allOneStar = TENSES.every((t) => (save.tenseProgress[t.id]?.stars ?? 0) >= 1)
  if (allOneStar) earned.add('all-clear')

  return [...earned]
}

export function applyLessonDone(save: PlayerSave, tenseId: TenseId): PlayerSave {
  const next = structuredClone(save)
  next.tenseProgress[tenseId].lessonDone = true
  return next
}

export function applyMissionResult(
  save: PlayerSave,
  tenseId: TenseId,
  opts: {
    percent: number
    xpGained: number
    maxCombo: number
    cleared: boolean
  },
): PlayerSave {
  const next = structuredClone(save)
  next.xp += opts.xpGained
  next.bestCombo = Math.max(next.bestCombo, opts.maxCombo)
  if (opts.cleared) {
    next.tenseProgress[tenseId].missionBest = Math.max(
      next.tenseProgress[tenseId].missionBest,
      opts.percent,
    )
  }
  next.badges = evaluateBadges(next, { comboThisRun: opts.maxCombo })
  return next
}

export function applyBossResult(
  save: PlayerSave,
  tenseId: TenseId,
  opts: { percent: number; xpGained: number },
): PlayerSave {
  const next = structuredClone(save)
  const stars = starsFromBossPercent(opts.percent)
  next.xp += opts.xpGained
  next.tenseProgress[tenseId].bossBest = Math.max(
    next.tenseProgress[tenseId].bossBest,
    opts.percent,
  )
  next.tenseProgress[tenseId].stars = Math.max(
    next.tenseProgress[tenseId].stars,
    stars,
  )
  next.badges = evaluateBadges(next)
  return next
}

export function applyMegaBossResult(
  save: PlayerSave,
  opts: { percent: number; xpGained: number },
): PlayerSave {
  const next = structuredClone(save)
  next.xp += opts.xpGained
  next.megaBossBest = Math.max(next.megaBossBest, opts.percent)
  next.badges = evaluateBadges(next, {
    megaCleared: opts.percent >= 60,
  })
  return next
}

export function applySublevelResult(
  save: PlayerSave,
  tenseId: TenseId,
  level: number,
  opts: {
    percent: number
    xpGained: number
    maxCombo: number
  },
): PlayerSave {
  const next = structuredClone(save)
  const idx = level - 1
  if (idx < 0 || idx >= next.tenseProgress[tenseId].sublevels.length) return next

  const prevBest = next.tenseProgress[tenseId].sublevels[idx] ?? 0
  const firstClear =
    prevBest < SUBLEVEL_PASS_PERCENT && opts.percent >= SUBLEVEL_PASS_PERCENT
  const firstPerfect = prevBest < 100 && opts.percent >= 100

  let bonus = 0
  if (firstClear) bonus += XP_SUBLEVEL_CLEAR
  if (firstPerfect) bonus += XP_SUBLEVEL_PERFECT

  next.xp += opts.xpGained + bonus
  next.bestCombo = Math.max(next.bestCombo, opts.maxCombo)
  next.tenseProgress[tenseId].sublevels[idx] = Math.max(prevBest, opts.percent)
  next.badges = evaluateBadges(next, { comboThisRun: opts.maxCombo })
  return next
}

export function victoryLine(percent: number): string {
  if (percent >= 100) return 'Perfekcja! Jesteś maszyną do czasów.'
  if (percent >= 90) return 'Legenda. Ósma klasa w szoku.'
  if (percent >= 80) return 'Mocne! Prawie boss-level.'
  if (percent >= 60) return 'Przeszło! Gwiazdka wpadła.'
  if (percent >= 40) return 'Nieźle, ale boss się śmieje. Jeszcze raz?'
  return 'Ups. Restart misji — damy radę.'
}

export function badgeById(id: string) {
  return BADGES.find((b) => b.id === id)
}
