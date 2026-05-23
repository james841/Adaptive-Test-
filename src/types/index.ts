// ─── Database row types (match Supabase schema) ────────────────────────────

export interface Student {
  id: string
  full_name: string
  gender: 'Male' | 'Female'
  school: string
  school_type: 'Public' | 'Private'
  class: string
  username: string
  created_at: string
}

export interface Item {
  id: string
  item_code: string
  topic: string
  sub_topic: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  difficulty_level: 'Easy' | 'Moderate' | 'Difficult'
  rasch_b_value: number
  cognitive_level: string
  item_status: 'Active' | 'Inactive'
  times_administered: number
  times_correct: number
  exposure_rate: number
}

export interface TestSession {
  id: string
  student_id: string
  start_time: string
  end_time?: string
  final_theta?: number
  final_sem?: number
  total_items_administered: number
  ability_level?: 'Low' | 'Average' | 'High'
  status: 'in_progress' | 'completed' | 'abandoned'
}

export interface Response {
  id: string
  session_id: string
  student_id: string
  item_id: string
  item_position: number
  selected_answer: 'A' | 'B' | 'C' | 'D'
  is_correct: boolean
  theta_before: number
  theta_after: number
  sem_after: number
  response_time_ms?: number
}

// ─── CAT Engine types ───────────────────────────────────────────────────────

export interface CATState {
  theta: number              // current ability estimate (logits)
  sem: number                // standard error of measurement
  items: Item[]              // all available items
  answeredItemIds: string[]  // IDs of items already shown
  responses: CATResponse[]   // answers given so far
  sessionId: string | null
  isComplete: boolean
  stopReason?: 'max_items' | 'sem_threshold' | 'no_items'
}

export interface CATResponse {
  item: Item
  selectedAnswer: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  thetaBefore: number
  thetaAfter: number
  semAfter: number
  responseTimeMs: number
}

export interface CATResult {
  finalTheta: number
  finalSem: number
  abilityLevel: 'Low' | 'Average' | 'High'
  totalItems: number
  totalCorrect: number
  accuracy: number
  timeTakenMs: number
  responses: CATResponse[]
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface StudentAuthState {
  student: Student | null
  isLoading: boolean
}

export interface AdminAuthState {
  isAdmin: boolean
  isLoading: boolean
}

// ─── UI helpers ─────────────────────────────────────────────────────────────

export type AnswerOption = 'A' | 'B' | 'C' | 'D'

export interface FormField {
  value: string
  error?: string
}
