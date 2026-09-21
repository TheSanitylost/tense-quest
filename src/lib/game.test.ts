import { describe, expect, it } from 'vitest'
import {
  applyBossResult,
  applyMissionResult,
  comboXp,
  createDefaultSave,
  isMegaBossUnlocked,
  isTenseUnlocked,
  playerLevel,
  starsFromBossPercent,
  totalStars,
  XP_PER_CORRECT,
  XP_PER_LEVEL,
} from './game'

describe('starsFromBossPercent', () => {
  it('maps thresholds', () => {
    expect(starsFromBossPercent(59)).toBe(0)
    expect(starsFromBossPercent(60)).toBe(1)
    expect(starsFromBossPercent(80)).toBe(2)
    expect(starsFromBossPercent(100)).toBe(3)
  })
})

describe('playerLevel', () => {
  it('starts at 1', () => {
    expect(playerLevel(0)).toBe(1)
    expect(playerLevel(XP_PER_LEVEL)).toBe(2)
  })
})

describe('comboXp', () => {
  it('scales with combo', () => {
    expect(comboXp(1)).toBe(XP_PER_CORRECT)
    expect(comboXp(3)).toBeGreaterThan(comboXp(1))
  })
})

describe('unlocks', () => {
  it('unlocks first tense by default', () => {
    const save = createDefaultSave()
    expect(isTenseUnlocked(save, 'present-simple')).toBe(true)
    expect(isTenseUnlocked(save, 'present-continuous')).toBe(false)
  })

  it('unlocks next after 1 star', () => {
    let save = createDefaultSave()
    save = applyBossResult(save, 'present-simple', {
      percent: 70,
      xpGained: 50,
    })
    expect(save.tenseProgress['present-simple'].stars).toBe(1)
    expect(isTenseUnlocked(save, 'present-continuous')).toBe(true)
  })

  it('unlocks mega boss at 6 stars', () => {
    let save = createDefaultSave()
    expect(isMegaBossUnlocked(save)).toBe(false)
    save = applyBossResult(save, 'present-simple', {
      percent: 100,
      xpGained: 10,
    })
    save = applyBossResult(save, 'present-continuous', {
      percent: 100,
      xpGained: 10,
    })
    // 6 stars total
    expect(totalStars(save)).toBe(6)
    expect(isMegaBossUnlocked(save)).toBe(true)
  })
})

describe('mission + badges', () => {
  it('tracks mission best and combo badge', () => {
    let save = createDefaultSave()
    save = applyMissionResult(save, 'present-simple', {
      percent: 90,
      xpGained: 100,
      maxCombo: 10,
      cleared: true,
    })
    expect(save.tenseProgress['present-simple'].missionBest).toBe(90)
    expect(save.bestCombo).toBe(10)
    expect(save.badges).toContain('combo-10')
  })

  it('awards first-boss and three-star badges', () => {
    let save = createDefaultSave()
    save = applyBossResult(save, 'present-simple', {
      percent: 100,
      xpGained: 80,
    })
    expect(save.tenseProgress['present-simple'].stars).toBe(3)
    expect(save.badges).toContain('first-boss')
    expect(save.badges).toContain('three-star')
  })
})
