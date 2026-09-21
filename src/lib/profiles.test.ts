import { beforeEach, describe, expect, it } from 'vitest'
import { SAVE_KEY, createDefaultSave } from './game'
import {
  PROFILES_META_KEY,
  createProfile,
  deleteProfile,
  ensureProfilesReady,
  loadActiveSave,
  loadMeta,
  loadProfileSave,
  migrateLegacySaveIfNeeded,
  persistActiveSave,
  profileSaveKey,
  renameProfile,
  switchProfile,
} from './profiles'

class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value))
  }
}

const memory = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', {
  value: memory,
  configurable: true,
})

function clearStorage() {
  memory.clear()
}

describe('student profiles', () => {
  beforeEach(() => {
    clearStorage()
  })

  it('bootstraps a default profile when empty', () => {
    const meta = ensureProfilesReady()
    expect(meta.profiles).toHaveLength(1)
    expect(meta.profiles[0]?.name).toBe('Uczeń 1')
    expect(meta.activeId).toBe(meta.profiles[0]?.id)
  })

  it('migrates legacy single save into Uczeń 1', () => {
    const legacy = createDefaultSave()
    legacy.xp = 420
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacy))
    const meta = migrateLegacySaveIfNeeded()
    expect(meta.profiles).toHaveLength(1)
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
    expect(loadActiveSave().xp).toBe(420)
  })

  it('creates, renames, switches and deletes profiles', () => {
    ensureProfilesReady()
    const { profile: ania } = createProfile('Ania')
    expect(loadMeta().activeId).toBe(ania.id)

    persistActiveSave({ ...createDefaultSave(), xp: 100 })
    expect(loadProfileSave(ania.id).xp).toBe(100)

    const { profile: bartek } = createProfile('Bartek')
    expect(loadActiveSave().xp).toBe(0)
    persistActiveSave({ ...createDefaultSave(), xp: 55 })

    switchProfile(ania.id)
    expect(loadActiveSave().xp).toBe(100)

    renameProfile(ania.id, 'Anna K.')
    expect(loadMeta().profiles.find((p) => p.id === ania.id)?.name).toBe('Anna K.')

    deleteProfile(bartek.id)
    const meta = loadMeta()
    expect(meta.profiles.map((p) => p.name).sort()).toEqual(['Anna K.', 'Uczeń 1'])
    expect(localStorage.getItem(profileSaveKey(bartek.id))).toBeNull()
  })

  it('rejects empty names and duplicates', () => {
    ensureProfilesReady()
    createProfile('Ola')
    expect(() => createProfile('  ')).toThrow()
    expect(() => createProfile('ola')).toThrow()
  })

  it('keeps at least one profile', () => {
    const meta = ensureProfilesReady()
    expect(() => deleteProfile(meta.profiles[0]!.id)).toThrow()
  })

  it('writes meta key', () => {
    ensureProfilesReady()
    expect(localStorage.getItem(PROFILES_META_KEY)).toBeTruthy()
  })
})
