import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ExerciseCard } from '../components/ExerciseCard'
import { GhostButton, Shell } from '../components/ui'
import { EXERCISES, getExercisesForTense } from '../data/exercises'
import { getTense } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import {
  XP_BOSS_CLEAR,
  XP_MEGA_CLEAR,
  XP_PER_CORRECT,
  applyBossResult,
  applyMegaBossResult,
  isBossUnlocked,
  isMegaBossUnlocked,
  starsFromBossPercent,
} from '../lib/game'
import {
  pickBossExercises,
  pickMegaBossExercises,
  scorePercent,
} from '../lib/quiz'
import { gradeExercise, storeResult } from '../lib/run'

const BOSS_SECONDS = 90

export function BossPage() {
  const { tenseId = '' } = useParams()
  const isMega = tenseId === 'mega'
  const tense = isMega ? null : getTense(tenseId)
  const { save, update } = useSave()
  const navigate = useNavigate()
  const finishedRef = useRef(false)

  const exercises = useMemo(() => {
    if (isMega) return pickMegaBossExercises(EXERCISES, 12)
    if (!tense) return []
    return pickBossExercises(getExercisesForTense(tense.id), 10)
  }, [isMega, tense?.id])

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answers, setAnswers] = useState<
    { userAnswer: string; correct: boolean }[]
  >([])
  const [secondsLeft, setSecondsLeft] = useState(BOSS_SECONDS)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (finishedRef.current) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (secondsLeft === 0 && !finishedRef.current) {
      finalize(correctCount, answers, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  if (!isMega && !tense) return <Navigate to="/mapa" replace />
  if (!isMega && tense && !isBossUnlocked(save, tense.id)) {
    return <Navigate to="/mapa" replace />
  }
  if (isMega && !isMegaBossUnlocked(save)) {
    return <Navigate to="/mapa" replace />
  }

  const current = exercises[index]
  const title = isMega ? 'Mega Boss' : `Boss · ${tense!.nameEn}`

  function finalize(
    correct: number,
    ans: { userAnswer: string; correct: boolean }[],
    timedOut = false,
  ) {
    if (finishedRef.current) return
    finishedRef.current = true
    const total = exercises.length
    const percent = scorePercent(correct, total)
    const stars = isMega ? 0 : starsFromBossPercent(percent)
    const clearBonus = isMega
      ? percent >= 60
        ? XP_MEGA_CLEAR
        : 0
      : percent >= 60
        ? XP_BOSS_CLEAR
        : 0
    const xpGained = correct * XP_PER_CORRECT + clearBonus

    if (isMega) {
      update((s) => applyMegaBossResult(s, { percent, xpGained }))
    } else {
      update((s) => applyBossResult(s, tense!.id, { percent, xpGained }))
    }

    const mistakes = exercises
      .map((ex, i) => {
        const a = ans[i]
        if (a?.correct) return null
        return {
          prompt: ex.prompt,
          sentence: ex.sentence,
          userAnswer:
            a?.userAnswer ?? (timedOut ? '(brak odpowiedzi — czas!)' : ''),
          expected: ex.answer,
          tip: ex.tip,
          tenseId: ex.tenseId,
        }
      })
      .filter(Boolean) as {
      prompt: string
      sentence?: string
      userAnswer: string
      expected: string
      tip: string
      tenseId: string
    }[]

    storeResult({
      mode: isMega ? 'mega' : 'boss',
      tenseId: isMega ? 'mega' : tense!.id,
      correct,
      total,
      percent,
      xpGained,
      maxCombo: 0,
      starsEarned: stars,
      cleared: percent >= 60,
      mistakes,
    })
    navigate('/wynik')
  }

  function handleSubmit(userAnswer: string) {
    if (!current || locked || finishedRef.current) return
    setLocked(true)
    const ok = gradeExercise(current, userAnswer)
    const nextCorrect = correctCount + (ok ? 1 : 0)
    const nextAnswers = [...answers, { userAnswer, correct: ok }]
    setCorrectCount(nextCorrect)
    setAnswers(nextAnswers)

    window.setTimeout(() => {
      setLocked(false)
      if (index + 1 >= exercises.length) {
        finalize(nextCorrect, nextAnswers)
      } else {
        setIndex((i) => i + 1)
      }
    }, 250)
  }

  if (!current) {
    return (
      <Shell save={save}>
        <p>Brak pytań.</p>
        <Link to="/mapa">
          <GhostButton>Mapa</GhostButton>
        </Link>
      </Shell>
    )
  }

  const timePct = (secondsLeft / BOSS_SECONDS) * 100

  return (
    <Shell save={save}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#ffb020]">
            {title}
          </p>
          <p className="text-sm text-white/55">
            Pytanie {index + 1} / {exercises.length} · odpowiedzi na końcu
          </p>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 font-mono text-sm font-bold tabular-nums">
          ⏱ {secondsLeft}s
        </div>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            secondsLeft < 15 ? 'bg-[#ff5c5c]' : 'bg-[#ffb020]'
          }`}
          style={{ width: `${timePct}%` }}
        />
      </div>

      <div className="rounded-2xl border border-[#ffb020]/30 bg-black/30 p-5 sm:p-6">
        <ExerciseCard
          key={current.id}
          exercise={current}
          disabled={locked}
          onSubmit={handleSubmit}
        />
      </div>

      <p className="mt-4 text-xs text-white/40">
        Soft timer — jak skończy się czas, kończysz z obecnym wynikiem. Bez serc,
        czysta gra.
      </p>
    </Shell>
  )
}
