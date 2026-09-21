import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ExerciseCard } from '../components/ExerciseCard'
import { GhostButton, Shell } from '../components/ui'
import { pickSublevelExercises } from '../data/sublevelBank'
import { getTense } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import { applySublevelResult, comboXp } from '../lib/game'
import { scorePercent } from '../lib/quiz'
import { gradeExercise, storeResult } from '../lib/run'
import {
  QUESTIONS_PER_SUBLEVEL,
  SUBLEVEL_PASS_PERCENT,
  SUBLEVELS_PER_TENSE,
  isSublevelUnlocked,
  sublevelDifficultyLabel,
} from '../lib/sublevels'

export function SublevelRunPage() {
  const { tenseId = '', level: levelParam = '' } = useParams()
  const level = Number(levelParam)
  const tense = getTense(tenseId)
  const { save, update } = useSave()
  const navigate = useNavigate()

  const validLevel =
    Number.isInteger(level) && level >= 1 && level <= SUBLEVELS_PER_TENSE

  const exercises = useMemo(() => {
    if (!tense || !validLevel) return []
    return pickSublevelExercises(tense.id, level, QUESTIONS_PER_SUBLEVEL)
  }, [tense?.id, level, validLevel])

  const [index, setIndex] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null)
  const [locked, setLocked] = useState(false)
  const [mistakes, setMistakes] = useState<
    {
      prompt: string
      sentence?: string
      userAnswer: string
      expected: string
      tip: string
      tenseId: string
    }[]
  >([])

  if (!tense || !validLevel) return <Navigate to="/podpoziomy" replace />
  if (!isSublevelUnlocked(save, tense.id, level)) {
    return <Navigate to={`/podpoziomy/${tense.id}`} replace />
  }

  const current = exercises[index]

  function finish(opts: {
    correct: number
    xp: number
    maxC: number
    mist: typeof mistakes
  }) {
    const percent = scorePercent(opts.correct, exercises.length)
    const cleared = percent >= SUBLEVEL_PASS_PERCENT
    update((s) =>
      applySublevelResult(s, tense!.id, level, {
        percent,
        xpGained: opts.xp,
        maxCombo: opts.maxC,
      }),
    )
    storeResult({
      mode: 'sublevel',
      tenseId: tense!.id,
      sublevel: level,
      correct: opts.correct,
      total: exercises.length,
      percent,
      xpGained: opts.xp,
      maxCombo: opts.maxC,
      starsEarned: 0,
      cleared,
      mistakes: opts.mist,
    })
    navigate('/wynik')
  }

  function handleSubmit(userAnswer: string) {
    if (!current || locked) return
    setLocked(true)
    const ok = gradeExercise(current, userAnswer)
    let nextCombo = combo
    let nextMax = maxCombo
    let nextCorrect = correctCount
    let nextXp = xpGained
    let nextMistakes = mistakes

    if (ok) {
      nextCombo = combo + 1
      nextMax = Math.max(maxCombo, nextCombo)
      nextCorrect = correctCount + 1
      nextXp = xpGained + comboXp(nextCombo)
      setCombo(nextCombo)
      setMaxCombo(nextMax)
      setCorrectCount(nextCorrect)
      setXpGained(nextXp)
      setFeedback('ok')
    } else {
      nextCombo = 0
      nextMistakes = [
        ...mistakes,
        {
          prompt: current.prompt,
          sentence: current.sentence,
          userAnswer,
          expected: current.answer,
          tip: current.tip,
          tenseId: current.tenseId,
        },
      ]
      setCombo(0)
      setMistakes(nextMistakes)
      setFeedback('bad')
    }

    window.setTimeout(() => {
      setFeedback(null)
      setLocked(false)
      if (index + 1 >= exercises.length) {
        finish({
          correct: nextCorrect,
          xp: nextXp,
          maxC: nextMax,
          mist: nextMistakes,
        })
        return
      }
      setIndex((i) => i + 1)
    }, 650)
  }

  if (!current) {
    return (
      <Shell save={save}>
        <p>Brak ćwiczeń.</p>
        <Link to={`/podpoziomy/${tense.id}`}>
          <GhostButton>Wróć</GhostButton>
        </Link>
      </Shell>
    )
  }

  const progressPct = (index / exercises.length) * 100

  return (
    <Shell save={save}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">
            Podpoziom {level} · {sublevelDifficultyLabel(level)}
          </p>
          <h1 className="font-display text-xl font-semibold sm:text-2xl">{tense.nameEn}</h1>
          <p className="text-sm text-white/55">
            Pytanie {index + 1} / {exercises.length}
          </p>
        </div>
        <div
          className={`chip chip-lime ${combo >= 3 ? 'animate-pop' : ''}`}
        >
          Combo ×{combo}
        </div>
      </div>

      <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-teal)] via-[var(--color-teal-bright)] to-[var(--color-lime)] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        className={`panel panel-quiz p-5 sm:p-6 ${
          feedback === 'ok'
            ? 'ring-2 ring-[var(--color-lime)]'
            : feedback === 'bad'
              ? 'ring-2 ring-[var(--color-danger)]'
              : ''
        }`}
      >
        <ExerciseCard
          key={current.id}
          exercise={current}
          disabled={locked}
          onSubmit={handleSubmit}
        />
        {feedback === 'ok' && (
          <p className="mt-4 animate-pop font-semibold text-[var(--color-lime)]">
            Tak! +{comboXp(combo)} XP
          </p>
        )}
        {feedback === 'bad' && (
          <p className="mt-4 animate-pop text-[var(--color-danger)]">
            Nie tym razem. {current.tip}
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-white/40">
        Próg zaliczenia: {SUBLEVEL_PASS_PERCENT}% · bez limitów żyć — liczy się dokładność
      </p>

      <div className="mt-6">
        <Link to={`/podpoziomy/${tense.id}`}>
          <GhostButton className="text-sm">Przerwij → lista podpoziomów</GhostButton>
        </Link>
      </div>
    </Shell>
  )
}
