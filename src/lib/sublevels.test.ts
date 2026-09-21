import { describe, expect, it } from 'vitest'
import {
  applyBossResult,
  applySublevelResult,
  createDefaultSave,
} from './game'
import {
  QUESTIONS_PER_SUBLEVEL,
  SUBLEVELS_PER_TENSE,
  clearedSublevelCount,
  isSublevelUnlocked,
  isTenseCleared,
} from './sublevels'
import { pickSublevelExercises, getSublevelExercisePool } from '../data/sublevelBank'

describe('sublevels unlock', () => {
  it('locks until boss clears the tense', () => {
    const save = createDefaultSave()
    expect(isTenseCleared(save, 'present-simple')).toBe(false)
    expect(isSublevelUnlocked(save, 'present-simple', 1)).toBe(false)
  })

  it('unlocks sublevel 1 after 1★ and chains further clears', () => {
    let save = createDefaultSave()
    save = applyBossResult(save, 'present-simple', {
      percent: 70,
      xpGained: 10,
    })
    expect(isTenseCleared(save, 'present-simple')).toBe(true)
    expect(isSublevelUnlocked(save, 'present-simple', 1)).toBe(true)
    expect(isSublevelUnlocked(save, 'present-simple', 2)).toBe(false)

    save = applySublevelResult(save, 'present-simple', 1, {
      percent: 65,
      xpGained: 40,
      maxCombo: 4,
    })
    expect(isSublevelUnlocked(save, 'present-simple', 2)).toBe(true)
    expect(clearedSublevelCount(save, 'present-simple')).toBe(1)
  })

  it('awards clear bonus xp once', () => {
    let save = createDefaultSave()
    save = applyBossResult(save, 'present-simple', { percent: 100, xpGained: 0 })
    const before = save.xp
    save = applySublevelResult(save, 'present-simple', 1, {
      percent: 100,
      xpGained: 20,
      maxCombo: 5,
    })
    expect(save.xp).toBeGreaterThan(before + 20)
    const mid = save.xp
    save = applySublevelResult(save, 'present-simple', 1, {
      percent: 100,
      xpGained: 10,
      maxCombo: 2,
    })
    expect(save.xp).toBe(mid + 10)
  })
})

describe('sublevel exercise bank', () => {
  it('builds a pool large enough for 20 questions', () => {
    const pool = getSublevelExercisePool('present-simple')
    expect(pool.length).toBeGreaterThanOrEqual(QUESTIONS_PER_SUBLEVEL)
  })

  it('picks a stable 20-question set per sublevel', () => {
    const a = pickSublevelExercises('past-simple', 3)
    const b = pickSublevelExercises('past-simple', 3)
    expect(a).toHaveLength(QUESTIONS_PER_SUBLEVEL)
    expect(a.map((e) => e.id)).toEqual(b.map((e) => e.id))
    const other = pickSublevelExercises('past-simple', 4)
    expect(other.map((e) => e.id)).not.toEqual(a.map((e) => e.id))
  })

  it('covers all ten sublevels', () => {
    expect(SUBLEVELS_PER_TENSE).toBe(10)
    for (let i = 1; i <= SUBLEVELS_PER_TENSE; i++) {
      expect(pickSublevelExercises('future-simple', i)).toHaveLength(
        QUESTIONS_PER_SUBLEVEL,
      )
    }
  })
})
