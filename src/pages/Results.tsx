import { Link, Navigate } from 'react-router-dom'
import { TENSES, getTense } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import { victoryLine } from '../lib/game'
import { loadResult } from '../lib/run'
import { GhostButton, PrimaryButton, Shell, Stars } from '../components/ui'

export function ResultsPage() {
  const { save } = useSave()
  const result = loadResult()

  if (!result) return <Navigate to="/mapa" replace />

  const tense =
    result.tenseId && result.tenseId !== 'mega'
      ? getTense(result.tenseId)
      : null
  const nextTense = tense
    ? TENSES.find((t) => t.order === tense.order + 1)
    : null

  const title =
    result.mode === 'mega'
      ? 'Mega Boss'
      : result.mode === 'boss'
        ? 'Boss pokonany?'
        : result.cleared
          ? 'Misja ukończona!'
          : 'Misja przerwana'

  return (
    <Shell save={save}>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1fa6a0]/20 to-transparent p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
          Wynik
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-lg text-[#e8ff9a]">{victoryLine(result.percent)}</p>

        <div className="mt-6 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">Wynik</p>
            <p className="font-display text-5xl font-bold text-white">
              {result.percent}%
            </p>
            <p className="text-sm text-white/55">
              {result.correct} / {result.total} poprawnych
            </p>
          </div>
          {result.mode === 'boss' && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-white/45">
                Gwiazdki
              </p>
              <Stars count={result.starsEarned} animate />
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">XP</p>
            <p className="animate-pop font-display text-3xl font-semibold text-[#c8f547]">
              +{result.xpGained}
            </p>
          </div>
          {result.maxCombo > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-white/45">
                Max combo
              </p>
              <p className="text-2xl font-bold">🔥 ×{result.maxCombo}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {result.mode === 'mission' && tense && result.cleared && (
          <Link to={`/boss/${tense.id}`}>
            <PrimaryButton>Idź na bossa</PrimaryButton>
          </Link>
        )}
        {result.mode === 'mission' && tense && !result.cleared && (
          <Link to={`/misja/${tense.id}`}>
            <PrimaryButton>Spróbuj misji jeszcze raz</PrimaryButton>
          </Link>
        )}
        {result.mode === 'boss' && tense && (
          <>
            <Link to={`/boss/${tense.id}`}>
              <PrimaryButton>Rematch z bossem</PrimaryButton>
            </Link>
            {result.starsEarned >= 1 && nextTense && (
              <Link to={`/lekcja/${nextTense.id}`}>
                <GhostButton>Następny poziom: {nextTense.nameEn}</GhostButton>
              </Link>
            )}
          </>
        )}
        {result.mode === 'mega' && (
          <Link to="/boss/mega">
            <PrimaryButton>Jeszcze raz Mega Boss</PrimaryButton>
          </Link>
        )}
        <Link to="/mapa">
          <GhostButton>Mapa</GhostButton>
        </Link>
      </div>

      {result.mistakes.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Przejrzyj błędy</h2>
          <ul className="mt-4 space-y-3">
            {result.mistakes.map((m, i) => (
              <li
                key={i}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-sm font-medium">{m.prompt}</p>
                {m.sentence && (
                  <p className="mt-1 text-sm text-[#e8ff9a]">{m.sentence}</p>
                )}
                <p className="mt-2 text-sm text-[#ff5c5c]">
                  Ty: {m.userAnswer || '—'}
                </p>
                <p className="text-sm text-[#c8f547]">OK: {m.expected}</p>
                <p className="mt-1 text-xs text-white/50">{m.tip}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  )
}
