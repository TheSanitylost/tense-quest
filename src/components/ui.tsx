import { Link } from 'react-router-dom'
import {
  playerLevel,
  totalStars,
  xpIntoLevel,
  XP_PER_LEVEL,
  type PlayerSave,
} from '../lib/game'

export function Hud({ save }: { save: PlayerSave }) {
  const level = playerLevel(save.xp)
  const into = xpIntoLevel(save.xp)
  const stars = totalStars(save)
  const pct = Math.round((into / XP_PER_LEVEL) * 100)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071e1c]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-[#c8f547]">
          CzasoGra
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
          <div className="hidden min-w-[120px] flex-1 sm:block sm:max-w-[180px]">
            <div className="mb-1 flex justify-between text-[11px] uppercase tracking-wider text-white/60">
              <span>Lvl {level}</span>
              <span>
                {into}/{XP_PER_LEVEL} XP
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1fa6a0] to-[#c8f547] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[#c8f547]">
              ★ {stars}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[#2dd4bf]">
              🔥 {save.bestCombo}
            </span>
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
      <main className="mx-auto max-w-3xl px-4 py-6 pb-16">{children}</main>
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
      className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-[#c8f547] px-5 py-3 text-base font-bold text-[#071e1c] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
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
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-40 ${className}`}
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
          className={`${n <= count ? 'text-[#c8f547]' : 'text-white/20'} ${
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
