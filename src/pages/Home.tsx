import { Link } from 'react-router-dom'
import { BADGES } from '../data/badges'
import { TENSES } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import {
  isMegaBossUnlocked,
  isTenseUnlocked,
  playerLevel,
  totalStars,
} from '../lib/game'
import { totalClearedSublevels } from '../lib/sublevels'
import { GhostButton, PrimaryButton, Shell } from '../components/ui'

export function HomePage() {
  const { save, reset, activeProfile } = useSave()
  const stars = totalStars(save)
  const level = playerLevel(save.xp)
  const mega = isMegaBossUnlocked(save)
  const subDone = totalClearedSublevels(save)
  const firstUnlocked = TENSES.find((t) => isTenseUnlocked(save, t.id)) ?? TENSES[0]!

  return (
    <Shell save={save}>
      <section className="panel-hero relative overflow-hidden px-6 py-14 sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute -right-10 top-6 h-52 w-52 rounded-full bg-[var(--color-lime)]/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-44 w-44 rounded-full bg-[var(--color-teal)]/30 blur-3xl animate-glow-pulse" />

        <p className="font-display relative text-5xl font-bold tracking-tight text-[var(--color-lime)] sm:text-6xl md:text-7xl">
          CzasoGra
        </p>
        <h1 className="relative mt-4 max-w-xl font-display text-2xl font-semibold leading-snug text-white text-balance sm:text-3xl">
          Pokonaj angielskie czasy jak bossy w grze.
        </h1>
        <p className="relative mt-3 max-w-md text-base text-white/70 sm:text-lg">
          Misje, combo, gwiazdki — potem osobna strefa 10×20 podpoziomów na każdy czas.
        </p>
        {activeProfile && (
          <p className="relative mt-4 text-sm text-white/55">
            Grasz jako{' '}
            <Link to="/uczniowie" className="font-semibold text-[var(--color-lime)] hover:underline">
              {activeProfile.name}
            </Link>
          </p>
        )}
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link to="/mapa">
            <PrimaryButton>Graj</PrimaryButton>
          </Link>
          <Link to="/podpoziomy">
            <GhostButton>Podpoziomy</GhostButton>
          </Link>
          <Link to="/uczniowie">
            <GhostButton>Zapisy uczniów</GhostButton>
          </Link>
          <Link to={`/lekcja/${firstUnlocked.id}`}>
            <GhostButton>Start: {firstUnlocked.nameEn}</GhostButton>
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-4">
        <Stat label="Poziom gracza" value={`Lvl ${level}`} />
        <Stat label="Gwiazdki" value={`★ ${stars} / 36`} />
        <Stat label="Best combo" value={`🔥 ${save.bestCombo}`} />
        <Stat label="Podpoziomy" value={`▦ ${subDone}`} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">Mapa poziomów</h2>
            <p className="text-sm text-white/55">12 czasów. Odblokuj następny 1★ na bossie.</p>
          </div>
          <Link to="/mapa" className="text-sm font-semibold text-[var(--color-lime)] hover:underline">
            Otwórz mapę →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TENSES.map((t) => {
            const unlocked = isTenseUnlocked(save, t.id)
            const s = save.tenseProgress[t.id]?.stars ?? 0
            return (
              <Link
                key={t.id}
                to={unlocked ? `/lekcja/${t.id}` : '/mapa'}
                className={`min-w-[140px] shrink-0 rounded-2xl border px-4 py-4 transition ${
                  unlocked
                    ? 'border-[var(--color-teal)]/50 bg-[var(--color-teal)]/10 hover:border-[var(--color-lime)]/50'
                    : 'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                <p className="text-xs text-white/50">Lvl {t.order}</p>
                <p className="mt-1 font-semibold leading-tight">{t.shortLabel}</p>
                <p className="mt-2 text-[var(--color-lime)]">
                  {'★'.repeat(s)}
                  {'☆'.repeat(3 - s)}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="panel mt-10 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Strefa podpoziomów</h2>
            <p className="text-sm text-white/55">
              Po 1★ na bossie: 10 etapów × 20 pytań na każdy czas.
            </p>
          </div>
          <Link to="/podpoziomy">
            <PrimaryButton>Wejdź</PrimaryButton>
          </Link>
        </div>
      </section>

      <section className="panel mt-6 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Mega Boss</h2>
            <p className="text-sm text-white/55">
              Test mieszany — odblokowany przy {6}★ (masz {stars}).
            </p>
          </div>
          {mega ? (
            <Link to="/boss/mega">
              <PrimaryButton>Walcz</PrimaryButton>
            </Link>
          ) : (
            <GhostButton disabled>Zablokowany</GhostButton>
          )}
        </div>
      </section>

      {save.badges.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Odznaki</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {save.badges.map((id) => {
              const b = BADGES.find((x) => x.id === id)
              if (!b) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
                  title={b.description}
                >
                  <span>{b.icon}</span> {b.name}
                </span>
              )
            })}
          </div>
        </section>
      )}

      <section className="mt-12 border-t border-white/10 pt-6 flex flex-wrap gap-3">
        <Link to="/uczniowie">
          <GhostButton className="text-sm">Zarządzaj zapisami uczniów</GhostButton>
        </Link>
        <GhostButton
          className="text-sm opacity-70"
          onClick={() => {
            if (
              confirm(
                `Zresetować postęp gracza „${activeProfile?.name ?? 'uczeń'}”? Inne zapisy zostaną.`,
              )
            ) {
              reset()
            }
          }}
        >
          Reset postępu aktywnego
        </GhostButton>
      </section>
    </Shell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-4 py-4">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-[var(--color-lime-soft)]">
        {value}
      </p>
    </div>
  )
}
