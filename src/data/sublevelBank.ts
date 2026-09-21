import type { Exercise } from './exercises'
import type { TenseId } from './tenses'
import { getExercisesForTense } from './exercises'
import {
  QUESTIONS_PER_SUBLEVEL,
  hashSeed,
  seededShuffle,
} from '../lib/sublevels'

type Verb = { base: string; s: string; ing: string; past: string; pp: string }

const VERBS: Verb[] = [
  { base: 'play', s: 'plays', ing: 'playing', past: 'played', pp: 'played' },
  { base: 'watch', s: 'watches', ing: 'watching', past: 'watched', pp: 'watched' },
  { base: 'study', s: 'studies', ing: 'studying', past: 'studied', pp: 'studied' },
  { base: 'work', s: 'works', ing: 'working', past: 'worked', pp: 'worked' },
  { base: 'read', s: 'reads', ing: 'reading', past: 'read', pp: 'read' },
  { base: 'write', s: 'writes', ing: 'writing', past: 'wrote', pp: 'written' },
  { base: 'eat', s: 'eats', ing: 'eating', past: 'ate', pp: 'eaten' },
  { base: 'go', s: 'goes', ing: 'going', past: 'went', pp: 'gone' },
  { base: 'run', s: 'runs', ing: 'running', past: 'ran', pp: 'run' },
  { base: 'travel', s: 'travels', ing: 'travelling', past: 'travelled', pp: 'travelled' },
  { base: 'learn', s: 'learns', ing: 'learning', past: 'learned', pp: 'learned' },
  { base: 'cook', s: 'cooks', ing: 'cooking', past: 'cooked', pp: 'cooked' },
]

const HE_SHE = ['She', 'He', 'Tom', 'Anna', 'My brother', 'The teacher'] as const
const THEY = ['They', 'We', 'My friends', 'The students'] as const
const I = ['I'] as const

const tip: Record<TenseId, string> = {
  'present-simple': 'Present Simple: do/does + I forma; he/she/it + -s.',
  'present-continuous': 'Present Continuous: am/is/are + -ing.',
  'present-perfect': 'Present Perfect: have/has + III forma.',
  'present-perfect-continuous': 'Present Perfect Continuous: have/has + been + -ing.',
  'past-simple': 'Past Simple: II forma; pytania: did + I forma.',
  'past-continuous': 'Past Continuous: was/were + -ing.',
  'past-perfect': 'Past Perfect: had + III forma.',
  'past-perfect-continuous': 'Past Perfect Continuous: had + been + -ing.',
  'future-simple': 'Future Simple: will + I forma.',
  'future-continuous': 'Future Continuous: will + be + -ing.',
  'future-perfect': 'Future Perfect: will + have + III forma.',
  'future-perfect-continuous': 'Future Perfect Continuous: will + have + been + -ing.',
}

const TENSE_LABEL: Record<TenseId, string> = {
  'present-simple': 'Present Simple',
  'present-continuous': 'Present Continuous',
  'present-perfect': 'Present Perfect',
  'present-perfect-continuous': 'Present Perfect Continuous',
  'past-simple': 'Past Simple',
  'past-continuous': 'Past Continuous',
  'past-perfect': 'Past Perfect',
  'past-perfect-continuous': 'Past Perfect Continuous',
  'future-simple': 'Future Simple',
  'future-continuous': 'Future Continuous',
  'future-perfect': 'Future Perfect',
  'future-perfect-continuous': 'Future Perfect Continuous',
}

function distractors(correct: string, pool: string[]): string[] {
  const unique = [...new Set(pool.filter((x) => x !== correct))]
  const picked = seededShuffle(unique, hashSeed(correct)).slice(0, 3)
  while (picked.length < 3) {
    picked.push(`${correct}?`)
    break
  }
  return seededShuffle([correct, ...picked.slice(0, 3)], hashSeed(`opt-${correct}`))
}

function beFor(subject: string): 'am' | 'is' | 'are' {
  if (subject === 'I') return 'am'
  if (THEY.includes(subject as (typeof THEY)[number]) || subject === 'We') return 'are'
  return 'is'
}

function haveFor(subject: string): 'have' | 'has' {
  if (subject === 'I' || THEY.includes(subject as (typeof THEY)[number]) || subject === 'We') {
    return 'have'
  }
  return 'has'
}

function wasWere(subject: string): 'was' | 'were' {
  if (THEY.includes(subject as (typeof THEY)[number]) || subject === 'We') return 'were'
  return 'was'
}

function buildForTense(tenseId: TenseId): Exercise[] {
  const out: Exercise[] = []
  const t = tip[tenseId]
  let n = 0
  const id = () => `${tenseId}-gen-${++n}`

  const subjects = [...HE_SHE, ...THEY, ...I]

  for (const subject of subjects) {
    for (const verb of VERBS) {
      const be = beFor(subject)
      const have = haveFor(subject)
      const ww = wasWere(subject)

      if (tenseId === 'present-simple') {
        const form = subject === 'I' || THEY.includes(subject as (typeof THEY)[number]) || subject === 'We'
          ? verb.base
          : verb.s
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz poprawną formę:',
          sentence: `${subject} ___ every weekend.`,
          options: distractors(form, [verb.base, verb.s, verb.ing, verb.past]),
          answer: form,
          tip: t,
        })
        out.push({
          id: id(),
          tenseId,
          type: 'fill',
          prompt: 'Uzupełnij lukę (jedno słowo):',
          sentence: `${subject} ___ English at school.`,
          answer: form,
          tip: t,
        })
        if (subject !== 'I' && !THEY.includes(subject as (typeof THEY)[number]) && subject !== 'We') {
          out.push({
            id: id(),
            tenseId,
            type: 'transform',
            prompt: 'Zrób pytanie (Does…?):',
            sentence: `${subject} ${verb.s} football.`,
            answer: `Does ${subject.toLowerCase()} ${verb.base} football?`,
            tip: t,
          })
        }
      }

      if (tenseId === 'present-continuous') {
        const form = `${be} ${verb.ing}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz poprawną formę:',
          sentence: `${subject} ___ right now.`,
          options: distractors(form, [
            form,
            `${be} ${verb.base}`,
            `${have} ${verb.ing}`,
            verb.s,
          ]),
          answer: form,
          tip: t,
        })
        out.push({
          id: id(),
          tenseId,
          type: 'fill',
          prompt: 'Uzupełnij (am/is/are + -ing):',
          sentence: `${subject} ___ a book at the moment.`,
          answer: `${be} ${verb.ing}`,
          tip: t,
        })
      }

      if (tenseId === 'present-perfect') {
        const form = `${have} ${verb.pp}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Present Perfect:',
          sentence: `${subject} ___ already.`,
          options: distractors(form, [
            form,
            `${have} ${verb.ing}`,
            `${ww} ${verb.pp}`,
            verb.past,
          ]),
          answer: form,
          tip: t,
        })
        out.push({
          id: id(),
          tenseId,
          type: 'fill',
          prompt: 'Uzupełnij (have/has + III forma):',
          sentence: `${subject} ___ the homework.`,
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'present-perfect-continuous') {
        const form = `${have} been ${verb.ing}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz poprawną formę:',
          sentence: `${subject} ___ for two hours.`,
          options: distractors(form, [
            form,
            `${have} ${verb.pp}`,
            `${be} ${verb.ing}`,
            `had been ${verb.ing}`,
          ]),
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'past-simple') {
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Past Simple:',
          sentence: `${subject} ___ yesterday.`,
          options: distractors(verb.past, [verb.past, verb.base, verb.pp, verb.ing]),
          answer: verb.past,
          tip: t,
        })
        out.push({
          id: id(),
          tenseId,
          type: 'fill',
          prompt: 'Uzupełnij (II forma):',
          sentence: `${subject} ___ to the cinema last night.`,
          answer: verb.base === 'go' ? 'went' : verb.past,
          tip: t,
        })
      }

      if (tenseId === 'past-continuous') {
        const form = `${ww} ${verb.ing}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Past Continuous:',
          sentence: `${subject} ___ when I called.`,
          options: distractors(form, [
            form,
            `${have} ${verb.ing}`,
            verb.past,
            `will be ${verb.ing}`,
          ]),
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'past-perfect') {
        const form = `had ${verb.pp}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Past Perfect:',
          sentence: `${subject} ___ before noon.`,
          options: distractors(form, [
            form,
            `${have} ${verb.pp}`,
            verb.past,
            `had been ${verb.ing}`,
          ]),
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'past-perfect-continuous') {
        const form = `had been ${verb.ing}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Past Perfect Continuous:',
          sentence: `${subject} ___ for hours before the test.`,
          options: distractors(form, [
            form,
            `had ${verb.pp}`,
            `${have} been ${verb.ing}`,
            `${ww} ${verb.ing}`,
          ]),
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'future-simple') {
        const form = `will ${verb.base}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Future Simple:',
          sentence: `${subject} ___ tomorrow.`,
          options: distractors(form, [
            form,
            `${be} going to ${verb.base}`,
            `will be ${verb.ing}`,
            verb.s,
          ]),
          answer: form,
          tip: t,
        })
        out.push({
          id: id(),
          tenseId,
          type: 'fill',
          prompt: 'Uzupełnij (will + I forma):',
          sentence: `${subject} ___ soon.`,
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'future-continuous') {
        const form = `will be ${verb.ing}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Future Continuous:',
          sentence: `At 8 p.m. ${subject.toLowerCase()} ___ .`,
          options: distractors(form, [
            form,
            `will ${verb.base}`,
            `will have ${verb.pp}`,
            `${be} ${verb.ing}`,
          ]),
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'future-perfect') {
        const form = `will have ${verb.pp}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Future Perfect:',
          sentence: `By Friday ${subject.toLowerCase()} ___ .`,
          options: distractors(form, [
            form,
            `will ${verb.base}`,
            `will be ${verb.ing}`,
            `will have been ${verb.ing}`,
          ]),
          answer: form,
          tip: t,
        })
      }

      if (tenseId === 'future-perfect-continuous') {
        const form = `will have been ${verb.ing}`
        out.push({
          id: id(),
          tenseId,
          type: 'mcq',
          prompt: 'Wybierz Future Perfect Continuous:',
          sentence: `By June ${subject.toLowerCase()} ___ for a year.`,
          options: distractors(form, [
            form,
            `will have ${verb.pp}`,
            `will be ${verb.ing}`,
            `had been ${verb.ing}`,
          ]),
          answer: form,
          tip: t,
        })
      }
    }
  }

  // Spot-the-tense cards (stable set)
  const spotSentences: Partial<Record<TenseId, string[]>> = {
    'present-simple': ['She walks to school every day.', 'Water freezes at 0°C.'],
    'present-continuous': ['They are watching a film now.', 'Look! He is running.'],
    'present-perfect': ['I have already finished.', 'She has never been to Spain.'],
    'present-perfect-continuous': [
      'He has been studying all morning.',
      'We have been waiting since noon.',
    ],
    'past-simple': ['They visited Kraków last year.', 'She wrote a letter yesterday.'],
    'past-continuous': [
      'I was reading when you called.',
      'They were playing at 5 p.m.',
    ],
    'past-perfect': [
      'She had left before we arrived.',
      'I had finished my homework by 8.',
    ],
    'past-perfect-continuous': [
      'He had been running for an hour.',
      'They had been talking all night.',
    ],
    'future-simple': ['I will call you later.', 'She will help us tomorrow.'],
    'future-continuous': [
      'This time tomorrow I will be flying.',
      'They will be sleeping at midnight.',
    ],
    'future-perfect': [
      'By next week I will have finished.',
      'She will have left by then.',
    ],
    'future-perfect-continuous': [
      'By 2028 I will have been teaching for 10 years.',
      'They will have been travelling for months.',
    ],
  }

  const labels = Object.values(TENSE_LABEL)
  for (const sentence of spotSentences[tenseId] ?? []) {
    out.push({
      id: id(),
      tenseId,
      type: 'spot',
      prompt: 'Jaki to czas?',
      sentence,
      options: distractors(TENSE_LABEL[tenseId], labels),
      answer: TENSE_LABEL[tenseId],
      tip: t,
    })
  }

  // Deduplicate by prompt+sentence+answer
  const seen = new Set<string>()
  const unique: Exercise[] = []
  for (const ex of out) {
    const key = `${ex.type}|${ex.prompt}|${ex.sentence ?? ''}|${ex.answer}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(ex)
  }
  return unique
}

const poolCache = new Map<TenseId, Exercise[]>()

/** Hand-authored + generated exercises for a tense (large enough for 20Q × 10). */
export function getSublevelExercisePool(tenseId: TenseId): Exercise[] {
  const cached = poolCache.get(tenseId)
  if (cached) return cached
  const authored = getExercisesForTense(tenseId)
  const generated = buildForTense(tenseId)
  const merged = [...authored, ...generated]
  poolCache.set(tenseId, merged)
  return merged
}

export function pickSublevelExercises(
  tenseId: TenseId,
  level: number,
  count = QUESTIONS_PER_SUBLEVEL,
): Exercise[] {
  const pool = getSublevelExercisePool(tenseId)
  const seed = hashSeed(`${tenseId}::sublevel::${level}`)
  const shuffled = seededShuffle(pool, seed)
  if (shuffled.length >= count) return shuffled.slice(0, count)

  // If somehow short, cycle the pool with a shifted seed
  const result: Exercise[] = []
  let round = 0
  while (result.length < count) {
    const extra = seededShuffle(pool, seed + round + 1)
    for (const ex of extra) {
      result.push({
        ...ex,
        id: `${ex.id}-r${round}-${result.length}`,
      })
      if (result.length >= count) break
    }
    round++
    if (round > 5) break
  }
  return result
}
