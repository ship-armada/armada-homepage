// ABOUTME: Tests for the EVM address helpers — EIP-55 validation and display truncation.
// ABOUTME: Mixed-case + whitespace tolerance is exercised explicitly since users frequently paste with trailing spaces.

import { describe, it, expect } from 'vitest'
import { isEvmAddress, truncateAddress, validateEvmAddress } from './address'

// Canonical EIP-55 checksummed address from the spec's test vectors.
const CHECKSUMMED = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'

describe('isEvmAddress', () => {
  it('accepts a valid lowercase address (no checksum to verify)', () => {
    expect(isEvmAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true)
  })
  it('accepts a correctly EIP-55-checksummed mixed-case address', () => {
    expect(isEvmAddress(CHECKSUMMED)).toBe(true)
  })
  it('rejects a mixed-case address with a bad EIP-55 checksum (typo guard)', () => {
    // WHY (P1 hygiene): a pure shape check waves through a transposed/mistyped character. The
    // checksum catches it. Flip one cased char of the canonical address → checksum no longer matches.
    expect(isEvmAddress('0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed')).toBe(false)
  })
  it('trims surrounding whitespace', () => {
    expect(isEvmAddress('  0x1234567890abcdef1234567890abcdef12345678  ')).toBe(true)
  })
  it('rejects missing prefix', () => {
    expect(isEvmAddress('1234567890abcdef1234567890abcdef12345678')).toBe(false)
  })
  it('rejects wrong length', () => {
    expect(isEvmAddress('0x1234')).toBe(false)
  })
  it('rejects non-hex chars', () => {
    expect(isEvmAddress('0xZZZZ567890abcdef1234567890abcdef12345678')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isEvmAddress('')).toBe(false)
  })
})

describe('validateEvmAddress', () => {
  it('categorises a shape failure', () => {
    expect(validateEvmAddress('0x1234')).toEqual({ valid: false, error: 'shape' })
  })
  it('categorises a checksum failure distinctly from a shape failure', () => {
    expect(validateEvmAddress('0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed')).toEqual({
      valid: false,
      error: 'checksum',
    })
  })
  it('accepts a correctly checksummed address with no error', () => {
    expect(validateEvmAddress(CHECKSUMMED)).toEqual({ valid: true })
  })
})

describe('truncateAddress', () => {
  it('truncates a long address to 6+4 chars', () => {
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678')
  })
  it('returns short strings unchanged', () => {
    expect(truncateAddress('0x1234')).toBe('0x1234')
  })
})
