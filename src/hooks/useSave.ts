import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import {
  createDefaultSave,
  loadSave,
  persistSave,
  type PlayerSave,
} from '../lib/game'

let memorySave: PlayerSave | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function getSnapshot(): PlayerSave {
  if (typeof window === 'undefined') {
    return memorySave ?? createDefaultSave()
  }
  if (!memorySave) memorySave = loadSave()
  return memorySave
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useSave() {
  const save = useSyncExternalStore(subscribe, getSnapshot, createDefaultSave)

  const update = useCallback((updater: (prev: PlayerSave) => PlayerSave) => {
    const prev = getSnapshot()
    const next = updater(prev)
    memorySave = next
    persistSave(next)
    emit()
  }, [])

  const reset = useCallback(() => {
    memorySave = createDefaultSave()
    persistSave(memorySave)
    emit()
  }, [])

  // hydrate once on mount in case SSR/hydration edge
  useEffect(() => {
    if (!memorySave) {
      memorySave = loadSave()
      emit()
    }
  }, [])

  return { save, update, reset }
}

export function useDocumentTitle(title: string) {
  useState(() => {
    document.title = title
  })
  useEffect(() => {
    document.title = title
  }, [title])
}
