import { Link, Navigate } from 'react-router-dom'
import { TENSES, getTense } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import { victoryLine } from '../lib/game'
import { loadResult } from '../lib/run'
import {
  SUBLEVELS_PER_TENSE,
  isSublevelUnlocked,
} from '../lib/sublevels'
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
  const nextSub =
    result.mode === 'sublevel' && tense && result.sublevel
      ? result.sublevel + 1
      : null
  const nextSubUnlocked =
    tense && nextSub && nextSub <= SUBLEVELS_PER_TENSE
      ? isSublevelUnlocked(save, tense.id, nextSub)
      : false

  const title =
    result.mode === 'mega'
      ? 'Mega Boss'
      : result.mode === 'boss'
        ? 'Boss pokonany?'
        : result.mode === 'sublevel'
          ? result.cleared
            ? `Podpoziom ${result.sublevel} zaliczony!`
            : `Podpoziom ${result.sublevel} — za mało`
          : result.cleared
            ? 'Misja ukończona!'
            : 'Misja przerwana'

  return (
    <Shell save={save}>
      <div className="panel-hero rounded-3xl p-6 sm:p-8">
        <p className="eyebrow">Wynik</p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-lg text-[var(--color-lime-soft)]">
          {victoryLine(result.percent)}
        </p>

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
            <p className="animate-pop font-display text-3xl font-semibold text-[var(--color-lime)]">
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
            {result.starsEarned >= 1 && (
              <Link to={`/podpoziomy/${tense.id}`}>
                <PrimaryButton>Podpoziomy tego czasu</PrimaryButton>
              </Link>
            )}
            {result.starsEarned >= 1 && nextTense && (
              <Link to={`/lekcja/${nextTense.id}`}>
                <GhostButton>Następny poziom: {nextTense.nameEn}</GhostButton>
              </Link>
            )}
          </>
        )}
        {result.mode === 'sublevel' && tense && result.sublevel && (
          <>
            {!result.cleared && (
              <Link to={`/podpoziomy/${tense.id}/${result.sublevel}`}>
                <PrimaryButton>Spróbuj ponownie</PrimaryButton>
              </Link>
            )}
            {nextSubUnlocked && nextSub && (
              <Link to={`/podpoziomy/${tense.id}/${nextSub}`}>
                <PrimaryButton>Następny podpoziom ({nextSub})</PrimaryButton>
              </Link>
            )}
            <Link to={`/podpoziomy/${tense.id}`}>
              <GhostButton>Lista podpoziomów</GhostButton>
            </Link>
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
              <li key={i} className="panel p-4">
                <p className="text-sm font-medium">{m.prompt}</p>
                {m.sentence && (
                  <p className="mt-1 text-sm text-[var(--color-lime-soft)]">{m.sentence}</p>
                )}
                <p className="mt-2 text-sm text-[var(--color-danger)]">
                  Ty: {m.userAnswer || '—'}
                </p>
                <p className="text-sm text-[var(--color-lime)]">OK: {m.expected}</p>
                <p className="mt-1 text-xs text-white/50">{m.tip}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  )
}
