import { useEffect, useRef, useState } from 'react'
import { useAuth } from './auth'
import { supabase } from './supabase'

const COLUMN = {
  budget: 'budget',
  shoppingList: 'shopping_list',
  purchases: 'purchases',
} as const

type SyncKey = keyof typeof COLUMN
type ColumnName = (typeof COLUMN)[SyncKey]

function writeRow<T>(userId: string, column: ColumnName, value: T) {
  void supabase
    .from('user_data')
    .upsert({ user_id: userId, [column]: value, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
}

/** Like useStoredState, but persists to the signed-in user's row in Supabase instead of localStorage. */
export function useSyncedState<T>(key: SyncKey, fallback: T) {
  const { session } = useAuth()
  const userId = session?.user.id
  const column = COLUMN[key]
  const [value, setValue] = useState<T>(fallback)
  const ready = useRef(false)
  const writeTimer = useRef<number | undefined>(undefined)
  const pending = useRef<{ userId: string; column: ColumnName; value: T } | null>(null)

  useEffect(() => {
    ready.current = false
    if (!userId) {
      setValue(fallback)
      return
    }
    let cancelled = false
    supabase
      .from('user_data')
      .select(column)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        const row = data as Record<string, T> | null
        setValue(row?.[column] ?? fallback)
        ready.current = true
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, column])

  useEffect(() => {
    if (!userId || !ready.current) return
    window.clearTimeout(writeTimer.current)
    pending.current = { userId, column, value }
    writeTimer.current = window.setTimeout(() => {
      pending.current = null
      writeRow(userId, column, value)
    }, 500)
    return () => window.clearTimeout(writeTimer.current)
  }, [value, userId, column])

  // Flush a pending debounced write on unmount so navigating away right after an edit doesn't lose it.
  useEffect(() => {
    return () => {
      if (pending.current) {
        const { userId, column, value } = pending.current
        writeRow(userId, column, value)
        pending.current = null
      }
    }
  }, [])

  return [value, setValue] as const
}
