// ABOUTME: EVM address helpers — EIP-55-aware validation of pasted 0x… strings and display truncation.
// ABOUTME: No React. Uses ethers for checksum verification of mixed-case addresses.

import { getAddress } from 'ethers'

const EVM_SHAPE = /^0x[a-fA-F0-9]{40}$/

/** Categorised EVM-address validation error. */
export type EvmAddressError = 'shape' | 'checksum'

export interface EvmAddressValidation {
  valid: boolean
  error?: EvmAddressError
}

/**
 * Validate an EVM address, including its EIP-55 checksum when one is present.
 *
 * Shape: `0x` + 40 hex. When the address is MIXED-case (contains both upper- and lower-case hex
 * letters) it carries an EIP-55 checksum, so we verify it via `ethers.getAddress()` and reject a
 * mismatch (`'checksum'`) — that catches a single mistyped or transposed character that a pure
 * shape check would wave through. All-lowercase / all-uppercase addresses carry no checksum (users
 * routinely paste raw-lowercase), so those are accepted on shape alone. Whitespace is trimmed.
 */
export function validateEvmAddress(value: string): EvmAddressValidation {
  const v = value.trim()
  if (!EVM_SHAPE.test(v)) return { valid: false, error: 'shape' }
  const hexLetters = v.slice(2).replace(/[^a-zA-Z]/g, '')
  const mixedCase = /[a-z]/.test(hexLetters) && /[A-Z]/.test(hexLetters)
  if (mixedCase) {
    try {
      getAddress(v)
    } catch {
      return { valid: false, error: 'checksum' }
    }
  }
  return { valid: true }
}

/** Boolean convenience over {@link validateEvmAddress} — true only when shape AND checksum pass. */
export function isEvmAddress(value: string): boolean {
  return validateEvmAddress(value).valid
}

/** Truncate an Ethereum address to "0x1234...abcd" (6 chars before, 4 after). */
export function truncateAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
