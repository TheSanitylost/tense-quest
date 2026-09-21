import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ExerciseCard } from '../components/ExerciseCard'
import { GhostButton, Hearts, Shell } from '../components/ui'
import { getExercisesForTense } from '../data/exercises'
import { getTense } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import {
  MISSION_LIVES,
  XP_MISSION_CLEAR,
  applyMissionResult,
  comboXp,
  isMissionUnlocked,
} from '../lib/game'
import { pickMissionExercises, scorePercent } from '../lib/quiz'
import { gradeExercise, storeResult } from '../lib/run'

export function MissionPage() {
  const { tenseId = '' } = useParams()
  const tense = getTense(tenseId)
  const { save, update } = useSave()
  const navigate = useNavigate()

  const exercises = useMemo(() => {
    if (!tense) return []
    return pickMissionExercises(getExercisesForTense(tense.id), 10)
  }, [tense?.id])

  const [index, setIndex] = useState(0)
  const [lives, setLives] = useState(MISSION_LIVES)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null)
  const [shake, setShake] = useState(false)
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

  if (!tense) return <Navigate to="/mapa" replace />
  if (!isMissionUnlocked(save, tense.id)) return <Navigate to="/mapa" replace />

  const current = exercises[index]
  const failed = lives <= 0

  function finish(opts: {
    cleared: boolean
    correct: number
    xp: number
    maxC: number
    mist: typeof mistakes
  }) {
    const percent = scorePercent(opts.correct, exercises.length)
    const totalXp = opts.xp + (opts.cleared ? XP_MISSION_CLEAR : 0)
    update((s) =>
      applyMissionResult(s, tense!.id, {
        percent,
        xpGained: totalXp,
        maxCombo: opts.maxC,
        cleared: opts.cleared,
      }),
    )
    storeResult({
      mode: 'mission',
      tenseId: tense!.id,
      correct: opts.correct,
      total: exercises.length,
      percent,
      xpGained: totalXp,
      maxCombo: opts.maxC,
      starsEarned: 0,
      cleared: opts.cleared,
      mistakes: opts.mist,
    })
    navigate('/wynik')
  }

  function handleSubmit(userAnswer: string) {
    if (!current || locked || failed) return
    setLocked(true)
    const ok = gradeExercise(current, userAnswer)
    let nextCombo = combo
    let nextMax = maxCombo
    let nextCorrect = correctCount
    let nextXp = xpGained
    let nextLives = lives
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
      nextLives = lives - 1
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
      setLives(nextLives)
      setMistakes(nextMistakes)
      setFeedback('bad')
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }

    window.setTimeout(() => {
      setFeedback(null)
      setLocked(false)
      if (nextLives <= 0) {
        finish({
          cleared: false,
          correct: nextCorrect,
          xp: nextXp,
          maxC: nextMax,
          mist: nextMistakes,
        })
        return
      }
      if (index + 1 >= exercises.length) {
        finish({
          cleared: true,
          correct: nextCorrect,
          xp: nextXp,
          maxC: nextMax,
          mist: nextMistakes,
        })
        return
      }
      setIndex((i) => i + 1)
    }, 700)
  }

  if (!current) {
    return (
      <Shell save={save}>
        <p>Brak ćwiczeń.</p>
        <Link to="/mapa">
          <GhostButton>Mapa</GhostButton>
        </Link>
      </Shell>
    )
  }

  return (
    <Shell save={save}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
            Misja · {tense.nameEn}
          </p>
          <p className="text-sm text-white/55">
            Pytanie {index + 1} / {exercises.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Hearts lives={lives} shake={shake} />
          <div
            className={`rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-[#c8f547] ${
              combo >= 3 ? 'animate-pop' : ''
            }`}
          >
            Combo ×{combo}
          </div>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#1fa6a0] transition-all duration-300"
          style={{ width: `${(index / exercises.length) * 100}%` }}
        />
      </div>

      <div
        className={`rounded-2xl border border-white/10 bg-black/25 p-5 sm:p-6 ${
          feedback === 'ok'
            ? 'ring-2 ring-[#c8f547]'
            : feedback === 'bad'
              ? 'ring-2 ring-[#ff5c5c]'
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
          <p className="mt-4 animate-pop font-semibold text-[#c8f547]">
            Tak! +{comboXp(combo)} XP
          </p>
        )}
        {feedback === 'bad' && (
          <p className="mt-4 animate-pop text-[#ff5c5c]">
            Nie tym razem. {current.tip}
          </p>
        )}
      </div>

      <div className="mt-6">
        <Link to={`/lekcja/${tense.id}`}>
          <GhostButton className="text-sm">Wróć do briefingu</GhostButton>
        </Link>
      </div>
    </Shell>
  )
}
