import { describe, expect, it } from 'vitest'
import { EXERCISES } from './exercises'
import { TENSES } from './tenses'

describe('exercise bank', () => {
  it('has exercises for every tense', () => {
    for (const tense of TENSES) {
      const list = EXERCISES.filter((e) => e.tenseId === tense.id)
      expect(list.length, tense.id).toBeGreaterThanOrEqual(8)
    }
  })

  it('every exercise has id, answer, tip', () => {
    const ids = new Set<string>()
    for (const ex of EXERCISES) {
      expect(ex.id).toBeTruthy()
      expect(ids.has(ex.id)).toBe(false)
      ids.add(ex.id)
      expect(ex.answer).toBeTruthy()
      expect(ex.tip).toBeTruthy()
      expect(ex.prompt).toBeTruthy()

      if (ex.type === 'mcq' || ex.type === 'spot') {
        expect(ex.options?.length).toBeGreaterThanOrEqual(2)
        expect(
          ex.options!.some(
            (o) => o.toLowerCase() === ex.answer.toLowerCase(),
          ),
        ).toBe(true)
      }

      if (ex.type === 'match') {
        expect(ex.pairs?.length).toBeGreaterThanOrEqual(2)
        // grading uses pairs; answer is a serialized mirror
        expect(ex.answer.includes('=>')).toBe(true)
      }
    }
  })
})

describe('tense order', () => {
  it('has 12 sequential levels', () => {
    expect(TENSES).toHaveLength(12)
    TENSES.forEach((t, i) => expect(t.order).toBe(i + 1))
  })
})
