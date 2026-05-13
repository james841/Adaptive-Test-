/**
 * CAT Engine — Rasch-Based Computerised Adaptive Testing
 *
 * Algorithm:
 *  1. Start θ = 0.00 logits
 *  2. Select item closest to current θ (not yet administered)
 *  3. After response: update θ via weighted MLE approximation
 *  4. Compute SEM = 1 / √(Σ Fisher Information)
 *  5. Stop if: items ≥ MAX_ITEMS  OR  SEM ≤ SEM_THRESHOLD
 */

import type { Item, CATResponse } from '@/types'

// ─── Configuration ──────────────────────────────────────────────────────────
export const CAT_CONFIG = {
  INITIAL_THETA:           0.00,   // starting ability estimate (logits)
  MAX_ITEMS:               10,     // maximum items before forced stop
  SEM_THRESHOLD:           0.30,   // stop when SEM ≤ this value
  MAX_CONSECUTIVE_FAILURES: 3,     // stop if N consecutive wrong answers
  THETA_MIN:              -4.0,   // clamp: lowest possible ability
  THETA_MAX:               4.0,    // clamp: highest possible ability
} as const

// ─── Rasch Model ────────────────────────────────────────────────────────────

/**
 * P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
 * Probability that a student with ability θ answers correctly
 * an item with difficulty b.
 */
export function raschProbability(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)))
}

/**
 * Fisher Information for a Rasch item:
 * I(θ) = P(θ) * (1 - P(θ))
 */
export function fisherInformation(theta: number, b: number): number {
  const p = raschProbability(theta, b)
  return p * (1 - p)
}

// ─── Ability Estimation (MLE approximation) ─────────────────────────────────

/**
 * Update theta after a single response using a Newton-Raphson step.
 * This is a single-iteration MLE approximation — good enough for
 * a prototype adaptive system.
 *
 * Δθ = (response - P) / I(θ)
 * where response = 1 (correct) or 0 (wrong)
 */
export function updateTheta(
  currentTheta: number,
  responses: CATResponse[],
): number {
  if (responses.length === 0) return currentTheta

  // Newton-Raphson over all responses so far
  let numerator   = 0
  let denominator = 0

  for (const r of responses) {
    const p = raschProbability(currentTheta, r.item.rasch_b_value)
    const I = fisherInformation(currentTheta, r.item.rasch_b_value)
    numerator   += (r.isCorrect ? 1 : 0) - p
    denominator += I
  }

  if (denominator < 0.001) return currentTheta  // avoid division by zero

  const newTheta = currentTheta + numerator / denominator

  // Clamp to realistic range
  return Math.max(CAT_CONFIG.THETA_MIN, Math.min(CAT_CONFIG.THETA_MAX, newTheta))
}

// ─── SEM Calculation ─────────────────────────────────────────────────────────

/**
 * SEM = 1 / √(Test Information)
 * Test Information = Σ I(θ) over all administered items
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

// ─── Item Selection ───────────────────────────────────────────────────────────

/**
 * Select the unanswered item whose difficulty (b) is closest to current θ.
 * This is Maximum Information Item Selection under the Rasch model.
 */
export function selectNextItem(
  theta: number,
  allItems: Item[],
  answeredIds: string[],
): Item | null {
  const available = allItems.filter(
    (item) => item.item_status === 'Active' && !answeredIds.includes(item.id),
  )

  if (available.length === 0) return null

  return available.reduce((best, item) => {
    const distBest = Math.abs(best.rasch_b_value - theta)
    const distCurr = Math.abs(item.rasch_b_value - theta)
    return distCurr < distBest ? item : best
  })
}

// ─── Stopping Rule ───────────────────────────────────────────────────────────

export type StopReason = 'max_items' | 'sem_threshold' | 'no_items' | 'consecutive_failures' | null

/**
 * Count consecutive failures from the end of the responses array
 */
function countConsecutiveFailures(responses: CATResponse[]): number {
  if (responses.length === 0) return 0
  let count = 0
  for (let i = responses.length - 1; i >= 0; i--) {
    if (!responses[i].isCorrect) {
      count++
    } else {
      break
    }
  }
  return count
}

export function checkStoppingRule(
  itemsAdministered: number,
  sem: number,
  nextItem: Item | null,
  responses: CATResponse[] = [],
): StopReason {
  if (itemsAdministered >= CAT_CONFIG.MAX_ITEMS)      return 'max_items'
  if (sem <= CAT_CONFIG.SEM_THRESHOLD)                return 'sem_threshold'
  if (!nextItem)                                      return 'no_items'
  if (countConsecutiveFailures(responses) >= CAT_CONFIG.MAX_CONSECUTIVE_FAILURES) return 'consecutive_failures'
  return null
}

// ─── Ability Level Classification ─────────────────────────────────────────────

export function classifyAbility(theta: number): 'Low' | 'Average' | 'High' {
  if (theta < -0.5) return 'Low'
  if (theta > 0.5)  return 'High'
  return 'Average'
}

// ─── Test Information Function values ─────────────────────────────────────────

export function getTestInformation(theta: number, administeredItems: Item[]): number {
  return administeredItems.reduce(
    (sum, item) => sum + fisherInformation(theta, item.rasch_b_value),
    0,
  )
}
