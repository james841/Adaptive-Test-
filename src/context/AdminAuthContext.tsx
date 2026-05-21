import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

    const updateAdminState = (session: any) => {
      if (!mounted) return
      if (session?.user) {
        setIsAdmin(true)
        setAdminEmail(session.user.email ?? null)
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

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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