import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSave } from '../hooks/useSave'
import { playerLevel, totalStars } from '../lib/game'
import { MAX_PROFILES, MAX_PROFILE_NAME_LENGTH } from '../lib/profiles'
import { GhostButton, PrimaryButton, Shell } from '../components/ui'

export function ProfilesPage() {
  const {
    save,
    profiles,
    activeProfile,
    activeId,
    createProfile,
    renameProfile,
    deleteProfile,
    switchProfile,
  } = useSave()

  const [nameDraft, setNameDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...profiles].sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    [profiles],
  )

  function flash(msg: string) {
    setNotice(msg)
    setError(null)
    window.setTimeout(() => setNotice(null), 2200)
  }

  function onCreate(e: FormEvent) {
    e.preventDefault()
    try {
      createProfile(nameDraft)
      setNameDraft('')
      flash('Zapis utworzony i aktywny.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się utworzyć.')
    }
  }

  function startEdit(id: string, current: string) {
    setEditingId(id)
    setEditDraft(current)
    setError(null)
  }

  function saveEdit(id: string) {
    try {
      renameProfile(id, editDraft)
      setEditingId(null)
      flash('Zmieniono nazwę.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zmienić nazwy.')
    }
  }

  function onDelete(id: string, name: string) {
    if (!confirm(`Usunąć zapis „${name}”? Postęp tego ucznia zniknie z tego urządzenia.`)) {
      return
    }
    try {
      deleteProfile(id)
      flash('Zapis usunięty.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć.')
    }
  }

  function onSelect(id: string, name: string) {
    try {
      switchProfile(id)
      flash(`Aktywny: ${name}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się przełączyć.')
    }
  }

  return (
    <Shell save={save}>
      <section className="panel-hero mb-8 px-6 py-10 sm:px-8">
        <p className="eyebrow">To urządzenie</p>
        <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Zapisy uczniów</h1>
        <p className="mt-3 max-w-xl text-white/65">
          Każdy uczeń ma własny postęp zapisany lokalnie w przeglądarce (localStorage).
          Twórz, zmieniaj nazwę, usuwaj i przełączaj profile — nic nie idzie do chmury.
        </p>
        {activeProfile && (
          <p className="mt-4 text-sm font-semibold text-[var(--color-lime)]">
            Teraz gra: {activeProfile.name} · Lvl {playerLevel(save.xp)} · ★ {totalStars(save)}
          </p>
        )}
      </section>

      <form onSubmit={onCreate} className="panel mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="eyebrow">Nowy zapis</span>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={MAX_PROFILE_NAME_LENGTH}
            placeholder="Np. Ania Kowalska"
            className="input-field mt-2"
          />
        </label>
        <PrimaryButton type="submit" disabled={profiles.length >= MAX_PROFILES}>
          Utwórz
        </PrimaryButton>
      </form>

      {(error || notice) && (
        <p
          className={`mb-4 text-sm font-semibold ${
            error ? 'text-[var(--color-danger)]' : 'text-[var(--color-lime)]'
          }`}
        >
          {error ?? notice}
        </p>
      )}

      <p className="mb-3 text-sm text-white/45">
        {profiles.length} / {MAX_PROFILES} zapisów na tym urządzeniu
      </p>

      <ul className="space-y-3">
        {sorted.map((p) => {
          const active = p.id === activeId
          const editing = editingId === p.id
          return (
            <li
              key={p.id}
              className={`panel flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                active ? 'ring-2 ring-[var(--color-lime)]/60' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                {editing ? (
                  <input
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    maxLength={MAX_PROFILE_NAME_LENGTH}
                    className="input-field"
                    autoFocus
                  />
                ) : (
                  <>
                    <p className="font-display truncate text-xl font-semibold">
                      {p.name}
                      {active && (
                        <span className="ml-2 align-middle text-xs font-bold text-[var(--color-lime)]">
                          AKTYWNY
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/40">
                      Utworzono {new Date(p.createdAt).toLocaleDateString('pl-PL')}
                      {p.updatedAt !== p.createdAt &&
                        ` · grane ${new Date(p.updatedAt).toLocaleDateString('pl-PL')}`}
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {editing ? (
                  <>
                    <PrimaryButton className="min-h-10 px-3 py-2 text-sm" onClick={() => saveEdit(p.id)}>
                      Zapisz
                    </PrimaryButton>
                    <GhostButton
                      className="min-h-10 px-3 py-2 text-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Anuluj
                    </GhostButton>
                  </>
                ) : (
                  <>
                    {!active && (
                      <PrimaryButton
                        className="min-h-10 px-3 py-2 text-sm"
                        onClick={() => onSelect(p.id, p.name)}
                      >
                        Wybierz
                      </PrimaryButton>
                    )}
                    <GhostButton
                      className="min-h-10 px-3 py-2 text-sm"
                      onClick={() => startEdit(p.id, p.name)}
                    >
                      Zmień nazwę
                    </GhostButton>
                    <GhostButton
                      className="min-h-10 px-3 py-2 text-sm text-[var(--color-danger)]"
                      onClick={() => onDelete(p.id, p.name)}
                    >
                      Usuń
                    </GhostButton>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/">
          <GhostButton className="text-sm">← Start</GhostButton>
        </Link>
        <Link to="/mapa">
          <GhostButton className="text-sm">Mapa</GhostButton>
        </Link>
      </div>
    </Shell>
  )
}
