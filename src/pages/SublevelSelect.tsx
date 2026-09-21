import { Link, Navigate, useParams } from 'react-router-dom'
import { getTense } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import {
  QUESTIONS_PER_SUBLEVEL,
  SUBLEVELS_PER_TENSE,
  getSublevelBest,
  isSublevelCleared,
  isSublevelUnlocked,
  isTenseCleared,
  sublevelDifficultyLabel,
} from '../lib/sublevels'
import { GhostButton, Shell } from '../components/ui'

export function SublevelSelectPage() {
  const { tenseId = '' } = useParams()
  const tense = getTense(tenseId)
  const { save } = useSave()

  if (!tense) return <Navigate to="/podpoziomy" replace />
  if (!isTenseCleared(save, tense.id)) return <Navigate to="/podpoziomy" replace />

  return (
    <Shell save={save}>
      <div className="mb-8">
        <p className="eyebrow">Podpoziomy</p>
        <h1 className="font-display mt-1 text-3xl font-bold sm:text-4xl">{tense.nameEn}</h1>
        <p className="mt-2 text-white/60">
          10 etapów · {QUESTIONS_PER_SUBLEVEL} pytań każde · odblokuj kolejny wynikiem ≥ 60%
        </p>
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: SUBLEVELS_PER_TENSE }, (_, i) => {
          const level = i + 1
          const unlocked = isSublevelUnlocked(save, tense.id, level)
          const cleared = isSublevelCleared(save, tense.id, level)
          const best = getSublevelBest(save, tense.id, level)
          const body = (
            <div
              className={`flex h-full flex-col rounded-2xl border px-3 py-4 transition ${
                unlocked
                  ? cleared
                    ? 'border-[var(--color-lime)]/50 bg-[var(--color-lime)]/10'
                    : 'border-white/15 bg-white/5 hover:border-[var(--color-teal-bright)]/50 hover:bg-white/8'
                  : 'border-white/5 bg-black/25 opacity-45'
              }`}
            >
              <span className="font-display text-2xl font-bold">{level}</span>
              <span className="mt-1 text-[11px] uppercase tracking-wider text-white/45">
                {sublevelDifficultyLabel(level)}
              </span>
              <span className="mt-auto pt-3 text-sm font-semibold text-[var(--color-lime-soft)]">
                {unlocked ? (best > 0 ? `${best}%` : 'Start') : '🔒'}
              </span>
            </div>
          )

          return (
            <li key={level}>
              {unlocked ? (
                <Link to={`/podpoziomy/${tense.id}/${level}`} className="block h-full">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/podpoziomy">
          <GhostButton className="text-sm">← Wszystkie podpoziomy</GhostButton>
        </Link>
        <Link to={`/lekcja/${tense.id}`}>
          <GhostButton className="text-sm">Briefing</GhostButton>
        </Link>
      </div>
    </Shell>
  )
}
