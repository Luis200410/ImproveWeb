'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, 
  RefreshCw, 
  ChevronRight,
  Database,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { usePlaidLink } from 'react-plaid-link'
import { Button } from '@/components/ui/button'

type ConnectionStatus = 'synced' | 'stale' | 'disconnected'

interface ConnectedAccount {
  id: string
  institution: string
  type: string
  status: ConnectionStatus
  lastSynced: string
  itemId: string
  balance?: number
}

interface MicroAppStatus {
  name: string
  href: string
  primary: string
  secondary: string
  color: 'teal' | 'gray' | 'red' | 'amber' | 'coral'
}

const MICRO_APPS: MicroAppStatus[] = [
  { name: 'Daily Decisions', href: '/systems/money/today', primary: '3 decisions waiting', secondary: '12 made this month', color: 'teal' },
  { name: 'Cash Flow', href: '/systems/money/cash-flow', primary: 'Clear for 90 days', secondary: 'Next charge: Adobe on Nov 15', color: 'gray' },
  { name: 'Envelopes', href: '/systems/money/envelopes', primary: 'Groceries 1.8x fast', secondary: '2 fast, 3 on track', color: 'amber' },
  { name: 'Income', href: '/systems/money/income', primary: 'All income classified', secondary: '£4,200 confirmed / mo', color: 'gray' },
  { name: 'Subscriptions', href: '/systems/money/subscriptions', primary: '£112.50 / month total', secondary: '1 cancellation pending', color: 'coral' },
  { name: 'Goals', href: '/systems/money/simulator', primary: 'On track', secondary: '£850 free capacity', color: 'teal' },
]

export function MoneyOverview() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [budgetData, setBudgetData] = useState<any>(null)
  const [incomeData, setIncomeData] = useState<any>(null)
  const [subData, setSubData] = useState<any>(null)
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const fetchAccounts = useCallback(async (uid: string) => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('plaid_items')
        .select('*')
        .eq('user_id', uid)

      if (itemsError) throw itemsError
      if (!items || items.length === 0) {
        setAccounts([])
        setLoading(false)
        return
      }

      // Parallel fetch for all module data
      const [accRes, budgetRes, incomeRes, subRes, envRes] = await Promise.all([
        fetch(`/api/plaid/accounts?userId=${uid}`),
        fetch(`/api/plaid/budget-data?userId=${uid}`),
        fetch(`/api/plaid/income-data?userId=${uid}`),
        fetch(`/api/plaid/subscriptions-data?userId=${uid}`),
        fetch(`/api/plaid/envelopes-data?userId=${uid}`)
      ]);

      const [accData, bData, iData, sData, eData] = await Promise.all([
        accRes.json(), budgetRes.json(), incomeRes.json(), subRes.json(), envRes.json()
      ]);

      if (accData.accounts) {
        const mappedAccounts: ConnectedAccount[] = accData.accounts.map((acc: any) => ({
          id: acc.account_id,
          itemId: acc.item_id,
          institution: items.find(i => i.item_id === acc.item_id)?.institution_name || 'Bank Account',
          type: `${acc.name} (${acc.subtype})`,
          status: 'synced',
          lastSynced: 'Just now',
          balance: acc.balances.current
        }))
        setAccounts(mappedAccounts)
      }

      setBudgetData(bData)
      setIncomeData(iData)
      setSubData(sData)
      setEnvData(eData)

    } catch (err) {
      console.error("Error fetching overview data:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchAccounts(user.id)
        
        // Create Link Token
        const ltResponse = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })
        const ltData = await ltResponse.json()
        if (ltData.link_token) {
          setLinkToken(ltData.link_token)
        }
      }
    }
    checkUser()
  }, [supabase, fetchAccounts])

  const onSuccess = useCallback(async (publicToken: string) => {
    if (!userId) return
    setLoading(true)
    
    try {
      await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken, userId })
      })
      await fetchAccounts(userId)
    } catch (err) {
      console.error("Error exchanging token:", err)
    } finally {
      setLoading(false)
    }
  }, [userId, fetchAccounts])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  })

  const handleDeleteAccount = async (itemId: string, rowId: string) => {
    if (!confirm("Are you sure you want to disconnect this bank? This will remove all associated transaction data.")) return
    
    setIsDeleting(rowId)
    try {
      // 1. Delete from Supabase
      const { error } = await supabase
        .from('plaid_items')
        .delete()
        .eq('item_id', itemId)

      if (error) throw error

      // 2. Refresh local state
      setAccounts(prev => prev.filter(acc => acc.itemId !== itemId))
    } catch (err) {
      console.error("Error deleting account:", err)
      alert("Failed to disconnect account. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  const isDisconnected = accounts.some(a => a.status === 'disconnected')
  const historyDays = 18 
  
  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700 pb-24 px-6 sm:px-10">
      
      {/* Alert Banner */}
      {isDisconnected && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-red-500 text-white py-3 px-6 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] font-black cursor-pointer"
        >
          <AlertCircle className="size-4" />
          <span>Multiple accounts disconnected — Data may be incomplete. Tap to fix.</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="space-y-4 pt-8">
        <h1 className="text-4xl font-mono uppercase tracking-tight text-neutral-100 font-bold">System Overview</h1>
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] leading-relaxed max-w-2xl">
          System health and data confidence diagnostics. Technical status of the Wealth Architecture modules.
        </p>
      </div>

      {/* Section 1: Connected Accounts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-neutral-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">Connected Infrastructure</h2>
            <div className="px-1.5 py-0.5 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
              <ShieldCheck className="size-2.5 text-teal-500" />
              <span className="text-neutral-600 font-mono text-[8px] uppercase tracking-widest font-bold">AES-256</span>
            </div>
          </div>
          <Button 
            onClick={() => open()} 
            disabled={!ready || loading}
            variant="outline"
            size="sm"
            className="h-8 bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 font-mono text-[9px] uppercase tracking-widest gap-2"
          >
            {loading ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
            Add Account
          </Button>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 overflow-hidden min-h-[100px] relative">
          {loading && accounts.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10">
              <Loader2 className="size-6 text-neutral-700 animate-spin" />
            </div>
          ) : null}

          <AnimatePresence mode="popLayout">
            {accounts.length > 0 ? (
              accounts.map((acc, idx) => (
                <motion.div 
                  key={acc.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex items-center justify-between p-6 hover:bg-neutral-900/40 transition-colors group ${idx !== accounts.length - 1 ? 'border-b border-neutral-900' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`size-1.5 rounded-full ${
                      acc.status === 'synced' ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]' : 
                      acc.status === 'stale' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 
                      'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                    }`} />
                    <div className="space-y-1">
                      <div className="text-sm font-mono text-neutral-200 uppercase tracking-tight font-medium">{acc.institution}</div>
                      <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest leading-none flex items-center gap-2">
                        {acc.type}
                        <span className="w-1 h-1 rounded-full bg-neutral-800" />
                        ID: {acc.itemId?.substring(0, 8) || 'N/A'}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    {acc.balance !== undefined && (
                      <div className="text-sm font-mono text-neutral-200 font-bold">
                        £{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                    <div className={`font-mono text-[9px] uppercase tracking-widest font-bold ${
                      acc.status === 'stale' ? 'text-amber-500' : 
                      acc.status === 'disconnected' ? 'text-red-500' : 
                      'text-neutral-500'
                    }`}>
                      {acc.status === 'synced' ? `Synced ${acc.lastSynced}` : 
                       acc.status === 'stale' ? `Last Synced ${acc.lastSynced}` : 
                       'Reconnect Required'}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteAccount(acc.itemId, acc.id)}
                        disabled={isDeleting === acc.id}
                        className="p-2 hover:bg-red-500/10 rounded-md text-neutral-700 hover:text-red-500 transition-all"
                        title="Disconnect Account"
                      >
                        {isDeleting === acc.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                      </button>
                    </div>
                    <RefreshCw className="size-3 text-neutral-800 group-hover:text-neutral-400 transition-colors" />
                  </div>
                </motion.div>
              ))
            ) : !loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="size-12 rounded-full border border-dashed border-neutral-800 flex items-center justify-center">
                  <Plus className="size-5 text-neutral-800" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">No Infrastructure Connected</p>
                  <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Connect Plaid to start Wealth Intelligence</p>
                </div>
                <Button 
                  onClick={() => open()} 
                  variant="outline"
                  size="sm"
                  className="bg-teal-500/10 border-teal-500/20 text-teal-500 hover:bg-teal-500 hover:text-black transition-all font-mono text-[9px] px-8"
                >
                  Connect Now
                </Button>
              </div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-600">
              Live Plaid Stream: {accounts.length > 0 ? "Active" : "Awaiting Connection"}
            </p>
            <div className="flex items-center gap-4">
              <Link href="https://plaid.com" target="_blank" className="flex items-center gap-1.5 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest">Powered by</span>
                <ExternalLink className="size-2 text-neutral-500" />
              </Link>
            </div>
          </div>
          
          {historyDays < 90 && (
            <div className="flex items-center gap-3 p-4 bg-neutral-900/20 border border-neutral-900 border-dashed">
              <Database className="size-3.5 text-neutral-700" />
              <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest leading-relaxed">
                {historyDays < 30 ? "Rhythm baselines and projections improve as more history is collected. Full accuracy reached at 90 days." :
                 historyDays < 60 ? "Patterns detected — projections improving." :
                 "Good data coverage — minor refinements ongoing."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Micro-app Summary Cards */}
      <section className="space-y-6">
        <h2 className="text-neutral-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold border-b border-neutral-900 pb-4">
          Module Signal Diagnostics
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useMemo(() => [
            { 
              name: 'Daily Decisions', 
              href: '/systems/money/today', 
              primary: budgetData?.safeToSpend > 2000 ? '1 action suggested' : 'Queue clear', 
              secondary: 'Optimization ready', 
              color: budgetData?.safeToSpend > 2000 ? 'teal' : 'gray' 
            },
            { 
              name: 'Cash Flow', 
              href: '/systems/money/cash-flow', 
              primary: budgetData?.safeToSpend > 0 ? 'Projected positive' : 'Deficit risk', 
              secondary: '90-day structural model', 
              color: budgetData?.safeToSpend > 0 ? 'gray' : 'red' 
            },
            { 
              name: 'Envelopes', 
              href: '/systems/money/envelopes', 
              primary: envData?.envelopes?.some((e: any) => e.paceStatus === 'Fast') ? 'Velocity warning' : 'Rhythms synchronized', 
              secondary: `${envData?.envelopes?.length || 0} zones monitored`, 
              color: envData?.envelopes?.some((e: any) => e.paceStatus === 'Fast') ? 'amber' : 'gray' 
            },
            { 
              name: 'Income', 
              href: '/systems/money/income', 
              primary: `£${Math.floor(budgetData?.averageIncome || 0).toLocaleString()} / month`, 
              secondary: `${incomeData?.classified?.length || 0} regular streams`, 
              color: 'gray' 
            },
            { 
              name: 'Subscriptions', 
              href: '/systems/money/subscriptions', 
              primary: `£${(subData?.subscriptions?.reduce((acc: number, s: any) => acc + s.amount, 0) || 0).toFixed(2)} / month`, 
              secondary: `${subData?.subscriptions?.length || 0} structural items`, 
              color: 'coral' 
            },
            { 
              name: 'Goals', 
              href: '/systems/money/simulator', 
              primary: 'Capacity active', 
              secondary: `£${Math.floor(budgetData?.safeToSpend || 0).toLocaleString()} available`, 
              color: 'teal' 
            },
          ], [budgetData, incomeData, subData, envData]).map(app => (
            <Link key={app.name} href={app.href} className="block group">
              <div className={`h-full border p-8 space-y-6 transition-all relative overflow-hidden ${
                app.color === 'teal' ? 'bg-teal-500/[0.03] border-teal-500/20 hover:border-teal-500/40' :
                app.color === 'red' ? 'bg-red-500/[0.03] border-red-500/20 hover:border-red-500/40' :
                app.color === 'amber' ? 'bg-amber-500/[0.03] border-amber-500/20 hover:border-amber-500/40' :
                app.color === 'coral' ? 'bg-orange-500/[0.03] border-orange-500/20 hover:border-orange-500/40' :
                'bg-neutral-950 border-neutral-900 hover:border-neutral-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.3em] font-bold">{app.name}</span>
                  <ChevronRight className="size-3 text-neutral-800 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                
                <div className="space-y-2">
                  <div className={`text-xl font-mono uppercase tracking-tight font-bold leading-tight ${
                    app.color === 'teal' ? 'text-teal-400' :
                    app.color === 'red' ? 'text-red-500' :
                    app.color === 'amber' ? 'text-amber-500' :
                    app.color === 'coral' ? 'text-orange-400' :
                    'text-neutral-300'
                  }`}>
                    {app.primary}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                    {app.secondary}
                  </div>
                </div>

                <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${
                    app.color === 'teal' ? 'bg-teal-500' :
                    app.color === 'red' ? 'bg-red-500' :
                    app.color === 'amber' ? 'bg-amber-500' :
                    app.color === 'coral' ? 'bg-orange-500' :
                    'bg-neutral-400'
                }`} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: Personal Activity */}
      <section className="bg-neutral-950 border border-neutral-900 p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-3">
            <div className="text-2xl font-mono text-neutral-200 font-bold">12</div>
            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.3em] font-bold">Decisions this month</div>
          </div>
          <div className="space-y-3 border-y md:border-y-0 md:border-x border-neutral-900 py-8 md:py-0 md:px-12">
            <div className="text-2xl font-mono text-neutral-200 font-bold">Mar 1 — 18 Days</div>
            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.3em] font-bold">Connected History</div>
          </div>
          <div className="space-y-3 md:pl-12">
            <div className={`text-2xl font-mono font-bold ${historyDays < 30 ? 'text-neutral-500' : 'text-teal-500/80'}`}>
              {historyDays < 30 ? "Building Baseline" : historyDays < 60 ? "Improving" : historyDays < 90 ? "Good" : "Full Accuracy"}
            </div>
            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.3em] font-bold">Data Reliability</div>
          </div>
        </div>
      </section>

    </div>
  )
}
