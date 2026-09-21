import {
  SAVE_KEY,
  createDefaultSave,
  type PlayerSave,
} from './game'
import { TENSES } from '../data/tenses'
import { normalizeSublevelProgress } from './sublevels'

export const PROFILES_META_KEY = 'czasogra-profiles-meta-v1'
export const PROFILE_SAVE_PREFIX = 'czasogra-profile-save-v1:'
export const MAX_PROFILE_NAME_LENGTH = 32
export const MAX_PROFILES = 40

export interface StudentProfile {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface ProfilesMeta {
  activeId: string | null
  profiles: StudentProfile[]
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function emptyMeta(): ProfilesMeta {
  return { activeId: null, profiles: [] }
}

export function normalizeProfileName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_PROFILE_NAME_LENGTH)
}

export function profileSaveKey(id: string): string {
  return `${PROFILE_SAVE_PREFIX}${id}`
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeRaw(key: string, value: string): void {
  localStorage.setItem(key, value)
}

function removeRaw(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Normalize a possibly partial PlayerSave into a full one. */
export function normalizePlayerSave(parsed: Partial<PlayerSave> | null | undefined): PlayerSave {
  const base = createDefaultSave()
  if (!parsed || typeof parsed !== 'object') return base
  const tenseProgress = { ...base.tenseProgress }
  for (const t of TENSES) {
    const incoming = parsed.tenseProgress?.[t.id]
    tenseProgress[t.id] = {
      ...base.tenseProgress[t.id],
      ...incoming,
      sublevels: normalizeSublevelProgress(incoming?.sublevels),
    }
  }
  return {
    ...base,
    xp: typeof parsed.xp === 'number' ? parsed.xp : base.xp,
    bestCombo: typeof parsed.bestCombo === 'number' ? parsed.bestCombo : base.bestCombo,
    megaBossBest:
      typeof parsed.megaBossBest === 'number' ? parsed.megaBossBest : base.megaBossBest,
    badges: Array.isArray(parsed.badges) ? parsed.badges : [],
    tenseProgress,
  }
}

export function loadMeta(): ProfilesMeta {
  try {
    const raw = readRaw(PROFILES_META_KEY)
    if (!raw) return emptyMeta()
    const parsed = JSON.parse(raw) as ProfilesMeta
    if (!parsed || !Array.isArray(parsed.profiles)) return emptyMeta()
    const profiles = parsed.profiles
      .filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string')
      .map((p) => ({
        id: p.id,
        name: normalizeProfileName(p.name) || 'Uczeń',
        createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
        updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
      }))
    const activeId =
      parsed.activeId && profiles.some((p) => p.id === parsed.activeId)
        ? parsed.activeId
        : (profiles[0]?.id ?? null)
    return { activeId, profiles }
  } catch {
    return emptyMeta()
  }
}

export function persistMeta(meta: ProfilesMeta): void {
  writeRaw(PROFILES_META_KEY, JSON.stringify(meta))
}

export function loadProfileSave(id: string): PlayerSave {
  try {
    const raw = readRaw(profileSaveKey(id))
    if (!raw) return createDefaultSave()
    return normalizePlayerSave(JSON.parse(raw) as PlayerSave)
  } catch {
    return createDefaultSave()
  }
}

export function persistProfileSave(id: string, save: PlayerSave): void {
  writeRaw(profileSaveKey(id), JSON.stringify(save))
  const meta = loadMeta()
  const idx = meta.profiles.findIndex((p) => p.id === id)
  if (idx >= 0) {
    meta.profiles[idx] = {
      ...meta.profiles[idx]!,
      updatedAt: Date.now(),
    }
    persistMeta(meta)
  }
}

/**
 * One-time migration: old single-save key becomes a named student profile.
 */
export function migrateLegacySaveIfNeeded(): ProfilesMeta {
  let meta = loadMeta()
  if (meta.profiles.length > 0) return meta

  const legacy = readRaw(SAVE_KEY)
  const now = Date.now()
  const id = newId()
  const profile: StudentProfile = {
    id,
    name: 'Uczeń 1',
    createdAt: now,
    updatedAt: now,
  }

  if (legacy) {
    try {
      const save = normalizePlayerSave(JSON.parse(legacy) as PlayerSave)
      persistProfileSave(id, save)
    } catch {
      persistProfileSave(id, createDefaultSave())
    }
    removeRaw(SAVE_KEY)
  } else {
    persistProfileSave(id, createDefaultSave())
  }

  meta = { activeId: id, profiles: [profile] }
  persistMeta(meta)
  return meta
}

export function ensureProfilesReady(): ProfilesMeta {
  return migrateLegacySaveIfNeeded()
}

export function getActiveProfile(meta: ProfilesMeta = loadMeta()): StudentProfile | null {
  if (!meta.activeId) return null
  return meta.profiles.find((p) => p.id === meta.activeId) ?? null
}

export function loadActiveSave(): PlayerSave {
  const meta = ensureProfilesReady()
  if (!meta.activeId) return createDefaultSave()
  return loadProfileSave(meta.activeId)
}

export function persistActiveSave(save: PlayerSave): void {
  const meta = ensureProfilesReady()
  if (!meta.activeId) return
  persistProfileSave(meta.activeId, save)
}

export function createProfile(name: string): { meta: ProfilesMeta; profile: StudentProfile } {
  const cleaned = normalizeProfileName(name)
  if (!cleaned) throw new Error('Podaj imię ucznia.')
  const meta = ensureProfilesReady()
  if (meta.profiles.length >= MAX_PROFILES) {
    throw new Error(`Maksymalnie ${MAX_PROFILES} zapisów.`)
  }
  const duplicate = meta.profiles.some(
    (p) => p.name.toLowerCase() === cleaned.toLowerCase(),
  )
  if (duplicate) throw new Error('Taki zapis już istnieje.')

  const now = Date.now()
  const profile: StudentProfile = {
    id: newId(),
    name: cleaned,
    createdAt: now,
    updatedAt: now,
  }
  persistProfileSave(profile.id, createDefaultSave())
  const next: ProfilesMeta = {
    activeId: profile.id,
    profiles: [...meta.profiles, profile],
  }
  persistMeta(next)
  return { meta: next, profile }
}

export function renameProfile(id: string, name: string): ProfilesMeta {
  const cleaned = normalizeProfileName(name)
  if (!cleaned) throw new Error('Podaj imię ucznia.')
  const meta = ensureProfilesReady()
  const duplicate = meta.profiles.some(
    (p) => p.id !== id && p.name.toLowerCase() === cleaned.toLowerCase(),
  )
  if (duplicate) throw new Error('Taki zapis już istnieje.')
  const profiles = meta.profiles.map((p) =>
    p.id === id ? { ...p, name: cleaned, updatedAt: Date.now() } : p,
  )
  if (!profiles.some((p) => p.id === id)) throw new Error('Nie znaleziono zapisu.')
  const next = { ...meta, profiles }
  persistMeta(next)
  return next
}

export function deleteProfile(id: string): ProfilesMeta {
  const meta = ensureProfilesReady()
  if (meta.profiles.length <= 1) {
    throw new Error('Musi zostać przynajmniej jeden zapis.')
  }
  const profiles = meta.profiles.filter((p) => p.id !== id)
  removeRaw(profileSaveKey(id))
  const activeId =
    meta.activeId === id ? (profiles[0]?.id ?? null) : meta.activeId
  const next = { activeId, profiles }
  persistMeta(next)
  return next
}

export function switchProfile(id: string): ProfilesMeta {
  const meta = ensureProfilesReady()
  if (!meta.profiles.some((p) => p.id === id)) {
    throw new Error('Nie znaleziono zapisu.')
  }
  const next = { ...meta, activeId: id }
  persistMeta(next)
  return next
}

export function resetActiveProfileProgress(): PlayerSave {
  const fresh = createDefaultSave()
  persistActiveSave(fresh)
  return fresh
}
