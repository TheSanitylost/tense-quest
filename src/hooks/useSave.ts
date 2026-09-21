import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { createDefaultSave, type PlayerSave } from '../lib/game'
import {
  createProfile,
  deleteProfile,
  ensureProfilesReady,
  getActiveProfile,
  loadActiveSave,
  loadMeta,
  persistActiveSave,
  renameProfile,
  resetActiveProfileProgress,
  switchProfile,
  type ProfilesMeta,
  type StudentProfile,
} from '../lib/profiles'

let memorySave: PlayerSave | null = null
let memoryMeta: ProfilesMeta | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function hydrate() {
  if (typeof window === 'undefined') {
    memoryMeta = memoryMeta ?? { activeId: null, profiles: [] }
    memorySave = memorySave ?? createDefaultSave()
    return
  }
  memoryMeta = ensureProfilesReady()
  memorySave = loadActiveSave()
}

function getSaveSnapshot(): PlayerSave {
  if (!memorySave) hydrate()
  return memorySave ?? createDefaultSave()
}

function getMetaSnapshot(): ProfilesMeta {
  if (!memoryMeta) hydrate()
  return memoryMeta ?? { activeId: null, profiles: [] }
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function setMeta(next: ProfilesMeta) {
  memoryMeta = next
  memorySave = next.activeId ? loadActiveSave() : createDefaultSave()
  emit()
}

export function useSave() {
  const save = useSyncExternalStore(subscribe, getSaveSnapshot, createDefaultSave)
  const meta = useSyncExternalStore(subscribe, getMetaSnapshot, () => ({
    activeId: null,
    profiles: [],
  }))

  const update = useCallback((updater: (prev: PlayerSave) => PlayerSave) => {
    const prev = getSaveSnapshot()
    const next = updater(prev)
    memorySave = next
    persistActiveSave(next)
    memoryMeta = loadMeta()
    emit()
  }, [])

  const reset = useCallback(() => {
    memorySave = resetActiveProfileProgress()
    memoryMeta = loadMeta()
    emit()
  }, [])

  const refreshFromDisk = useCallback(() => {
    hydrate()
    emit()
  }, [])

  const create = useCallback((name: string) => {
    const { meta: next } = createProfile(name)
    setMeta(next)
    return next
  }, [])

  const rename = useCallback((id: string, name: string) => {
    const next = renameProfile(id, name)
    setMeta(next)
    return next
  }, [])

  const remove = useCallback((id: string) => {
    const next = deleteProfile(id)
    setMeta(next)
    return next
  }, [])

  const select = useCallback((id: string) => {
    const next = switchProfile(id)
    setMeta(next)
    return next
  }, [])

  useEffect(() => {
    if (!memorySave || !memoryMeta) {
      hydrate()
      emit()
    }
  }, [])

  const activeProfile: StudentProfile | null = getActiveProfile(meta)

  return {
    save,
    update,
    reset,
    profiles: meta.profiles,
    activeProfile,
    activeId: meta.activeId,
    createProfile: create,
    renameProfile: rename,
    deleteProfile: remove,
    switchProfile: select,
    refreshFromDisk,
  }
}

export function useDocumentTitle(title: string) {
  useState(() => {
    document.title = title
  })
  useEffect(() => {
    document.title = title
  }, [title])
}
