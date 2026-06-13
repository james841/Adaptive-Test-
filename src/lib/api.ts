/**
 * Data Access Layer
 * All Supabase queries live here — never call supabase directly from components.
 */

import { supabase } from './supabase'
import type { Student, Item, TestSession, Response, CATResponse } from '@/types'
import { classifyAbility } from './catEngine'
import bcrypt from 'bcryptjs'   // we use a simple hash for student passwords

// ─── Students ────────────────────────────────────────────────────────────────

export async function registerStudent(data: {
  full_name: string
  gender: 'Male' | 'Female'
  school: string
  school_type: 'Public' | 'Private'
  class: string
  username: string
  password: string
}): Promise<{ student?: Student; error?: string }> {
  // Check username uniqueness
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('username', data.username)
    .maybeSingle()

  if (existing) return { error: 'Username already taken. Choose another.' }

  const password_hash = await bcrypt.hash(data.password, 10)

  const { data: student, error } = await supabase
    .from('students')
    .insert({ ...data, password_hash })
    .select()
    .single()

  if (error) return { error: error.message }
  return { student }
}

export async function loginStudent(
  username: string,
  password: string,
): Promise<{ student?: Student; error?: string }> {
  const { data: row, error } = await supabase
    .from('students')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error || !row) return { error: 'Invalid username or password.' }

  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) return { error: 'Invalid username or password.' }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _, ...student } = row
  return { student }
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data } = await supabase
    .from('students')
    .select('id,full_name,gender,school,school_type,class,username,created_at')
    .eq('id', id)
    .single()
  return data
}

export async function getAllStudents(): Promise<Student[]> {
  const { data } = await supabase
    .from('students')
    .select('id,full_name,gender,school,school_type,class,username,created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getActiveItems(): Promise<Item[]> {
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('item_status', 'Active')
    .order('rasch_b_value', { ascending: true })
  return data ?? []
}

export async function getAllItems(): Promise<Item[]> {
  const { data } = await supabase
    .from('items')
    .select('*')
    .order('rasch_b_value', { ascending: true })
  return data ?? []
}

export async function updateItem(
  id: string,
  updates: Partial<Pick<Item, 'question' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'correct_answer' | 'item_status' | 'rasch_b_value' | 'difficulty_level'>>,
): Promise<{ error?: string }> {
  const { error } = await supabase.from('items').update(updates).eq('id', id)
  return error ? { error: error.message } : {}
}

// ─── Test Sessions ────────────────────────────────────────────────────────────

export async function createTestSession(studentId: string): Promise<TestSession | null> {
  const { data } = await supabase
    .from('test_sessions')
    .insert({ student_id: studentId, status: 'in_progress' })
    .select()
    .single()
  return data
}

export async function completeTestSession(
  sessionId: string,
  finalTheta: number,
  finalSem: number,
  totalItems: number,
): Promise<void> {
  const abilityLevel = classifyAbility(finalTheta)
  await supabase.from('test_sessions').update({
    end_time: new Date().toISOString(),
    final_theta: finalTheta,
    final_sem: finalSem,
    total_items_administered: totalItems,
    ability_level: abilityLevel,
    status: 'completed',
  }).eq('id', sessionId)
}

export async function getSessionsByStudent(studentId: string): Promise<TestSession[]> {
  const { data } = await supabase
    .from('test_sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllSessions(): Promise<(TestSession & { students: Pick<Student, 'full_name' | 'school'> })[]> {
  const { data } = await supabase
    .from('test_sessions')
    .select('*, students(full_name, school)')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
  return (data as never) ?? []
}

// ─── Responses ────────────────────────────────────────────────────────────────

export async function saveResponse(
  sessionId: string,
  studentId: string,
  catResponse: CATResponse,
  position: number,
): Promise<void> {
  const payload: Omit<Response, 'id' | 'created_at'> = {
    session_id:      sessionId,
    student_id:      studentId,
    item_id:         catResponse.item.id,
    item_position:   position,
    selected_answer: catResponse.selectedAnswer,
    is_correct:      catResponse.isCorrect,
    theta_before:    catResponse.thetaBefore,
    theta_after:     catResponse.thetaAfter,
    sem_after:       catResponse.semAfter,
    response_time_ms: catResponse.responseTimeMs,
  }
  await supabase.from('responses').insert(payload)
}

export async function getResponsesBySession(sessionId: string): Promise<Response[]> {
  const { data } = await supabase
    .from('responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('item_position')
  return data ?? []
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  return !!data
}

// ─── Efficiency Stats ─────────────────────────────────────────────────────────

export async function getEfficiencyStats() {
  const { data: sessions } = await supabase
    .from('test_sessions')
    .select('final_theta, final_sem, total_items_administered, start_time, end_time, ability_level')
    .eq('status', 'completed')

  if (!sessions || sessions.length === 0) return null

  const avgItems = sessions.reduce((s, r) => s + (r.total_items_administered ?? 0), 0) / sessions.length
  const avgSem   = sessions.reduce((s, r) => s + (r.final_sem ?? 0), 0) / sessions.length
  const avgTif   = sessions.reduce((s, r) => {
    const sem = r.final_sem ?? 0
    return s + (sem > 0 ? 1 / (sem * sem) : 0)
  }, 0) / sessions.length
  const avgTheta = sessions.reduce((s, r) => s + (r.final_theta ?? 0), 0) / sessions.length

  const avgTimeMs = sessions.reduce((s, r) => {
    if (!r.start_time || !r.end_time) return s
    return s + (new Date(r.end_time).getTime() - new Date(r.start_time).getTime())
  }, 0) / sessions.length

  const distribution = {
    Low:     sessions.filter(s => s.ability_level === 'Low').length,
    Average: sessions.filter(s => s.ability_level === 'Average').length,
    High:    sessions.filter(s => s.ability_level === 'High').length,
  }

  return { avgItems, avgSem, avgTif, avgTheta, avgTimeMs, total: sessions.length, distribution }
}

// ─── Item Stats (times_administered, times_correct, exposure_rate) ────────────

/**
 * Called after every item is answered.
 * Updates times_administered, times_correct, and exposure_rate directly.
 * Uses a raw update instead of RPC to avoid the hanging RPC issue.
 */
export async function incrementItemStats(
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  // Step 1: fetch current values
  const { data: item } = await supabase
    .from('items')
    .select('times_administered, times_correct')
    .eq('id', itemId)
    .single()

  if (!item) return

  const newAdministered = (item.times_administered ?? 0) + 1
  const newCorrect      = (item.times_correct ?? 0) + (isCorrect ? 1 : 0)

  // Step 2: fetch total completed sessions for exposure rate
  const { count: totalSessions } = await supabase
    .from('test_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'completed')

  const exposureRate = totalSessions && totalSessions > 0
    ? parseFloat((newAdministered / totalSessions).toFixed(4))
    : 0

  // Step 3: update all three columns atomically
  await supabase
    .from('items')
    .update({
      times_administered: newAdministered,
      times_correct:      newCorrect,
      exposure_rate:      exposureRate,
    })
    .eq('id', itemId)
}