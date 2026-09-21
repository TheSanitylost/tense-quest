import { Link, NavLink } from 'react-router-dom'
import {
  playerLevel,
  totalStars,
  xpIntoLevel,
  XP_PER_LEVEL,
  type PlayerSave,
} from '../lib/game'
import { totalClearedSublevels } from '../lib/sublevels'

export function Hud({ save }: { save: PlayerSave }) {
  const level = playerLevel(save.xp)
  const into = xpIntoLevel(save.xp)
  const stars = totalStars(save)
  const subDone = totalClearedSublevels(save)
  const pct = Math.round((into / XP_PER_LEVEL) * 100)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#041614]/78 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-[var(--color-lime)]"
        >
          CzasoGra
        </Link>
        <nav className="hidden items-center gap-4 sm:flex">
          <NavLink to="/mapa" className="nav-link">
            Mapa
          </NavLink>
          <NavLink to="/podpoziomy" className="nav-link">
            Podpoziomy
          </NavLink>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div className="hidden min-w-[120px] flex-1 sm:block sm:max-w-[160px]">
            <div className="mb-1 flex justify-between text-[11px] uppercase tracking-wider text-white/55">
              <span>Lvl {level}</span>
              <span>
                {into}/{XP_PER_LEVEL}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-lime)] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <span className="chip chip-lime px-2 py-1 text-xs sm:text-sm">★ {stars}</span>
            <span className="chip px-2 py-1 text-xs text-[var(--color-teal-bright)] sm:text-sm">
              🔥 {save.bestCombo}
            </span>
            <Link
              to="/podpoziomy"
              className="chip px-2 py-1 text-xs text-white/80 hover:text-[var(--color-lime)] sm:text-sm"
              title="Ukończone podpoziomy"
            >
              ▦ {subDone}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Shell({
  children,
  save,
}: {
  children: React.ReactNode
  save: PlayerSave
}) {
  return (
    <div className="bg-noise min-h-dvh">
      <Hud save={save} />
      <main className="animate-fade-up mx-auto max-w-3xl px-4 py-6 pb-16">{children}</main>
    </div>
  )
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--color-lime)] px-5 py-3 text-base font-bold text-[var(--color-ink)] shadow-[0_10px_30px_rgba(212,243,92,0.22)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-base font-semibold text-white transition hover:border-white/35 hover:bg-white/10 active:scale-[0.98] disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Hearts({ lives, shake }: { lives: number; shake?: boolean }) {
  return (
    <div className={`flex gap-1 ${shake ? 'animate-shake' : ''}`} aria-label={`${lives} życia`}>
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          className={`text-xl transition ${i < lives ? 'opacity-100' : 'opacity-25 grayscale'}`}
        >
          ❤️
        </span>
      ))}
    </div>
  )
}

export function Stars({ count, animate }: { count: number; animate?: boolean }) {
  return (
    <div className="flex gap-1 text-2xl" aria-label={`${count} gwiazdek`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`${n <= count ? 'text-[var(--color-lime)]' : 'text-white/20'} ${
            animate && n <= count ? 'animate-star' : ''
          }`}
          style={{ animationDelay: `${n * 80}ms` }}
        >
          ★
        </span>
      ))}
    </div>
  )
}
