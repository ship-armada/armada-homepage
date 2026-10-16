// ABOUTME: Timing constants for the RollingBalanceValue digit roll — start delay, duration, and per-digit stagger.
// ABOUTME: Values match the armada-interface balance reveal so the odometer feels the same on both sites.

/** Delay before the roll starts, so it rides with the surrounding card's enter. */
const ROLL_START_DELAY_MS = 220

/** Digit odometer roll duration. */
const ROLL_DURATION_MS = 1000

export const BALANCE_ROLL_DIGIT_STAGGER_MS = 70

export function balanceRevealRollStartMs(): number {
  return ROLL_START_DELAY_MS
}

export function balanceRevealRollDurationMs(): number {
  return ROLL_DURATION_MS
}
