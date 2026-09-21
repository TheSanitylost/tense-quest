import { Link } from 'react-router-dom'
import { useSave } from '../hooks/useSave'
import {
  SUBLEVELS_PER_TENSE,
  clearedSublevelCount,
  clearedTenses,
  totalClearedSublevels,
} from '../lib/sublevels'
import { GhostButton, PrimaryButton, Shell } from '../components/ui'

export function SublevelsHubPage() {
  const { save } = useSave()
  const cleared = clearedTenses(save)
  const total = totalClearedSublevels(save)

  return (
    <Shell save={save}>
      <section className="panel-hero mb-8 overflow-hidden px-6 py-10 sm:px-8">
        <p className="eyebrow">Strefa treningowa</p>
        <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Podpoziomy</h1>
        <p className="mt-3 max-w-lg text-white/65">
          Osobna arena po ukończeniu bossa. Każdy czas ma 10 podpoziomów po 20 pytań —
          od rozgrzewki po ekstremum.
        </p>
        <p className="mt-4 text-sm font-semibold text-[var(--color-lime)]">
          Ukończone podpoziomy: {total}
        </p>
      </section>

      {cleared.length === 0 ? (
        <div className="panel px-5 py-8 text-center">
          <p className="font-display text-xl font-semibold">Na razie pusto</p>
          <p className="mt-2 text-white/55">
            Pokonaj bossa (min. 1★), żeby odblokować podpoziomy danego czasu.
          </p>
          <Link to="/mapa" className="mt-6 inline-block">
            <PrimaryButton>Idź na mapę</PrimaryButton>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {cleared.map((t) => {
            const done = clearedSublevelCount(save, t.id)
            const pct = Math.round((done / SUBLEVELS_PER_TENSE) * 100)
            return (
              <li key={t.id}>
                <Link
                  to={`/podpoziomy/${t.id}`}
                  className="panel-interactive block px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">Poziom {t.order}</p>
                      <h2 className="font-display mt-1 text-xl font-semibold">{t.nameEn}</h2>
                      <p className="text-sm text-white/50">{t.namePl}</p>
                    </div>
                    <span className="chip chip-lime shrink-0">
                      {done}/{SUBLEVELS_PER_TENSE}
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-lime)] transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-8">
        <Link to="/mapa">
          <GhostButton className="text-sm">← Mapa poziomów</GhostButton>
        </Link>
      </div>
    </Shell>
  )
}
