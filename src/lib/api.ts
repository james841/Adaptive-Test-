/**
 * Data Access Layer
 * All Supabase queries live here — never call supabase directly from components.
 */

import { supabase } from './supabase'
import { hashPassword, verifyPassword } from './crypto'
import type { Student, Item, TestSession, Response, CATResponse } from '@/types'
import { classifyAbility } from './catEngine'

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
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('username', data.username)
    .maybeSingle()

  if (existing) return { error: 'Username already taken. Choose another.' }

  const password_hash = await hashPassword(data.password, data.username)

  const { data: student, error } = await supabase
    .from('students')
    .insert({
      full_name:     data.full_name,
      gender:        data.gender,
      school:        data.school,
      school_type:   data.school_type,
      class:         data.class,
      username:      data.username,
      password_hash,
    })
    .select('id,full_name,gender,school,school_type,class,username,created_at')
    .single()

  if (error) return { error: error.message }
  return { student: student as Student }
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

  const valid = await verifyPassword(password, username, row.password_hash)
  if (!valid) return { error: 'Invalid username or password.' }

  const { password_hash: _ph, ...student } = row
  return { student: student as Student }
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
  return (data ?? []) as Student[]
}

export async function deleteStudent(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('students').delete().eq('id', id)
  return error ? { error: error.message } : {}
}

export async function deleteAllStudents(): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('students')
    .delete()
    .gt('created_at', '1900-01-01T00:00:00Z')
  return error ? { error: error.message } : {}
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getActiveItems(): Promise<Item[]> {
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('item_status', 'Active')
    .order('rasch_b_value', { ascending: true })
  return (data ?? []) as Item[]
}

export async function getAllItems(): Promise<Item[]> {
  const { data } = await supabase
    .from('items')
    .select('*')
    .order('rasch_b_value', { ascending: true })
  return (data ?? []) as Item[]
}

export async function updateItem(
  id: string,
  updates: Partial<Pick<Item,
    'question' | 'option_a' | 'option_b' | 'option_c' | 'option_d' |
    'correct_answer' | 'item_status' | 'rasch_b_value' | 'difficulty_level'
  >>,
): Promise<{ error?: string }> {
  const { error } = await supabase.from('items').update(updates).eq('id', id)
  return error ? { error: error.message } : {}
}

// ─── Item Stats ───────────────────────────────────────────────────────────────

/**
 * Updates times_administered, times_correct, exposure_rate after every answer.
 * Uses SECURITY DEFINER RPC so it works even for unauthenticated students.
 * Requires the update_item_stats() function to exist in Supabase (run the SQL).
 */
export async function incrementItemStats(
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('update_item_stats', {
    p_item_id:    itemId,
    p_is_correct: isCorrect,
  })
  if (error) console.error('[incrementItemStats] RPC error:', error.message)
}

// ─── Test Sessions ────────────────────────────────────────────────────────────

export async function createTestSession(studentId: string): Promise<TestSession | null> {
  const { data } = await supabase
    .from('test_sessions')
    .insert({ student_id: studentId, status: 'in_progress' })
    .select()
    .single()
  return data as TestSession | null
}

export async function completeTestSession(
  sessionId: string,
  finalTheta: number,
  finalSem: number,
  totalItems: number,
): Promise<void> {
  const abilityLevel = classifyAbility(finalTheta)
  await supabase.from('test_sessions').update({
    end_time:                 new Date().toISOString(),
    final_theta:              finalTheta,
    final_sem:                finalSem,
    total_items_administered: totalItems,
    ability_level:            abilityLevel,
    status:                   'completed',
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

export async function getAllSessions() {
  const { data } = await supabase
    .from('test_sessions')
    .select('*, students(full_name, gender, school_type, school)')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
  return data ?? []
}

// ─── Responses ────────────────────────────────────────────────────────────────

export async function saveResponse(
  sessionId: string,
  studentId: string,
  catResponse: CATResponse,
  position: number,
): Promise<void> {
  const payload: Omit<Response, 'id' | 'created_at'> = {
    session_id:       sessionId,
    student_id:       studentId,
    item_id:          catResponse.item.id,
    item_position:    position,
    selected_answer:  catResponse.selectedAnswer,
    is_correct:       catResponse.isCorrect,
    theta_before:     catResponse.thetaBefore,
    theta_after:      catResponse.thetaAfter,
    sem_after:        catResponse.semAfter,
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

  const total    = sessions.length
  const avgItems = sessions.reduce((s, r) => s + (r.total_items_administered ?? 0), 0) / total
  const avgSem   = sessions.reduce((s, r) => s + (r.final_sem ?? 0), 0) / total
  const avgTheta = sessions.reduce((s, r) => s + (r.final_theta ?? 0), 0) / total
  const avgTif   = sessions.reduce((s, r) => {
    const sem = r.final_sem ?? 0
    return s + (sem > 0 ? 1 / (sem * sem) : 0)
  }, 0) / total

  const avgTimeMs = sessions.reduce((s, r) => {
    if (!r.start_time || !r.end_time) return s
    return s + (new Date(r.end_time).getTime() - new Date(r.start_time).getTime())
  }, 0) / total

  const distribution = {
    Low:     sessions.filter(s => s.ability_level === 'Low').length,
    Average: sessions.filter(s => s.ability_level === 'Average').length,
    High:    sessions.filter(s => s.ability_level === 'High').length,
  }

  return { avgItems, avgSem, avgTif, avgTheta, avgTimeMs, total, distribution }
}