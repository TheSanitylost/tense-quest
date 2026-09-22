import { useMemo, useState } from 'react'
import type { Exercise } from '../data/exercises'
import { shuffle } from '../lib/quiz'
import { PrimaryButton } from './ui'

/** Classic list UI — prefer ArcadePlay during active runs. */
export function ExerciseCard({
  exercise,
  disabled,
  onSubmit,
}: {
  exercise: Exercise
  disabled?: boolean
  onSubmit: (userAnswer: string) => void
}) {
  if (exercise.type === 'match' && exercise.pairs) {
    return (
      <MatchExercise exercise={exercise} disabled={disabled} onSubmit={onSubmit} />
    )
  }
  if (
    exercise.type === 'mcq' ||
    exercise.type === 'spot' ||
    (exercise.options && exercise.options.length > 0 && exercise.type !== 'fill')
  ) {
    return (
      <ChoiceExercise exercise={exercise} disabled={disabled} onSubmit={onSubmit} />
    )
  }
  return <TextExercise exercise={exercise} disabled={disabled} onSubmit={onSubmit} />
}

type Props = {
  exercise: Exercise
  disabled?: boolean
  onSubmit: (userAnswer: string) => void
}

function ChoiceExercise({ exercise, disabled, onSubmit }: Props) {
  const options = useMemo(() => shuffle(exercise.options ?? []), [exercise.id])
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="space-y-4">
      <Prompt exercise={exercise} />
      <div className="grid gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled || picked !== null}
            onClick={() => {
              setPicked(opt)
              onSubmit(opt)
            }}
            className={`choice-option ${picked === opt ? 'is-selected' : ''} disabled:opacity-70`}
          >
            {opt}
          </button>
        ))}
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
      <PrimaryButton disabled={disabled || !value.trim()} onClick={submit} className="w-full sm:w-auto">
        Sprawdź
      </PrimaryButton>
    </div>
  )
}

function MatchExercise({ exercise, disabled, onSubmit }: Props) {
  const pairs = exercise.pairs ?? []
  const lefts = useMemo(() => pairs.map((p) => p.left), [exercise.id])
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [exercise.id])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const remainingRights = rights.filter((r) => !Object.values(matched).includes(r))
  const remainingLefts = lefts.filter((l) => !(l in matched))

  function tryMatch(right: string) {
    if (!selectedLeft || disabled) return
    const next = { ...matched, [selectedLeft]: right }
    setMatched(next)
    setSelectedLeft(null)
    if (Object.keys(next).length === pairs.length) {
      onSubmit(
        JSON.stringify(
          Object.entries(next).map(([left, r]) => ({ left, right: r })),
        ),
      )
    }
  }

  return (
    <div className="space-y-4">
      <Prompt exercise={exercise} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {remainingLefts.map((l) => (
            <button
              key={l}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedLeft(l)}
              className={`choice-option w-full ${selectedLeft === l ? 'is-selected' : ''}`}
            >
              {l}
            </button>
          ))}
          {Object.entries(matched).map(([l, r]) => (
            <div
              key={l}
              className="rounded-xl border border-[var(--color-teal)]/40 bg-[var(--color-teal)]/10 px-3 py-2 text-sm"
            >
              {l} → {r}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {remainingRights.map((r) => (
            <button
              key={r}
              type="button"
              disabled={disabled || !selectedLeft}
              onClick={() => tryMatch(r)}
              className="choice-option w-full disabled:opacity-40"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Prompt({ exercise }: { exercise: Exercise }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold sm:text-2xl">{exercise.prompt}</h2>
      {exercise.sentence && (
        <p className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[var(--color-lime-soft)]">
          {exercise.sentence}
        </p>
      )}
    </div>
  )
}
