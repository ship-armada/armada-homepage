// ABOUTME: Tests for ARM allocation math — milestone position, direct/reserve totals, and the reserve ledger.
// ABOUTME: Contract reads use in-memory fakes here; nothing in this file talks to Ethereum.

import { describe, expect, it } from 'vitest'
import {
  collectReserveLedger,
  decodeStorageAddress,
  directLedgerRow,
  formatUsd,
  mainnetProvider,
  mainnetRpcUrl,
  reserveLedgerRow,
  schedulePosition,
  summarizeAllocation,
  type ReserveDistributorReader,
} from './armAllocation'

const ether = (arm: number) => BigInt(arm) * 10n ** 18n

describe('mainnetRpcUrl', () => {
  it('defaults to the public node when no override is set', () => {
    expect(mainnetRpcUrl(undefined)).toBe('https://ethereum-rpc.publicnode.com')
  })

  it('treats a blank override as unset', () => {
    expect(mainnetRpcUrl('   ')).toBe('https://ethereum-rpc.publicnode.com')
  })

  it('uses the override when one is set', () => {
    expect(mainnetRpcUrl(' https://eth.drpc.org ')).toBe('https://eth.drpc.org')
  })
})

describe('mainnetProvider', () => {
  it('keeps JSON-RPC batches within free-tier limits', () => {
    // dRPC's free plan rejects batches of more than 3 requests.
    expect(mainnetProvider('https://eth.drpc.org')._getOption('batchMaxCount')).toBeLessThanOrEqual(3)
  })
})

describe('formatUsd', () => {
  it('keeps small amounts exact and compacts large ones', () => {
    expect(formatUsd(0)).toBe('$0')
    expect(formatUsd(950)).toBe('$950')
    expect(formatUsd(120_000)).toBe('$120K')
    expect(formatUsd(1_000_000)).toBe('$1M')
    expect(formatUsd(1_200_000)).toBe('$1.2M')
  })
})
describe('schedulePosition', () => {
  it('is 0 before the first milestone', () => {
    expect(schedulePosition(0)).toBe(0)
  })

  it('sits halfway from $0 to $10k at $5k', () => {
    expect(schedulePosition(5_000)).toBeCloseTo(100 / 12)
  })

  it('is 100 once revenue passes $1M', () => {
    expect(schedulePosition(2_000_000)).toBe(100)
  })
})

describe('decodeStorageAddress', () => {
  it('checksums the address in a storage word', () => {
    expect(decodeStorageAddress('0x000000000000000000000000b202c7b6d456fd1f9b6633bb3c42b5cc0f0a52f1')).toBe(
      '0xb202c7b6D456Fd1F9B6633bb3c42b5cC0F0A52F1',
    )
  })
})

describe('directLedgerRow', () => {
  it('unlocks a direct allocation by the current bps', () => {
    expect(directLedgerRow('0x1111111111111111111111111111111111111111', ether(60_000), 0n, 0n, 1_000n)).toMatchObject({
      source: 'direct',
      total: 60_000,
      unlocked: 6_000,
      claimed: 0,
      available: 0,
      locked: 54_000,
    })
  })
})

describe('summarizeAllocation', () => {
  it('reports no allocation when every balance is zero', () => {
    expect(
      summarizeAllocation({
        address: '0x1111111111111111111111111111111111111111',
        directAlloc: 0n,
        directReleased: 0n,
        directReleasable: 0n,
        resAssigned: 0n,
        resClaimed: 0n,
        resClaimable: 0n,
        resEffective: 0n,
        unlockBps: 0n,
      }).status,
    ).toBe('empty')
  })

  it('adds a direct allocation and a reserve grant, and unlocks by bps', () => {
    const found = summarizeAllocation({
      address: '0x1111111111111111111111111111111111111111',
      directAlloc: ether(40_000),
      directReleased: ether(1_000),
      directReleasable: ether(3_000),
      resAssigned: ether(20_000),
      resClaimed: ether(500),
      resClaimable: ether(1_500),
      resEffective: ether(20_000),
      unlockBps: 1_000n,
    })
    expect(found).toMatchObject({
      status: 'found',
      total: 60_000,
      unlocked: 6_000,
      available: 4_500,
      claimed: 1_500,
      locked: 54_000,
    })
  })
})

describe('reserveLedgerRow', () => {
  it('unlocks a reserve grant by the current bps and reports what the distributor can pay now', () => {
    expect(
      reserveLedgerRow('0x2222222222222222222222222222222222222222', ether(20_000), ether(500), ether(1_500), 1_000n),
    ).toMatchObject({
      source: 'reserve',
      total: 20_000,
      unlocked: 2_000,
      claimed: 500,
      available: 1_500,
      locked: 18_000,
    })
  })
})

const ALLOCATOR = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const GRANTEE_A = '0x1111111111111111111111111111111111111111'
const GRANTEE_B = '0x2222222222222222222222222222222222222222'

interface FakeGrant {
  address: string
  effective: bigint
  claimed: bigint
  claimable: bigint
}

function fakeDistributor(grants: FakeGrant[], options: { collectedBps?: bigint; count?: unknown } = {}) {
  const byAddress = new Map(grants.map((grant) => [grant.address.toLowerCase(), grant]))
  const grant = (address: string) => {
    const found = byAddress.get(address.toLowerCase())
    if (!found) throw new Error(`unexpected address ${address}`)
    return found
  }
  const reader: ReserveDistributorReader = {
    beneficiaryCount: async () => options.count ?? BigInt(grants.length),
    beneficiaries: async (index: bigint) => grants[Number(index)]?.address,
    collectedBps: async () => options.collectedBps ?? 0n,
    effectiveAllocation: async (address: string) => grant(address).effective,
    claimed: async (address: string) => grant(address).claimed,
    claimable: async (address: string) => grant(address).claimable,
  }
  return reader
}

const lockAt = (bps: bigint) => ({ unlockPercentage: async () => bps })

describe('collectReserveLedger', () => {
  it('lists reserve grants in distributor order and drops recipients with nothing allocated', async () => {
    const distributor = fakeDistributor([
      { address: ALLOCATOR, effective: 0n, claimed: 0n, claimable: 0n },
      { address: GRANTEE_A, effective: ether(20_000), claimed: 0n, claimable: ether(2_000) },
      { address: GRANTEE_B, effective: ether(10_000), claimed: ether(1_000), claimable: 0n },
    ])
    const ledger = await collectReserveLedger(distributor, lockAt(1_000n))
    expect(ledger.rows.map((row) => row.address)).toEqual([GRANTEE_A, GRANTEE_B])
    expect(ledger.rows[0]).toMatchObject({ source: 'reserve', total: 20_000, unlocked: 2_000, available: 2_000 })
  })

  it('flags unlocked reserve ARM the distributor has not collected yet', async () => {
    const grants = [{ address: GRANTEE_A, effective: ether(20_000), claimed: 0n, claimable: 0n }]
    const behind = await collectReserveLedger(fakeDistributor(grants, { collectedBps: 0n }), lockAt(1_000n))
    const caughtUp = await collectReserveLedger(fakeDistributor(grants, { collectedBps: 1_000n }), lockAt(1_000n))
    expect(behind.awaitingCollection).toBe(true)
    expect(caughtUp.awaitingCollection).toBe(false)
  })

  it('rejects a beneficiary count above the distributor cap', async () => {
    await expect(collectReserveLedger(fakeDistributor([], { count: 77n }), lockAt(0n))).rejects.toThrow(
      'Unexpected reserve beneficiary count from Ethereum',
    )
  })

  it('rejects a balance that is not a uint256', async () => {
    const distributor = fakeDistributor([{ address: GRANTEE_A, effective: ether(1), claimed: 0n, claimable: 0n }])
    distributor.claimed = async () => '12'
    await expect(collectReserveLedger(distributor, lockAt(0n))).rejects.toThrow('Unexpected claimed from Ethereum')
  })
})
