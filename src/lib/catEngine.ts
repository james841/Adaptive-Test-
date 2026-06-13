/**
 * CAT Engine — Rasch-Based Computerised Adaptive Testing
 *
 * Implements all recommendations for SEM target 0.35:
 *  ✅ True Fisher Information item selection
 *  ✅ Damped theta updates (prevents oscillation)
 *  ✅ 3-question routing stage (faster ability targeting)
 *  ✅ Theta stability tracking (stops when theta settles)
 *  ✅ Content balancing only after item 10
 *  ✅ Exposure control disabled (MAX_EXPOSURE_RATE = 1.0)
 *  ✅ MAX_ITEMS = 40, MIN_ITEMS = 10, SEM_THRESHOLD = 0.35
 */

import type { Item, CATResponse } from '@/types'

// ─── Configuration ─────────────────────────────────────────────────────────────
export const CAT_CONFIG = {
  INITIAL_THETA:      0.00,
  MAX_ITEMS:          40,     // Increased — some students need 33+ to reach 0.35
  MIN_ITEMS:          10,     // Never stop before 10
  SEM_THRESHOLD:      0.35,   // Official target
  THETA_MIN:         -4.0,
  THETA_MAX:          4.0,
  FENCE_LOW:         -3.5,
  FENCE_HIGH:         3.5,
  MAX_EXPOSURE_RATE:  1.0,    // Disabled — always pick most informative item
  DAMPING_FACTOR:     0.5,    // Max theta jump per update (prevents oscillation)
  STABILITY_WINDOW:   3,      // Track last 3 theta changes
  STABILITY_THRESHOLD: 0.1,   // Stop if all last 3 changes < 0.1
  ROUTING_ITEMS:      3,      // Stage 1: 3 routing items before full CAT
} as const

// ─── Content Balancing Quotas ─────────────────────────────────────────────────
// Only enforced AFTER first 10 items (early CAT focuses on ability measurement)
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
/**
 * Full Newton-Raphson over all responses with damping.
 *
 * Damping prevents theta from oscillating wildly on mixed responses:
 *   Raw step = Σ(score - P) / Σ I(θ)
 *   Damped step = clamp(raw step, -0.5, +0.5)
 *
 * This means theta can move at most 0.5 logits per update,
 * preventing the 2.5 → 1.8 → 2.7 → 1.9 oscillation pattern.
 */
export function updateTheta(
  currentTheta: number,
  responses: CATResponse[],
): number {
  if (responses.length === 0) return currentTheta

  // Single response — simple damped update
  if (responses.length === 1) {
    const r = responses[0]
    const p = raschProbability(currentTheta, r.item.rasch_b_value)
    const raw = r.isCorrect ? 0.5 * (1 - p) : -0.5 * p
    const damped = Math.max(-CAT_CONFIG.DAMPING_FACTOR, Math.min(CAT_CONFIG.DAMPING_FACTOR, raw))
    return clamp(currentTheta + damped)
  }

  // Multiple responses — full Newton-Raphson with damping
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
  const dampedStep = Math.max(
    -CAT_CONFIG.DAMPING_FACTOR,
    Math.min(CAT_CONFIG.DAMPING_FACTOR, rawStep),
  )

  return clamp(currentTheta + dampedStep)
}

function clamp(theta: number): number {
  const fenced = Math.max(CAT_CONFIG.FENCE_LOW, Math.min(CAT_CONFIG.FENCE_HIGH, theta))
  return Math.max(CAT_CONFIG.THETA_MIN, Math.min(CAT_CONFIG.THETA_MAX, fenced))
}

// ─── Routing Stage (3-question warm-up) ──────────────────────────────────────
/**
 * After first 3 items, jump theta to a better starting estimate.
 * This prevents wasting 5-8 questions converging from 0.
 *
 *   3/3 correct  → theta = +1.5  (strong student)
 *   2/3 correct  → theta = +0.5  (above average)
 *   1/3 correct  → theta = -0.5  (below average)
 *   0/3 correct  → theta = -1.5  (weak student)
 */
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
/**
 * Track the last 3 theta changes.
 * If all 3 are < 0.1, theta has stabilised — ability is known.
 * Used as an additional stopping signal alongside SEM.
 */
export function isThetaStable(responses: CATResponse[]): boolean {
  const n = responses.length
  if (n < CAT_CONFIG.STABILITY_WINDOW + 1) return false

  const recent = responses.slice(-CAT_CONFIG.STABILITY_WINDOW - 1)
  const deltas = recent.slice(1).map((r, i) =>
    Math.abs(r.thetaAfter - recent[i].thetaAfter),
  )

  return deltas.every(d => d < CAT_CONFIG.STABILITY_THRESHOLD)
}

// ─── Item Selection (True MFI + Exposure + Conditional Balancing) ────────────
/**
 * TRUE Fisher Information Maximisation:
 *   Pick item that maximises I(θ) = P(θ)(1-P(θ)) at current theta.
 *   (NOT just closest b-value — actual information computed)
 *
 * Content balancing only applied AFTER item 10.
 * Exposure control effectively disabled (rate = 1.0).
 * Graceful fallback if filters leave nothing.
 */
export function selectNextItem(
  theta: number,
  allItems: Item[],
  answeredIds: string[],
  topicCounts: Record<string, number> = {},
): Item | null {
  const pool = allItems.filter(
    item => item.item_status === 'Active' && !answeredIds.includes(item.id),
  )
  if (pool.length === 0) return null

  // Exposure control (effectively off with rate = 1.0)
  const exposureFiltered = pool.filter(
    item => (item.exposure_rate ?? 0) <= CAT_CONFIG.MAX_EXPOSURE_RATE,
  )
  const afterExposure = exposureFiltered.length > 0 ? exposureFiltered : pool

  // Content balancing — only enforce after first 10 items
  let eligible = afterExposure
  if (answeredIds.length >= 10) {
    const balanced = afterExposure.filter(item => {
      const quota = TOPIC_QUOTAS[item.topic] ?? DEFAULT_TOPIC_QUOTA
      const used  = topicCounts[item.topic] ?? 0
      return used < quota
    })
    eligible = balanced.length > 0 ? balanced : afterExposure
  }

  // TRUE MFI — maximise actual Fisher Information at current theta
  return eligible.reduce((best, item) => {
    const bestInfo = fisherInformation(theta, best.rasch_b_value)
    const itemInfo = fisherInformation(theta, item.rasch_b_value)
    return itemInfo > bestInfo ? item : best
  })
}

// ─── Stopping Rule ────────────────────────────────────────────────────────────
export type StopReason = 'max_items' | 'sem_threshold' | 'theta_stable' | 'no_items' | null

/**
 * Stop when ANY of these are true (after MIN_ITEMS):
 *   1. SEM ≤ 0.35 — measurement is precise enough
 *   2. Theta stable — last 3 changes all < 0.1 (ability known)
 *   3. Items ≥ MAX_ITEMS (40) — hard cap
 *   4. No items left
 */
export function checkStoppingRule(
  itemsAdministered: number,
  sem: number,
  nextItem: Item | null,
  responses: CATResponse[] = [],
): StopReason {
  if (!nextItem)
    return 'no_items'
  if (itemsAdministered >= CAT_CONFIG.MAX_ITEMS)
    return 'max_items'
  if (itemsAdministered >= CAT_CONFIG.MIN_ITEMS && sem <= CAT_CONFIG.SEM_THRESHOLD)
    return 'sem_threshold'
  if (itemsAdministered >= CAT_CONFIG.MIN_ITEMS && isThetaStable(responses))
    return 'theta_stable'
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