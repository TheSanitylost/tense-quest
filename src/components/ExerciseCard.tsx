import { useMemo, useState } from 'react'
import type { Exercise } from '../data/exercises'
import { shuffle } from '../lib/quiz'
import { PrimaryButton } from './ui'

interface Props {
  exercise: Exercise
  disabled?: boolean
  onSubmit: (userAnswer: string) => void
}

export function ExerciseCard({ exercise, disabled, onSubmit }: Props) {
  if (exercise.type === 'match' && exercise.pairs) {
    return (
      <MatchExercise
        exercise={exercise}
        disabled={disabled}
        onSubmit={onSubmit}
      />
    )
  }

  if (
    exercise.type === 'mcq' ||
    exercise.type === 'spot' ||
    (exercise.options && exercise.options.length > 0 && exercise.type !== 'fill')
  ) {
    return (
      <ChoiceExercise
        exercise={exercise}
        disabled={disabled}
        onSubmit={onSubmit}
      />
    )
  }

  return (
    <TextExercise exercise={exercise} disabled={disabled} onSubmit={onSubmit} />
  )
}

function ChoiceExercise({ exercise, disabled, onSubmit }: Props) {
  const options = useMemo(
    () => shuffle(exercise.options ?? []),
    [exercise.id],
  )
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Prompt exercise={exercise} />
      <div className="grid gap-2">
        {options.map((opt) => {
          const selected = picked === opt
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled || picked !== null}
              onClick={() => {
                setPicked(opt)
                onSubmit(opt)
              }}
              className={`choice-option ${selected ? 'is-selected' : ''} disabled:opacity-70`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TextExercise({ exercise, disabled, onSubmit }: Props) {
  const [value, setValue] = useState('')

  function submit() {
    if (!value.trim()) return
    onSubmit(value)
  }

  return (
    <div className="space-y-4">
      <Prompt exercise={exercise} />
      <label className="block space-y-2">
        <span className="text-sm text-white/60">Twoja odpowiedź</span>
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          className="input-field"
          placeholder="Wpisz odpowiedź…"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <PrimaryButton
        disabled={disabled || !value.trim()}
        onClick={submit}
        className="w-full sm:w-auto"
      >
        Sprawdź
      </PrimaryButton>
      <p className="text-xs text-white/45">
        Tip: skróty typu don’t / doesn’t też przechodzą.
      </p>
    </div>
  )
}

function MatchExercise({ exercise, disabled, onSubmit }: Props) {
  const pairs = exercise.pairs ?? []
  const lefts = useMemo(() => pairs.map((p) => p.left), [exercise.id])
  const rights = useMemo(
    () => shuffle(pairs.map((p) => p.right)),
    [exercise.id],
  )
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})

  const remainingRights = rights.filter(
    (r) => !Object.values(matched).includes(r),
  )
  const remainingLefts = lefts.filter((l) => !(l in matched))

  function tryMatch(right: string) {
    if (!selectedLeft || disabled) return
    const next = { ...matched, [selectedLeft]: right }
    setMatched(next)
    setSelectedLeft(null)
    if (Object.keys(next).length === pairs.length) {
      const userPairs = Object.entries(next).map(([left, r]) => ({
        left,
        right: r,
      }))
      onSubmit(JSON.stringify(userPairs))
    }
  }

  return (
    <div className="space-y-4">
      <Prompt exercise={exercise} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white/50">
            Angielski
          </p>
          {remainingLefts.map((l) => (
            <button
              key={l}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedLeft(l)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium ${
                selectedLeft === l
                  ? 'border-[#c8f547] bg-[#c8f547]/20'
                  : 'border-white/15 bg-white/5'
              }`}
            >
              {l}
            </button>
          ))}
          {Object.entries(matched).map(([l, r]) => (
            <div
              key={l}
              className="rounded-xl border border-[#1fa6a0]/40 bg-[#1fa6a0]/10 px-3 py-2 text-sm"
            >
              {l} → {r}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white/50">
            Polski / znaczenie
          </p>
          {remainingRights.map((r) => (
            <button
              key={r}
              type="button"
              disabled={disabled || !selectedLeft}
              onClick={() => tryMatch(r)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm font-medium disabled:opacity-40"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-white/45">
        Kliknij lewą pozycję, potem prawą — połącz wszystkie pary.
      </p>
    </div>
  )
}

function Prompt({ exercise }: { exercise: Exercise }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
        {typeLabel(exercise.type)}
      </p>
      <h2 className="font-display text-xl font-semibold text-balance sm:text-2xl">
        {exercise.prompt}
      </h2>
      {exercise.sentence && (
        <p className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-medium leading-relaxed text-[#e8ff9a]">
          {exercise.sentence}
        </p>
      )}
    </div>
  )
}

function typeLabel(type: Exercise['type']) {
  switch (type) {
    case 'mcq':
      return 'Wybór'
    case 'fill':
      return 'Luka'
    case 'transform':
      return 'Przekształć'
    case 'match':
      return 'Dopasuj'
    case 'spot':
      return 'Rozpoznaj czas'
  }
}
