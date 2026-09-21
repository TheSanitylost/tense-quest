import { Link, Navigate, useParams } from 'react-router-dom'
import { getTense } from '../data/tenses'
import { useSave } from '../hooks/useSave'
import { applyLessonDone, isTenseUnlocked } from '../lib/game'
import { GhostButton, PrimaryButton, Shell } from '../components/ui'

export function LessonPage() {
  const { tenseId = '' } = useParams()
  const tense = getTense(tenseId)
  const { save, update } = useSave()

  if (!tense) return <Navigate to="/mapa" replace />
  if (!isTenseUnlocked(save, tense.id)) return <Navigate to="/mapa" replace />

  function markDone() {
    update((s) => applyLessonDone(s, tense!.id))
  }

  return (
    <Shell save={save}>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
        Poziom {tense.order} · Briefing
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{tense.nameEn}</h1>
      <p className="text-white/60">{tense.namePl}</p>
      <p className="mt-2 text-[#e8ff9a]">{tense.vibe}</p>

      <section className="mt-8 space-y-6">
        <Block title="O co chodzi?">
          <p>{tense.briefing}</p>
          <p className="mt-2 text-sm text-white/55">Kiedy: {tense.when}</p>
        </Block>

        <Block title="Sygnały">
          <div className="flex flex-wrap gap-2">
            {tense.signalWords.map((w) => (
              <span
                key={w}
                className="rounded-full border border-[#1fa6a0]/40 bg-[#1fa6a0]/15 px-3 py-1 text-sm"
              >
                {w}
              </span>
            ))}
          </div>
        </Block>

        <Block title="Wzory">
          <Example label="+" text={tense.examples.affirmative} />
          <Example label="−" text={tense.examples.negative} />
          <Example label="?" text={tense.examples.question} />
          <p className="mt-3 text-sm text-[#c8f547]">{tense.examples.tip}</p>
        </Block>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to={`/misja/${tense.id}`}
          onClick={markDone}
        >
          <PrimaryButton>Ruszaj na misję</PrimaryButton>
        </Link>
        <Link to="/mapa">
          <GhostButton>Wróć do mapy</GhostButton>
        </Link>
      </div>
    </Shell>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3 text-white/85 leading-relaxed">{children}</div>
    </div>
  )
}

function Example({ label, text }: { label: string; text: string }) {
  return (
    <p className="mt-2 flex gap-3 text-sm sm:text-base">
      <span className="w-5 shrink-0 font-bold text-[#2dd4bf]">{label}</span>
      <span className="font-medium text-[#e8ff9a]">{text}</span>
    </p>
  )
}
