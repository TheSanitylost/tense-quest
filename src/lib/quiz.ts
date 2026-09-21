import type { Exercise } from '../data/exercises'
import type { TenseId } from '../data/tenses'

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Normalize answers for forgiving comparison */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[?.!]+$/g, '')
}

export function answersEqual(user: string, expected: string): boolean {
  const a = normalizeAnswer(user)
  const b = normalizeAnswer(expected)

  if (a === b) return true

  // Accept both don't / do not style for common contractions in expected
  const expand = (s: string) =>
    s
      .replace(/\bdon't\b/g, 'do not')
      .replace(/\bdoesn't\b/g, 'does not')
      .replace(/\bdidn't\b/g, 'did not')
      .replace(/\bisn't\b/g, 'is not')
      .replace(/\baren't\b/g, 'are not')
      .replace(/\bwasn't\b/g, 'was not')
      .replace(/\bweren't\b/g, 'were not')
      .replace(/\bhaven't\b/g, 'have not')
      .replace(/\bhasn't\b/g, 'has not')
      .replace(/\bhadn't\b/g, 'had not')
      .replace(/\bwon't\b/g, 'will not')
      .replace(/\bi'm\b/g, 'i am')

  return expand(a) === expand(b)
}

export function gradeFillOrTransform(
  userAnswer: string,
  exercise: Exercise,
): boolean {
  const alts = exercise.answer.split('|').map((s) => s.trim())
  return alts.some((alt) => answersEqual(userAnswer, alt))
}

export function gradeMcqOrSpot(selected: string, exercise: Exercise): boolean {
  return answersEqual(selected, exercise.answer)
}

/** Match answer encoding: left=>right per line */
export function encodeMatchPairs(
  pairs: { left: string; right: string }[],
): string {
  return pairs.map((p) => `${p.left}=>${p.right}`).join('\n')
}

export function parseMatchAnswer(
  answer: string,
): { left: string; right: string }[] {
  return answer
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf('=>')
      if (idx === -1) return { left: line, right: '' }
      return {
        left: line.slice(0, idx),
        right: line.slice(idx + 2),
      }
    })
}

export function gradeMatch(
  userPairs: { left: string; right: string }[],
  exercise: Exercise,
): boolean {
  const expected = exercise.pairs?.length
    ? exercise.pairs
    : parseMatchAnswer(exercise.answer)
  if (userPairs.length !== expected.length) return false
  const key = (p: { left: string; right: string }) =>
    `${normalizeAnswer(p.left)}=>${normalizeAnswer(p.right)}`
  const expectedSet = new Set(expected.map(key))
  return userPairs.every((p) => expectedSet.has(key(p)))
}

export function scorePercent(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

export function pickMissionExercises(
  pool: Exercise[],
  count = 10,
): Exercise[] {
  return shuffle(pool).slice(0, Math.min(count, pool.length))
}

export function pickBossExercises(pool: Exercise[], count = 10): Exercise[] {
  return shuffle(pool).slice(0, Math.min(count, pool.length))
}

export function pickMegaBossExercises(
  all: Exercise[],
  count = 12,
): Exercise[] {
  // Prefer diversity across tenses
  const byTense = new Map<TenseId, Exercise[]>()
  for (const ex of all) {
    const list = byTense.get(ex.tenseId) ?? []
    list.push(ex)
    byTense.set(ex.tenseId, list)
  }
  const picked: Exercise[] = []
  const tenseIds = shuffle([...byTense.keys()])
  for (const id of tenseIds) {
    if (picked.length >= count) break
    const list = byTense.get(id)
    if (!list?.length) continue
    picked.push(shuffle(list)[0]!)
  }
  if (picked.length < count) {
    const rest = shuffle(all.filter((e) => !picked.includes(e)))
    picked.push(...rest.slice(0, count - picked.length))
  }
  return shuffle(picked)
}

export function weakTenses(
  mistakes: { tenseId: TenseId }[],
): TenseId[] {
  const counts = new Map<TenseId, number>()
  for (const m of mistakes) {
    counts.set(m.tenseId, (counts.get(m.tenseId) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
}
