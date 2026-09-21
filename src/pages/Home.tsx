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
import { GhostButton, PrimaryButton, Shell } from '../components/ui'

export function HomePage() {
  const { save, reset } = useSave()
  const stars = totalStars(save)
  const level = playerLevel(save.xp)
  const mega = isMegaBossUnlocked(save)
  const firstUnlocked = TENSES.find((t) => isTenseUnlocked(save, t.id)) ?? TENSES[0]!

  return (
    <Shell save={save}>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b3d3a]/80 via-[#071e1c]/60 to-transparent px-6 py-14 sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute -right-10 top-6 h-48 w-48 rounded-full bg-[#c8f547]/15 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-[#1fa6a0]/25 blur-3xl" />

        <p className="font-display text-5xl font-bold tracking-tight text-[#c8f547] sm:text-6xl md:text-7xl">
          CzasoGra
        </p>
        <h1 className="mt-4 max-w-xl font-display text-2xl font-semibold leading-snug text-white text-balance sm:text-3xl">
          Pokonaj angielskie czasy jak bossy w grze.
        </h1>
        <p className="mt-3 max-w-md text-base text-white/70 sm:text-lg">
          Misje, combo, gwiazdki — wersja dla ósmoklasisty, nie nudny podręcznik.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/mapa">
            <PrimaryButton>Graj</PrimaryButton>
          </Link>
          <Link to={`/lekcja/${firstUnlocked.id}`}>
            <GhostButton>Start: {firstUnlocked.nameEn}</GhostButton>
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Poziom gracza" value={`Lvl ${level}`} />
        <Stat label="Gwiazdki" value={`★ ${stars} / 36`} />
        <Stat label="Best combo" value={`🔥 ${save.bestCombo}`} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">Mapa poziomów</h2>
            <p className="text-sm text-white/55">12 czasów. Odblokuj następny 1★ na bossie.</p>
          </div>
          <Link to="/mapa" className="text-sm font-semibold text-[#c8f547] hover:underline">
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
                    ? 'border-[#1fa6a0]/50 bg-[#1fa6a0]/10 hover:border-[#c8f547]/50'
                    : 'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                <p className="text-xs text-white/50">Lvl {t.order}</p>
                <p className="mt-1 font-semibold leading-tight">{t.shortLabel}</p>
                <p className="mt-2 text-[#c8f547]">{'★'.repeat(s)}{'☆'.repeat(3 - s)}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-5">
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

      <section className="mt-12 border-t border-white/10 pt-6">
        <GhostButton
          className="text-sm opacity-70"
          onClick={() => {
            if (confirm('Zresetować postęp gry?')) reset()
          }}
        >
          Reset postępu
        </GhostButton>
      </section>
    </Shell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-[#e8ff9a]">{value}</p>
    </div>
  )
}
