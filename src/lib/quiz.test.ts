import { describe, expect, it } from 'vitest'
import {
  answersEqual,
  encodeMatchPairs,
  gradeFillOrTransform,
  gradeMatch,
  gradeMcqOrSpot,
  normalizeAnswer,
  pickMegaBossExercises,
  scorePercent,
  shuffle,
  weakTenses,
} from './quiz'
import type { Exercise } from '../data/exercises'
import { EXERCISES } from '../data/exercises'

describe('normalizeAnswer', () => {
  it('trims and lowercases', () => {
    expect(normalizeAnswer('  Hello! ')).toBe('hello')
  })
})

describe('answersEqual', () => {
  it('accepts contractions', () => {
    expect(answersEqual("don't", 'do not')).toBe(true)
    expect(answersEqual("She doesn't play", 'She does not play')).toBe(true)
    expect(answersEqual("won't", 'will not')).toBe(true)
  })

  it('rejects different answers', () => {
    expect(answersEqual('goes', 'go')).toBe(false)
  })
})

describe('grading', () => {
  const mcq: Exercise = {
    id: 't',
    tenseId: 'present-simple',
    type: 'mcq',
    prompt: 'x',
    options: ['a', 'b'],
    answer: 'goes',
    tip: '',
  }

  it('grades mcq', () => {
    expect(gradeMcqOrSpot('goes', mcq)).toBe(true)
    expect(gradeMcqOrSpot('go', mcq)).toBe(false)
  })

  it('grades fill with alternates', () => {
    const fill: Exercise = {
      ...mcq,
      type: 'fill',
      answer: "don't|do not",
    }
    expect(gradeFillOrTransform("don't", fill)).toBe(true)
    expect(gradeFillOrTransform('do not', fill)).toBe(true)
  })

  it('grades match pairs', () => {
    const pairs = [
      { left: 'always', right: 'zawsze' },
      { left: 'never', right: 'nigdy' },
    ]
    const ex: Exercise = {
      ...mcq,
      type: 'match',
      pairs,
      answer: encodeMatchPairs(pairs),
    }
    expect(gradeMatch(pairs, ex)).toBe(true)
    expect(
      gradeMatch(
        [
          { left: 'always', right: 'nigdy' },
          { left: 'never', right: 'zawsze' },
        ],
        ex,
      ),
    ).toBe(false)
  })
})

describe('scorePercent', () => {
  it('computes percent', () => {
    expect(scorePercent(8, 10)).toBe(80)
    expect(scorePercent(0, 0)).toBe(0)
  })
})

describe('shuffle', () => {
  it('keeps the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    expect(shuffle(input).sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('pickMegaBossExercises', () => {
  it('returns requested count and unique-ish mix', () => {
    const picked = pickMegaBossExercises(EXERCISES, 12)
    expect(picked).toHaveLength(12)
    const tenseIds = new Set(picked.map((e) => e.tenseId))
    expect(tenseIds.size).toBeGreaterThanOrEqual(8)
  })
})

describe('weakTenses', () => {
  it('orders by mistake count', () => {
    expect(
      weakTenses([
        { tenseId: 'past-simple' },
        { tenseId: 'present-simple' },
        { tenseId: 'past-simple' },
      ]),
    ).toEqual(['past-simple', 'present-simple'])
  })
})
