import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/api'

interface AdminAuthContextType {
  isAdmin: boolean
  isLoading: boolean
  adminEmail: string | null
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [isLoading,  setIsLoading]  = useState(true)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const updateAdminState = async (session: any) => {
      if (!mounted) return
      if (session?.user) {
        const isAdminUser = await checkIsAdmin(session.user.id).catch(() => false)
        if (!mounted) return
        setIsAdmin(isAdminUser)
        setAdminEmail(isAdminUser ? session.user.email ?? null : null)
      } else {
        setIsAdmin(false)
        setAdminEmail(null)
      }
      setIsLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAdminState(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAdminState(session)
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    setAdminEmail(null)
  }

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, adminEmail, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider')
  return ctx
}