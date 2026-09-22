import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from '../data/exercises'
import { shuffle } from '../lib/quiz'

interface Props {
  exercise: Exercise
  disabled?: boolean
  onSubmit: (userAnswer: string) => void
}

type ShotMode = 'target' | 'type' | 'link'

function resolveMode(exercise: Exercise): ShotMode {
  if (exercise.type === 'match' && exercise.pairs?.length) return 'link'
  if (
    exercise.type === 'mcq' ||
    exercise.type === 'spot' ||
    (exercise.options && exercise.options.length > 0 && exercise.type !== 'fill')
  ) {
    return 'target'
  }
  return 'type'
}

export function ArcadePlay({ exercise, disabled, onSubmit }: Props) {
  const mode = resolveMode(exercise)

  return (
    <div className="arcade-shell">
      <div className="arcade-mode-tag">
        {mode === 'target' && '🎯 Celownik — zestrzel poprawną odpowiedź'}
        {mode === 'type' && '⚡ Type-Blast — wpisz i wystrzel'}
        {mode === 'link' && '🔗 Link Laser — połącz pary promieniem'}
      </div>

      <PromptBanner exercise={exercise} />

      {mode === 'target' && (
        <TargetRange exercise={exercise} disabled={disabled} onSubmit={onSubmit} />
      )}
      {mode === 'type' && (
        <TypeBlast exercise={exercise} disabled={disabled} onSubmit={onSubmit} />
      )}
      {mode === 'link' && (
        <LinkLaser exercise={exercise} disabled={disabled} onSubmit={onSubmit} />
      )}
    </div>
  )
}

function PromptBanner({ exercise }: { exercise: Exercise }) {
  return (
    <div className="mb-4">
      <p className="eyebrow mb-1">{typeLabel(exercise.type)}</p>
      <h2 className="font-display text-xl font-semibold text-balance sm:text-2xl">
        {exercise.prompt}
      </h2>
      {exercise.sentence && (
        <p className="mt-3 rounded-xl border border-[var(--color-lime)]/25 bg-black/35 px-4 py-3 font-medium leading-relaxed text-[var(--color-lime-soft)]">
          {exercise.sentence}
        </p>
      )}
    </div>
  )
}

function TargetRange({ exercise, disabled, onSubmit }: Props) {
  const options = useMemo(
    () => shuffle(exercise.options ?? []),
    [exercise.id],
  )
  const [picked, setPicked] = useState<string | null>(null)
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null)
  const [arenaPulse, setArenaPulse] = useState<'hit' | 'miss' | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [fx, setFx] = useState<
    {
      id: number
      kind: 'muzzle' | 'spark' | 'laser'
      x: number
      y: number
      ok?: boolean
      angle?: number
      length?: number
    }[]
  >([])
  const arenaRef = useRef<HTMLDivElement>(null)
  const fxId = useRef(0)

  const layouts = useMemo(() => {
    const slots = [
      { top: 10, left: 4 },
      { top: 10, left: 52 },
      { top: 48, left: 4 },
      { top: 48, left: 52 },
      { top: 28, left: 28 },
      { top: 66, left: 28 },
    ]
    return options.map((_, i) => {
      const slot = slots[i % slots.length]!
      return {
        top: slot.top,
        left: slot.left,
        delay: i * 0.25,
        duration: 3.6 + (i % 3) * 0.4,
        drift: i % 2 === 0 ? 1 : -1,
      }
    })
  }, [options])

  function spawnFx(
    items: Omit<(typeof fx)[number], 'id'>[],
    ttl = 650,
  ) {
    const stamped = items.map((item) => ({ ...item, id: ++fxId.current }))
    setFx((prev) => [...prev, ...stamped])
    window.setTimeout(() => {
      const ids = new Set(stamped.map((s) => s.id))
      setFx((prev) => prev.filter((f) => !ids.has(f.id)))
    }, ttl)
  }

  function fire(opt: string, e: React.MouseEvent | React.TouchEvent) {
    if (disabled || picked) return
    const arena = arenaRef.current
    let x = 50
    let y = 50
    if (arena) {
      const rect = arena.getBoundingClientRect()
      const point =
        'touches' in e ? e.changedTouches[0] : (e as React.MouseEvent)
      if (point) {
        x = ((point.clientX - rect.left) / rect.width) * 100
        y = ((point.clientY - rect.top) / rect.height) * 100
      }
    }

    const originX = 50
    const originY = 92
    const dx = x - originX
    const dy = y - originY
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI
    const length = Math.min(90, Math.hypot(dx, dy) * 1.05)

    const ok = opt === exercise.answer || answersLooselyEqual(opt, exercise.answer)

    spawnFx(
      [
        { kind: 'laser', x: originX, y: originY, angle, length, ok },
        { kind: 'muzzle', x, y, ok },
        { kind: 'spark', x, y, ok },
      ],
      ok ? 700 : 550,
    )

    setFlash({ id: opt, ok })
    setArenaPulse(ok ? 'hit' : 'miss')
    setBanner(ok ? '✨ TRAFIONY!' : '💥 PUDŁO!')
    setPicked(opt)

    window.setTimeout(() => setArenaPulse(null), 500)
    window.setTimeout(() => setBanner(null), 520)
    window.setTimeout(() => onSubmit(opt), ok ? 520 : 580)
  }

  return (
    <div
      ref={arenaRef}
      className={`arcade-arena relative h-[300px] overflow-hidden rounded-2xl sm:h-[340px] ${
        arenaPulse === 'hit' ? 'is-arena-hit' : arenaPulse === 'miss' ? 'is-arena-miss' : ''
      }`}
      aria-label="Arena strzelania"
    >
      <div className="arcade-arena-grid pointer-events-none absolute inset-0" />
      <div className="arcade-arena-scan pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />

      <div className="arcade-cannon pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
        <span className="arcade-cannon-core" />
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        Celuj i stuknij tarczę
      </div>

      {banner && (
        <div
          className={`arcade-banner pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 ${
            flash?.ok ? 'is-hit' : 'is-miss'
          }`}
        >
          {banner}
        </div>
      )}

      {options.map((opt, i) => {
        const layout = layouts[i]!
        const isPicked = picked === opt
        const flashState = flash?.id === opt ? flash : null
        return (
          <button
            key={`${i}-${opt}`}
            type="button"
            disabled={disabled || !!picked}
            onClick={(e) => fire(opt, e)}
            className={`arcade-target absolute w-[44%] max-w-[44%] px-3 py-2.5 text-center text-sm font-semibold leading-snug sm:text-base ${
              flashState?.ok
                ? 'is-hit'
                : flashState && !flashState.ok
                  ? 'is-miss'
                  : isPicked
                    ? 'opacity-60'
                    : ''
            }`}
            style={{
              top: `${layout.top}%`,
              left: `${layout.left}%`,
              animationDelay: `${layout.delay}s`,
              animationDuration: `${layout.duration}s`,
              ['--drift' as string]: String(layout.drift),
              zIndex: 2 + i,
            }}
          >
            <span className="arcade-target-ring" aria-hidden />
            <span className="arcade-target-glow" aria-hidden />
            <span className="relative z-[1] break-words">{opt}</span>
          </button>
        )
      })}

      {fx.map((f) => {
        if (f.kind === 'laser') {
          return (
            <span
              key={f.id}
              className="arcade-laser-wrap pointer-events-none absolute z-20"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: `rotate(${f.angle}deg)`,
              }}
            >
              <span
                className={`arcade-laser ${f.ok ? 'is-hit' : 'is-miss'}`}
                style={{ width: `${f.length}%` }}
              />
            </span>
          )
        }
        if (f.kind === 'spark') {
          return (
            <span
              key={f.id}
              className={`arcade-spark-burst pointer-events-none absolute z-25 ${f.ok ? 'is-hit' : 'is-miss'}`}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
              aria-hidden
            >
              {Array.from({ length: 8 }, (_, n) => (
                <i
                  key={n}
                  style={{ ['--i' as string]: n }}
                />
              ))}
            </span>
          )
        }
        return (
          <span
            key={f.id}
            className={`arcade-muzzle pointer-events-none absolute z-20 ${f.ok ? 'is-hit' : 'is-miss'}`}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          />
        )
      })}
    </div>
  )
}

function answersLooselyEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function TypeBlast({ exercise, disabled, onSubmit }: Props) {
  const [value, setValue] = useState('')
  const [charging, setCharging] = useState(false)
  const [heat, setHeat] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [exercise.id])

  useEffect(() => {
    if (!value.trim()) {
      setHeat(0)
      return
    }
    setHeat(Math.min(100, 18 + value.trim().length * 7))
  }, [value])

  function fire() {
    if (disabled || !value.trim() || charging) return
    setCharging(true)
    setHeat(100)
    window.setTimeout(() => {
      onSubmit(value)
    }, 420)
  }

  return (
    <div
      className={`arcade-type-bay relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 ${
        charging ? 'is-blasting' : ''
      }`}
    >
      {charging && <div className="arcade-type-shockwave" aria-hidden />}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-teal-bright)]">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-lime)]" />
          Działo słowne
        </div>
        <span className="text-xs font-bold text-[var(--color-lime)]">{heat}% charge</span>
      </div>
      <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="arcade-charge-bar h-full rounded-full"
          style={{ width: `${heat}%` }}
        />
      </div>
      <label className="block space-y-2">
        <span className="text-sm text-white/60">Amunicja (odpowiedź)</span>
        <input
          ref={inputRef}
          value={value}
          disabled={disabled || charging}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') fire()
          }}
          className="input-field font-semibold tracking-wide"
          placeholder="Wpisz formę / zdanie…"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <button
        type="button"
        disabled={disabled || charging || !value.trim()}
        onClick={fire}
        className={`arcade-fire-btn mt-4 w-full ${charging ? 'is-firing' : ''}`}
      >
        {charging ? '🚀 WYSTRZAŁ…' : '🔥 WYSTRZEL ODPOWIEDŹ'}
      </button>
      <p className="mt-3 text-center text-xs text-white/40">
        Enter też strzela · don’t / doesn’t przechodzą
      </p>
    </div>
  )
}

function LinkLaser({ exercise, disabled, onSubmit }: Props) {
  const pairs = exercise.pairs ?? []
  const lefts = useMemo(() => pairs.map((p) => p.left), [exercise.id])
  const rights = useMemo(
    () => shuffle(pairs.map((p) => p.right)),
    [exercise.id],
  )
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [beam, setBeam] = useState(false)
  const [burstLabel, setBurstLabel] = useState<string | null>(null)

  const remainingRights = rights.filter(
    (r) => !Object.values(matched).includes(r),
  )
  const remainingLefts = lefts.filter((l) => !(l in matched))

  function tryMatch(right: string) {
    if (!selectedLeft || disabled) return
    setBeam(true)
    setBurstLabel(`${selectedLeft} ⟷ ${right}`)
    window.setTimeout(() => setBeam(false), 420)
    window.setTimeout(() => setBurstLabel(null), 480)
    const next = { ...matched, [selectedLeft]: right }
    setMatched(next)
    setSelectedLeft(null)
    if (Object.keys(next).length === pairs.length) {
      const userPairs = Object.entries(next).map(([left, r]) => ({
        left,
        right: r,
      }))
      window.setTimeout(() => onSubmit(JSON.stringify(userPairs)), 360)
    }
  }

  return (
    <div className={`relative ${beam ? 'arcade-beam-flash' : ''}`}>
      {burstLabel && (
        <div className="arcade-link-toast pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
          ⚡ {burstLabel}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white/50">Źródło</p>
          {remainingLefts.map((l) => (
            <button
              key={l}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedLeft(l)}
              className={`choice-option w-full ${
                selectedLeft === l ? 'is-selected arcade-lock-on' : ''
              }`}
            >
              {l}
            </button>
          ))}
          {Object.entries(matched).map(([l, r]) => (
            <div
              key={l}
              className="arcade-link-done rounded-xl border border-[var(--color-teal)]/45 bg-[var(--color-teal)]/15 px-3 py-2 text-sm font-medium text-[var(--color-lime-soft)]"
            >
              {l} ⟷ {r}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white/50">Cel</p>
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
      <p className="mt-3 text-xs text-white/45">
        Zablokuj lewy cel, potem strzel w prawy odpowiednik.
      </p>
      {selectedLeft && (
        <p className="mt-2 animate-pop text-sm font-semibold text-[var(--color-lime)]">
          📡 Namierzono: {selectedLeft}
        </p>
      )}
    </div>
  )
}

function typeLabel(type: Exercise['type']) {
  switch (type) {
    case 'mcq':
      return 'Misja wyborowa'
    case 'fill':
      return 'Misja luk'
    case 'transform':
      return 'Misja transform'
    case 'match':
      return 'Misja połączeń'
    case 'spot':
      return 'Misja rozpoznania'
  }
}
