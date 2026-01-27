'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

/**
 * useRealtimeSubscription
 * 
 * Subscribes to changes on the 'entries' table (or others) and triggers
 * a callback or router refresh when changes occur.
 * 
 * @param table - The table to listen to (default: 'entries')
 * @param callback - Optional callback to run on change. If not provided, runs router.refresh()
 * @param filter - Optional filter for the subscription (e.g. "microapp_id=eq.tasks-sb")
 */
export function useRealtimeSubscription(
    table: string = 'entries',
    callback?: () => void,
    filter?: string
) {
    const router = useRouter()
    const callbackRef = useRef(callback)

    // Keep ref updated with latest callback
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        // Create a channel for the table
        const channel = supabase
            .channel(`public:${table}${filter ? `:${filter}` : ''}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: filter,
                },
                (payload) => {
                    console.log('Realtime change received:', payload)
                    if (callbackRef.current) {
                        callbackRef.current()
                    } else {
                        router.refresh()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [table, filter, router]) // Removed callback from dependencies
}
