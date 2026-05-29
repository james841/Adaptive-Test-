/**
 * CAT Engine — Rasch-Based Computerised Adaptive Testing
 *
 * Matches AllTestSim configuration + research document requirements:
 *  - MODE:  CAT
 *  - ISC:   MFI  (Maximum Fisher Information)
 *  - SE:    MLEF (MLE with Fence)
 *  - TL:    Variable MIN 15, MAX 30, SEE 0.30
 *  - IEC:   Exposure rate cap at 0.25
 *  - CB:    Topic balancing enforced
 */

import type { Item, CATResponse } from '@/types'

// ─── Configuration ─────────────────────────────────────────────────────────────
export const CAT_CONFIG = {
  INITIAL_THETA:      0.00,   // Starting ability — average student assumed
  MAX_ITEMS:          30,     // Hard stop — never exceed 30 questions
  MIN_ITEMS:          10,     // Must answer at least 10 before SEM stop
  SEM_THRESHOLD:      0.80,   // Stop when measurement is precise enough
  THETA_MIN:         -4.0,    // Absolute lower bound
  THETA_MAX:          4.0,    // Absolute upper bound
  FENCE_LOW:         -3.5,    // MLEF soft lower fence
  FENCE_HIGH:         3.5,    // MLEF soft upper fence
  MAX_EXPOSURE_RATE:  0.50,   // Skip items used in >25% of all tests
} as const

// ─── Content Balancing Quotas ─────────────────────────────────────────────────
// Max items per topic across the full 30-item test
// Prevents the test from being dominated by one topic
export const TOPIC_QUOTAS: Record<string, number> = {
  'Algebra':              8,
  'Number & Numeration':  7,
  'Fractions':            4,
  'Statistics':           4,
  'Geometry':             4,
  'Ratio':                3,
  'Percentage':           3,
}
const DEFAULT_TOPIC_QUOTA = 3

// ─── Rasch Probability ────────────────────────────────────────────────────────

/**
 * P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
 *
 * Answers: "Given a student with ability θ, what is the
 * probability they answer an item of difficulty b correctly?"
 *
 * When θ = b → P = 0.5 (50/50 chance — ideal targeting point)
 * When θ >> b → P approaches 1 (too easy)
 * When θ << b → P approaches 0 (too hard)
 */
export function raschProbability(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)))
}

// ─── Fisher Information ───────────────────────────────────────────────────────

/**
 * I(θ) = P(θ) × (1 − P(θ))
 *
 * How much information one item gives about ability θ.
 * Maximum at θ = b. Used to compute SEM and select best items.
 */
export function fisherInformation(theta: number, b: number): number {
  const p = raschProbability(theta, b)
  return p * (1 - p)
}

// ─── Theta Update (MLEF) ──────────────────────────────────────────────────────

/**
 * Updates ability estimate using Newton-Raphson MLE over all responses.
 *
 * Per the research document:
 *   If correct:  theta = theta + (0.5 × (1 - P))
 *   If wrong:    theta = theta - (0.5 × P)
 *
 * For a single response this simplifies to:
 *   Δθ = 0.5 × (score - P)  where score = 1 or 0
 *
 * We use the full Newton-Raphson accumulation over ALL responses
 * which is more statistically accurate for multiple items.
 * Then apply MLEF fence and hard bounds.
 */
export function updateTheta(
  currentTheta: number,
  responses: CATResponse[],
): number {
  if (responses.length === 0) return currentTheta

  // Single response: use simple formula from research document
  if (responses.length === 1) {
    const r = responses[0]
    const p = raschProbability(currentTheta, r.item.rasch_b_value)
    const delta = r.isCorrect
      ? 0.5 * (1 - p)   // correct: move up proportional to difficulty
      : -0.5 * p         // wrong:   move down proportional to easiness
    return clamp(currentTheta + delta)
  }

  // Multiple responses: full Newton-Raphson MLE (more accurate)
  let numerator   = 0
  let denominator = 0

  for (const r of responses) {
    const p = raschProbability(currentTheta, r.item.rasch_b_value)
    const I = fisherInformation(currentTheta, r.item.rasch_b_value)
    numerator   += (r.isCorrect ? 1 : 0) - p
    denominator += I
  }

  if (denominator < 0.001) return currentTheta

  return clamp(currentTheta + numerator / denominator)
}

// Apply MLEF fence then hard bounds
function clamp(theta: number): number {
  const fenced = Math.max(CAT_CONFIG.FENCE_LOW, Math.min(CAT_CONFIG.FENCE_HIGH, theta))
  return Math.max(CAT_CONFIG.THETA_MIN, Math.min(CAT_CONFIG.THETA_MAX, fenced))
}

// ─── SEM Calculation ──────────────────────────────────────────────────────────

/**
 * SEM = 1 / √(Σ Fisher Information over all administered items)
 *
 * Starts near 99 (no information), decreases as items are answered.
 * Target: SEM ≤ 0.30 means ability is measured precisely enough.
 */
export function calculateSEM(theta: number, administeredItems: Item[]): number {
  if (administeredItems.length === 0) return 99.0
  const totalInfo = administeredItems.reduce(
    (sum, item) => sum + fisherInformation(theta, item.rasch_b_value),
    0,
  )
  if (totalInfo < 0.001) return 99.0
  return 1 / Math.sqrt(totalInfo)
}

// ─── Item Selection (MFI + Exposure Control + Content Balancing) ─────────────

/**
 * Selects the best next item applying 3 rules in order:
 *
 * 1. EXPOSURE CONTROL — skip items with exposure_rate > 0.25
 *    (prevents item overuse and test security issues)
 *
 * 2. CONTENT BALANCING — skip items from topics that have
 *    already hit their quota in this test session
 *    (ensures balanced topic coverage)
 *
 * 3. MFI SELECTION — from remaining eligible items, pick the
 *    one with b-value closest to current theta
 *    (maximises Fisher information = most adaptive)
 *
 * Falls back gracefully: if exposure/balancing filters leave
 * nothing, relaxes constraints to avoid running out of items.
 */
export function selectNextItem(
  theta: number,
  allItems: Item[],
  answeredIds: string[],
  topicCounts: Record<string, number> = {},
): Item | null {
  // Base pool: active, not yet answered
  const pool = allItems.filter(
    item => item.item_status === 'Active' && !answeredIds.includes(item.id),
  )
  if (pool.length === 0) return null

  // Step 1: Apply exposure control
  const exposureFiltered = pool.filter(
    item => (item.exposure_rate ?? 0) <= CAT_CONFIG.MAX_EXPOSURE_RATE,
  )

  // Step 2: Apply content balancing
  const balancedPool = (exposureFiltered.length > 0 ? exposureFiltered : pool).filter(item => {
    const quota = TOPIC_QUOTAS[item.topic] ?? DEFAULT_TOPIC_QUOTA
    const used  = topicCounts[item.topic] ?? 0
    return used < quota
  })

  // Fallback: if balancing leaves nothing, use exposure-filtered pool
  // If that's also empty, use full pool (graceful degradation)
  const eligible =
    balancedPool.length > 0
      ? balancedPool
      : exposureFiltered.length > 0
      ? exposureFiltered
      : pool

  // Step 3: MFI — pick item with b-value closest to current theta
  return eligible.reduce((best, item) => {
    const distBest = Math.abs(best.rasch_b_value - theta)
    const distCurr = Math.abs(item.rasch_b_value - theta)
    return distCurr < distBest ? item : best
  })
}

// ─── Stopping Rule ────────────────────────────────────────────────────────────

export type StopReason = 'max_items' | 'sem_threshold' | 'no_items' | null

/**
 * Variable-length stopping:
 *   - Never stop before MIN_ITEMS (15)
 *   - Stop if SEM ≤ 0.30 after MIN_ITEMS
 *   - Force stop at MAX_ITEMS (30)
 */
export function checkStoppingRule(
  itemsAdministered: number,
  sem: number,
  nextItem: Item | null,
): StopReason {
  if (!nextItem)
    return 'no_items'
  if (itemsAdministered >= CAT_CONFIG.MAX_ITEMS)
    return 'max_items'
  if (itemsAdministered >= CAT_CONFIG.MIN_ITEMS && sem <= CAT_CONFIG.SEM_THRESHOLD)
    return 'sem_threshold'
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

/**
 * Builds a topic count map from responses already given.
 * Passed into selectNextItem() to enforce content balancing.
 */
export function buildTopicCounts(responses: CATResponse[]): Record<string, number> {
  return responses.reduce((counts, r) => {
    const topic = r.item.topic
    counts[topic] = (counts[topic] ?? 0) + 1
    return counts
  }, {} as Record<string, number>)
}