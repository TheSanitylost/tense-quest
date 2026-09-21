import { Link } from 'react-router-dom'
import { TENSES } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import {
  isBossUnlocked,
  isMegaBossUnlocked,
  isMissionUnlocked,
  isTenseUnlocked,
  totalStars,
} from '../lib/game'
import { Shell } from '../components/ui'

export function MapPage() {
  const { save } = useSave()
  const stars = totalStars(save)
  const mega = isMegaBossUnlocked(save)

  return (
    <Shell save={save}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Mapa poziomów</h1>
        <p className="mt-2 text-white/60">
          Briefing → Misja → Boss. Odblokuj kolejny czas jedną gwiazdką.
        </p>
      </div>

      <ol className="relative space-y-0">
        <div className="absolute top-4 bottom-4 left-[27px] w-0.5 bg-gradient-to-b from-[#c8f547] via-[#1fa6a0] to-white/10 sm:left-[31px]" />
        {TENSES.map((t, i) => {
          const unlocked = isTenseUnlocked(save, t.id)
          const missionOk = isMissionUnlocked(save, t.id)
          const bossOk = isBossUnlocked(save, t.id)
          const progress = save.tenseProgress[t.id]
          const s = progress?.stars ?? 0

          return (
            <li key={t.id} className="relative flex gap-4 pb-8 sm:gap-5">
              <div
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition sm:h-16 sm:w-16 ${
                  unlocked
                    ? s > 0
                      ? 'animate-pop border-[#c8f547] bg-[#c8f547] text-[#071e1c]'
                      : 'border-[#2dd4bf] bg-[#0b3d3a] text-[#c8f547]'
                    : 'border-white/20 bg-[#071e1c] text-white/40'
                }`}
              >
                {unlocked ? t.order : '🔒'}
              </div>
              <div
                className={`flex-1 rounded-2xl border px-4 py-4 sm:px-5 ${
                  unlocked
                    ? 'border-white/15 bg-white/5'
                    : 'border-white/5 bg-black/20 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#2dd4bf]">
                      Poziom {t.order}
                      {i === 0 ? ' · start' : ''}
                    </p>
                    <h2 className="font-display text-xl font-semibold">{t.nameEn}</h2>
                    <p className="text-sm text-white/55">{t.namePl}</p>
                    <p className="mt-1 text-sm text-[#e8ff9a]/80">{t.vibe}</p>
                  </div>
                  <p className="text-[#c8f547]">{'★'.repeat(s)}{'☆'.repeat(3 - s)}</p>
                </div>

                {unlocked ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/lekcja/${t.id}`}
                      className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                    >
                      Briefing
                    </Link>
                    {missionOk && (
                      <Link
                        to={`/misja/${t.id}`}
                        className="rounded-lg bg-[#1fa6a0]/30 px-3 py-2 text-sm font-semibold text-[#e8ff9a] hover:bg-[#1fa6a0]/45"
                      >
                        Misja
                      </Link>
                    )}
                    {bossOk ? (
                      <Link
                        to={`/boss/${t.id}`}
                        className="rounded-lg bg-[#c8f547]/90 px-3 py-2 text-sm font-bold text-[#071e1c] hover:brightness-110"
                      >
                        Boss
                      </Link>
                    ) : (
                      <span className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/40">
                        Boss 🔒 (ukończ misję)
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-white/40">
                    Odblokuj 1★ na poprzednim bossie.
                  </p>
                )}
              </div>
            </li>
          )
        })}

        <li className="relative flex gap-4 sm:gap-5">
          <div
            className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-lg sm:h-16 sm:w-16 ${
              mega
                ? 'border-[#c8f547] bg-[#c8f547] text-[#071e1c]'
                : 'border-white/20 bg-[#071e1c] text-white/40'
            }`}
          >
            👑
          </div>
          <div
            className={`flex-1 rounded-2xl border px-4 py-4 sm:px-5 ${
              mega ? 'border-[#c8f547]/40 bg-[#c8f547]/10' : 'border-white/5 bg-black/20 opacity-60'
            }`}
          >
            <h2 className="font-display text-xl font-semibold">Mega Boss</h2>
            <p className="text-sm text-white/55">
              Mix wszystkich czasów. Wymaga {6}★ (masz {stars}).
            </p>
            {mega ? (
              <Link
                to="/boss/mega"
                className="mt-4 inline-block rounded-lg bg-[#c8f547] px-4 py-2 text-sm font-bold text-[#071e1c]"
              >
                Ruszaj na Mega Bossa
              </Link>
            ) : (
              <p className="mt-3 text-sm text-white/40">Zbierz więcej gwiazdek.</p>
            )}
          </div>
        </li>
      </ol>
    </Shell>
  )
}
