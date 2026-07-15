/**
 * CAT Engine — Rasch-Based Computerised Adaptive Testing
 *
 * Fixes applied:
 *  ✅ Exposure rate now computed as times_administered / total_sessions (capped 0–1)
 *  ✅ Exposure rate update function added — call after each item is answered
 *  ✅ Rasch b-values now properly spread per difficulty tier in DB
 *  ✅ All other logic unchanged
 */

import type { Item, CATResponse } from '@/types'

// ─── Configuration ─────────────────────────────────────────────────────────────
export const CAT_CONFIG = {
  INITIAL_THETA:       0.00,
  MAX_ITEMS:           40,
  MIN_ITEMS:           10,
  SEM_THRESHOLD:       0.35,
  THETA_MIN:          -4.0,
  THETA_MAX:           4.0,
  FENCE_LOW:          -3.5,
  FENCE_HIGH:          3.5,
  MAX_EXPOSURE_RATE:   0.5,   // ✅ FIXED: was 1.0 (disabled). Now 50% max exposure per item
  DAMPING_FACTOR:      0.5,
  STABILITY_WINDOW:    3,
  STABILITY_THRESHOLD: 0.1,
  ROUTING_ITEMS:       3,
} as const

// ─── Content Balancing Quotas ─────────────────────────────────────────────────
export const TOPIC_QUOTAS: Record<string, number> = {
  'Algebra':             10,
  'Number & Numeration': 10,
  'Fractions':            5,
  'Statistics':           5,
  'Geometry':             5,
  'Ratio':                4,
  'Percentage':           4,
}
const DEFAULT_TOPIC_QUOTA = 4

// ─── Rasch Probability ────────────────────────────────────────────────────────
export function raschProbability(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)))
}

// ─── Fisher Information ───────────────────────────────────────────────────────
export function fisherInformation(theta: number, b: number): number {
  const p = raschProbability(theta, b)
  return p * (1 - p)
}

// ─── Theta Update (Damped Newton-Raphson MLEF) ────────────────────────────────
export function updateTheta(
  currentTheta: number,
  responses: CATResponse[],
): number {
  if (responses.length === 0) return currentTheta

  if (responses.length === 1) {
    const r = responses[0]
    const p = raschProbability(currentTheta, r.item.rasch_b_value)
    const raw = r.isCorrect ? 0.5 * (1 - p) : -0.5 * p
    const damped = Math.max(-CAT_CONFIG.DAMPING_FACTOR, Math.min(CAT_CONFIG.DAMPING_FACTOR, raw))
    return clamp(currentTheta + damped)
  }

  let numerator   = 0
  let denominator = 0
  for (const r of responses) {
    const p = raschProbability(currentTheta, r.item.rasch_b_value)
    const I = fisherInformation(currentTheta, r.item.rasch_b_value)
    numerator   += (r.isCorrect ? 1 : 0) - p
    denominator += I
  }
  if (denominator < 0.001) return currentTheta

  const rawStep    = numerator / denominator
  const dampedStep = Math.max(-CAT_CONFIG.DAMPING_FACTOR, Math.min(CAT_CONFIG.DAMPING_FACTOR, rawStep))
  return clamp(currentTheta + dampedStep)
}

function clamp(theta: number): number {
  const fenced = Math.max(CAT_CONFIG.FENCE_LOW, Math.min(CAT_CONFIG.FENCE_HIGH, theta))
  return Math.max(CAT_CONFIG.THETA_MIN, Math.min(CAT_CONFIG.THETA_MAX, fenced))
}

// ─── Routing Stage ────────────────────────────────────────────────────────────
export function applyRoutingStage(responses: CATResponse[]): number {
  if (responses.length !== CAT_CONFIG.ROUTING_ITEMS) return CAT_CONFIG.INITIAL_THETA
  const correct = responses.filter(r => r.isCorrect).length
  if (correct === 3) return  1.5
  if (correct === 2) return  0.5
  if (correct === 1) return -0.5
  return -1.5
}

// ─── SEM Calculation ──────────────────────────────────────────────────────────
export function calculateSEM(theta: number, administeredItems: Item[]): number {
  if (administeredItems.length === 0) return 99.0
  const totalInfo = administeredItems.reduce(
    (sum, item) => sum + fisherInformation(theta, item.rasch_b_value),
    0,
  )
  if (totalInfo < 0.001) return 99.0
  return 1 / Math.sqrt(totalInfo)
}

// ─── Theta Stability Check ────────────────────────────────────────────────────
export function isThetaStable(responses: CATResponse[]): boolean {
  const n = responses.length
  if (n < CAT_CONFIG.STABILITY_WINDOW + 1) return false
  const recent = responses.slice(-CAT_CONFIG.STABILITY_WINDOW - 1)
  const deltas = recent.slice(1).map((r, i) =>
    Math.abs(r.thetaAfter - recent[i].thetaAfter),
  )
  return deltas.every(d => d < CAT_CONFIG.STABILITY_THRESHOLD)
}

// ─── Exposure Rate Calculation ────────────────────────────────────────────────
/**
 * ✅ FIXED: Exposure rate = times_administered / total_sessions
 *
 * This gives a value between 0 and 1 (0% – 100%).
 * It was previously stored raw from the DB (which could be >1 if not normalised).
 *
 * Call this to get the TRUE exposure rate for any item before using it
 * in the exposure filter inside selectNextItem.
 *
 * @param timesAdministered - how many times this item has been served
 * @param totalSessions     - total number of test sessions completed
 * @returns exposure rate clamped between 0 and 1
 */
export function computeExposureRate(timesAdministered: number, totalSessions: number): number {
  if (totalSessions <= 0) return 0
  return Math.min(1, timesAdministered / totalSessions)
}

/**
 * ✅ NEW: Call this in your session-completion handler to update DB exposure rate.
 *
 * Usage in your Supabase update after a test session ends:
 *
 *   const newRate = computeExposureRate(item.times_administered + 1, totalSessions)
 *   await supabase.from('items').update({
 *     times_administered: item.times_administered + 1,
 *     times_correct:      item.times_correct + (isCorrect ? 1 : 0),
 *     exposure_rate:      newRate,
 *   }).eq('id', item.id)
 *
 * This ensures exposure_rate in the DB is always a decimal 0.00–1.00.
 */
export function buildExposureUpdate(
  item: Item,
  isCorrect: boolean,
  totalSessions: number,
): { times_administered: number; times_correct: number; exposure_rate: number } {
  const newTimesAdministered = (item.times_administered ?? 0) + 1
  const newTimesCorrect      = (item.times_correct ?? 0) + (isCorrect ? 1 : 0)
  const newExposureRate      = computeExposureRate(newTimesAdministered, totalSessions)
  return {
    times_administered: newTimesAdministered,
    times_correct:      newTimesCorrect,
    exposure_rate:      newExposureRate,
  }
}

// ─── Item Selection ───────────────────────────────────────────────────────────
export function selectNextItem(
  theta: number,
  allItems: Item[],
  answeredIds: string[],
  topicCounts: Record<string, number> = {},
  totalSessions: number = 0,  // ✅ NEW param — needed for correct exposure rate check
): Item | null {
  const pool = allItems.filter(
    item => item.item_status === 'Active' && !answeredIds.includes(item.id),
  )
  if (pool.length === 0) return null

  // ✅ FIXED: compute true exposure rate dynamically, don't trust raw DB value
  const exposureFiltered = pool.filter(item => {
    const trueRate = computeExposureRate(item.times_administered ?? 0, totalSessions)
    return trueRate <= CAT_CONFIG.MAX_EXPOSURE_RATE
  })
  const afterExposure = exposureFiltered.length > 0 ? exposureFiltered : pool

  let eligible = afterExposure
  if (answeredIds.length >= 10) {
    const balanced = afterExposure.filter(item => {
      const quota = TOPIC_QUOTAS[item.topic] ?? DEFAULT_TOPIC_QUOTA
      const used  = topicCounts[item.topic] ?? 0
      return used < quota
    })
    eligible = balanced.length > 0 ? balanced : afterExposure
  }

  return eligible.reduce((best, item) => {
    const bestInfo = fisherInformation(theta, best.rasch_b_value)
    const itemInfo = fisherInformation(theta, item.rasch_b_value)
    return itemInfo > bestInfo ? item : best
  })
}

// ─── Stopping Rule ────────────────────────────────────────────────────────────
export type StopReason = 'max_items' | 'sem_threshold' | 'theta_stable' | 'no_items' | null

export function checkStoppingRule(
  itemsAdministered: number,
  sem: number,
  nextItem: Item | null,
  responses: CATResponse[] = [],
): StopReason {
  if (!nextItem)                                                          return 'no_items'
  if (itemsAdministered >= CAT_CONFIG.MAX_ITEMS)                         return 'max_items'
  if (itemsAdministered >= CAT_CONFIG.MIN_ITEMS && sem <= CAT_CONFIG.SEM_THRESHOLD) return 'sem_threshold'
  if (itemsAdministered >= CAT_CONFIG.MIN_ITEMS && isThetaStable(responses))        return 'theta_stable'
  return null
}

// ─── Ability Classification ───────────────────────────────────────────────────
export function classifyAbility(theta: number): 'Low' | 'Average' | 'High' {
  if (theta < -1.33) return 'Low'
  if (theta >= 1.33) return 'High'
  return 'Average'
}

// ─── Test Information ─────────────────────────────────────────────────────────
export function getTestInformation(theta: number, administeredItems: Item[]): number {
  return administeredItems.reduce(
    (sum, item) => sum + fisherInformation(theta, item.rasch_b_value),
    0,
  )
}

// ─── Topic Count Helper ───────────────────────────────────────────────────────
export function buildTopicCounts(responses: CATResponse[]): Record<string, number> {
  return responses.reduce((counts, r) => {
    const topic = r.item.topic
    counts[topic] = (counts[topic] ?? 0) + 1
    return counts
  }, {} as Record<string, number>)
}