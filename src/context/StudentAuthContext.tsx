import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Student } from '@/types'

interface StudentAuthContextType {
  student: Student | null
  setStudent: (s: Student | null) => void
  logout: () => void
  isLoading: boolean
}

const StudentAuthContext = createContext<StudentAuthContextType | null>(null)

const STORAGE_KEY = 'cat_student'

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudentState] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setStudentState(JSON.parse(stored))
    } catch { /* ignore */ }
    setIsLoading(false)
  }, [])

  const setStudent = (s: Student | null) => {
    setStudentState(s)
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    else   localStorage.removeItem(STORAGE_KEY)
  }

  const logout = () => setStudent(null)

  return (
    <StudentAuthContext.Provider value={{ student, setStudent, logout, isLoading }}>
      {children}
    </StudentAuthContext.Provider>
  )
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext)
  if (!ctx) throw new Error('useStudentAuth must be inside StudentAuthProvider')
  return ctx
}
