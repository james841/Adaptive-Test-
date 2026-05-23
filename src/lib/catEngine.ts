/**
 * CAT Engine — Rasch-Based Computerised Adaptive Testing
 *
 * Algorithm:
 *  1. Start θ = 0.00 logits
 *  2. Select item with b-value closest to current θ (Maximum Fisher Information)
 *  3. After response: update θ via Newton-Raphson MLE approximation
 *  4. Apply MLEF fence (-3.5, 3.5) then hard bounds (-4.0, 4.0)
 *  5. Compute SEM = 1 / √(Σ Fisher Information)
 *  6. Stop if: items ≥ MAX_ITEMS  OR  (items ≥ MIN_ITEMS AND SEM ≤ SEM_THRESHOLD)
 *
 * Settings match AllTestSim configuration:
 *  - MODE: CAT
 *  - ISC: MFI (Maximum Fisher Information)
 *  - SE: MLEF with FENCE -3.5, 3.5
 *  - SE: BND -4.0, 4.0
 *  - TL: Variable MIN 10, MAX 30, SEE 0.30
 *  - INITIAL THETA: Fixed 0.0
 */

import type { Item, CATResponse } from '@/types'

// ─── Configuration ─────────────────────────────────────────────────────────────
// Matches AllTestSim syntax preview settings exactly
export const CAT_CONFIG = {
  INITIAL_THETA:  0.00,   // SE> FIX, 0.0 — starting ability estimate (logits)
  MAX_ITEMS:      30,     // TL> FIX, 30  — maximum items before forced stop
  MIN_ITEMS:      10,     // Variable min — don't stop before 10 items
  SEM_THRESHOLD:  0.30,   // SEE 0.30     — stop when SEM ≤ this value
  THETA_MIN:      -4.0,   // SE> BND -4   — hard lower bound
  THETA_MAX:       4.0,   // SE> BND  4   — hard upper bound
  FENCE_LOW:      -3.5,   // SE> FENCE -3.5 — MLEF soft lower fence
  FENCE_HIGH:      3.5,   // SE> FENCE  3.5 — MLEF soft upper fence
} as const

// ─── Rasch Model ────────────────────────────────────────────────────────────────

/**
 * Rasch Probability:
 * P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
 *
 * Probability that a student with ability θ answers correctly
 * an item with difficulty parameter b.
 */
export function raschProbability(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)))
}

/**
 * Fisher Information for a single Rasch item at ability θ:
 * I(θ) = P(θ) × (1 − P(θ))
 *
 * Maximum information occurs when θ = b (item difficulty matches ability).
 */
export function fisherInformation(theta: number, b: number): number {
  const p = raschProbability(theta, b)
  return p * (1 - p)
}

// ─── Ability Estimation (MLEF — MLE with Fence) ──────────────────────────────

/**
 * Update theta using Newton-Raphson MLE over all responses so far.
 * This implements MLEF (MLE with Fence) as used in AllTestSim:
 *
 *   Δθ = Σ(u_i − P_i) / Σ I_i(θ)
 *
 * where u_i = 1 (correct) or 0 (wrong), P_i = Rasch probability,
 * I_i = Fisher information.
 *
 * After estimation, apply MLEF fence then hard bounds.
 */
export function updateTheta(
  currentTheta: number,
  responses: CATResponse[],
): number {
  if (responses.length === 0) return currentTheta

  let numerator   = 0
  let denominator = 0

  for (const r of responses) {
    const p = raschProbability(currentTheta, r.item.rasch_b_value)
    const I = fisherInformation(currentTheta, r.item.rasch_b_value)
    numerator   += (r.isCorrect ? 1 : 0) - p
    denominator += I
  }

  // Avoid division by zero (can happen with extreme ability estimates)
  if (denominator < 0.001) return currentTheta

  const newTheta = currentTheta + numerator / denominator

  // Step 1: Apply MLEF fence (soft boundary — prevents extreme jumps)
  const fenced = Math.max(
    CAT_CONFIG.FENCE_LOW,
    Math.min(CAT_CONFIG.FENCE_HIGH, newTheta),
  )

  // Step 2: Apply hard bounds (absolute limits)
  return Math.max(CAT_CONFIG.THETA_MIN, Math.min(CAT_CONFIG.THETA_MAX, fenced))
}

// ─── SEM Calculation ─────────────────────────────────────────────────────────

/**
 * Standard Error of Measurement:
 * SEM = 1 / √(Test Information)
 *
 * Test Information = Σ I_i(θ) over all administered items.
 * Lower SEM = more precise ability estimate.
 * Target: SEM ≤ 0.30 (matches AllTestSim SEE threshold).
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

// ─── Item Selection (MFI — Maximum Fisher Information) ───────────────────────

/**
 * Select the next item using Maximum Fisher Information (MFI):
 * Choose the unanswered Active item whose b-value is closest to current θ.
 *
 * Under the Rasch model, the item with b closest to θ provides the
 * maximum Fisher information at that ability level.
 *
 * Matches AllTestSim: ISC> MFI
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

// ─── Stopping Rule ────────────────────────────────────────────────────────────

export type StopReason = 'max_items' | 'sem_threshold' | 'no_items' | null

/**
 * Variable-length stopping rule matching AllTestSim:
 *  TL> Variable, Min: 10, Max: 30, SEE: 0.30
 *
 * Stop when:
 *  1. No more items available
 *  2. Hard cap: items administered ≥ MAX_ITEMS (30)
 *  3. Precision reached: items ≥ MIN_ITEMS (10) AND SEM ≤ 0.30
 *
 * The MIN_ITEMS guard prevents early stopping before enough
 * information has been collected for a reliable estimate.
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

// ─── Ability Level Classification ─────────────────────────────────────────────

/**
 * Classify final theta into descriptive ability levels.
 * Categories:
 *  Low:     -4.00 ≤ θ < -1.33
 *  Average: -1.33 ≤ θ < 1.33
 *  High:    1.33 ≤ θ ≤ 4.00
 */
export function classifyAbility(theta: number): 'Low' | 'Average' | 'High' {
  if (theta < -1.33) return 'Low'
  if (theta >= 1.33) return 'High'
  return 'Average'
}

// ─── Test Information ─────────────────────────────────────────────────────────

/**
 * Total Test Information at a given theta level.
 * Higher = more precise measurement at that ability point.
 */
export function getTestInformation(theta: number, administeredItems: Item[]): number {
  return administeredItems.reduce(
    (sum, item) => sum + fisherInformation(theta, item.rasch_b_value),
    0,
  )
}