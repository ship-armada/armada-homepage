// ABOUTME: Ethereum mainnet reads for the public ARM allocation page — RevenueLock plus the reserve distributor.
// ABOUTME: Reads go to a public mainnet RPC unless VITE_MAINNET_RPC_URL overrides it. Ledgers list lock and reserve beneficiaries.

import { Contract, FetchRequest, JsonRpcProvider, formatUnits, getAddress, keccak256, toBeHex, zeroPadValue } from 'ethers'

/** Public read-only endpoint. No API key. Same source the original allocation page used. */
const DEFAULT_MAINNET_RPC = 'https://ethereum-rpc.publicnode.com'
const MAINNET_CHAIN_ID = 1n
const BPS = 10_000n
/** ethers' default fetch timeout is ~300s; cap reads so a wedged RPC fails fast. */
const RPC_TIMEOUT_MS = 15_000
/**
 * ethers folds concurrent calls into batches of up to ~100. Free RPC tiers cap batch size (dRPC
 * rejects more than 3), and the ledger fans out hundreds of reads, so keep batches small.
 */
const RPC_BATCH_MAX = 3

/**
 * RPC for every mainnet read. VITE_MAINNET_RPC_URL overrides the public node at build time; it ships
 * in the bundle, so it must not carry a secret (an origin-restricted read-only key is fine).
 */
export function mainnetRpcUrl(override: string | undefined = import.meta.env.VITE_MAINNET_RPC_URL): string {
  const trimmed = override?.trim()
  return trimmed ? trimmed : DEFAULT_MAINNET_RPC
}

export const ARM_DISTRIBUTOR = '0x3D2970Efcb93Ca20E6204F67C24496a9e5aB0131'
export const ARM_DISTRIBUTOR_URL = `https://etherscan.io/address/${ARM_DISTRIBUTOR}`

export const ARM_UNLOCK_STEPS = [
  { usd: 10_000, bps: 1_000, revenue: '$10k', pct: 10 },
  { usd: 50_000, bps: 2_500, revenue: '$50k', pct: 25 },
  { usd: 100_000, bps: 4_000, revenue: '$100k', pct: 40 },
  { usd: 250_000, bps: 6_000, revenue: '$250k', pct: 60 },
  { usd: 500_000, bps: 8_000, revenue: '$500k', pct: 80 },
  { usd: 1_000_000, bps: 10_000, revenue: '$1M', pct: 100 },
] as const

const DIST_ABI = [
  'function revenueLock() view returns (address)',
  'function beneficiaryCount() view returns (uint256)',
  'function beneficiaries(uint256) view returns (address)',
  'function collectedBps() view returns (uint256)',
  'function assigned(address) view returns (uint256)',
  'function claimed(address) view returns (uint256)',
  'function claimable(address) view returns (uint256)',
  'function effectiveAllocation(address) view returns (uint256)',
]

const LOCK_ABI = [
  'function allocation(address) view returns (uint256)',
  'function released(address) view returns (uint256)',
  'function releasable(address) view returns (uint256)',
  'function beneficiaryCount() view returns (uint256)',
  'function unlockPercentage() view returns (uint256)',
  'function currentRevenue() view returns (uint256)',
  'function getCappedObservedRevenue() view returns (uint256)',
]

/** Storage slot of RevenueLock._beneficiaries. Immutables are not in storage, so this is the third variable. */
const BENEFICIARIES_SLOT = 2n
const MAX_BENEFICIARIES = 500
/** RevenueReserveDistributor.MAX_BENEFICIARIES on mainnet: 75 grantees plus the allocator. */
const MAX_RESERVE_BENEFICIARIES = 76
const LEDGER_CHUNK = 25

interface LockReader {
  allocation(address: string): Promise<unknown>
  released(address: string): Promise<unknown>
  releasable(address: string): Promise<unknown>
  beneficiaryCount(): Promise<unknown>
  unlockPercentage(): Promise<unknown>
  currentRevenue(): Promise<unknown>
  getCappedObservedRevenue(): Promise<unknown>
}

interface StorageReader {
  getStorage(address: string, slot: bigint): Promise<string>
}

/** Distributor views the reserve ledger reads. */
export interface ReserveDistributorReader {
  beneficiaryCount(): Promise<unknown>
  beneficiaries(index: bigint): Promise<unknown>
  collectedBps(): Promise<unknown>
  claimed(address: string): Promise<unknown>
  claimable(address: string): Promise<unknown>
  effectiveAllocation(address: string): Promise<unknown>
}

interface DistributorReader extends ReserveDistributorReader {
  revenueLock(): Promise<unknown>
  assigned(address: string): Promise<unknown>
}

interface Readers {
  lock: LockReader
  lockAddress: string
  distributor: DistributorReader
  storage: StorageReader
}

export interface LedgerRow {
  address: string
  /** 'direct' rows are RevenueLock beneficiaries; 'reserve' rows are grants paid by the reserve distributor. */
  source: 'direct' | 'reserve'
  total: number
  unlocked: number
  claimed: number
  available: number
  locked: number
}

export interface ReserveLedger {
  rows: LedgerRow[]
  /** The lock has unlocked more reserve ARM than the distributor has collected, so grants cannot claim it yet. */
  awaitingCollection: boolean
}

export interface UnlockSnapshot {
  /** Recognized protocol revenue, in USD. */
  revenueUsd: number
  /** Revenue counted toward the unlock ratchet, in USD. */
  effectiveRevenueUsd: number
  unlockBps: number
  /** RevenueLock contract that produced this snapshot. */
  lockAddress: string
  next: { usd: number; bps: number; remainingUsd: number } | null
}

export interface FoundAllocation {
  status: 'found'
  address: string
  total: number
  unlocked: number
  available: number
  claimed: number
  locked: number
}

export interface EmptyAllocation {
  status: 'empty'
  address: string
}

export type AllocationRead = FoundAllocation | EmptyAllocation

export interface AllocationParts {
  address: string
  directAlloc: bigint
  directReleased: bigint
  directReleasable: bigint
  resAssigned: bigint
  resClaimed: bigint
  resClaimable: bigint
  resEffective: bigint
  unlockBps: bigint
}

let readersPromise: Promise<Readers> | null = null

function asBigint(value: unknown, label: string): bigint {
  if (typeof value === 'bigint') return value
  throw new Error(`Unexpected ${label} from Ethereum`)
}

function asAddress(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Unexpected contract address from Ethereum')
  return getAddress(value)
}

/** Last 20 bytes of a 32-byte storage word, checksummed. */
export function decodeStorageAddress(word: string): string {
  const hex = word.startsWith('0x') ? word.slice(2) : word
  if (hex.length < 40) throw new Error('Unexpected beneficiary word from Ethereum')
  return getAddress(`0x${hex.slice(-40)}`)
}

function mulBps(amount: bigint, bps: bigint): bigint {
  return (amount * bps) / BPS
}

function toArm(value: bigint): number {
  return Number(formatUnits(value, 18))
}

function max0(value: bigint): bigint {
  return value > 0n ? value : 0n
}

/** 0–100 position of `revenueUsd` along equally spaced milestones, matching the schedule labels. */
export function schedulePosition(revenueUsd: number): number {
  const points = [0, ...ARM_UNLOCK_STEPS.map((step) => step.usd)]
  const last = points[points.length - 1]
  const segments = points.length - 1
  if (last == null || segments <= 0 || revenueUsd >= last) return 100
  let index = 0
  while (index < segments) {
    const next = points[index + 1]
    if (next == null || revenueUsd < next) break
    index += 1
  }
  const lo = points[index] ?? 0
  const hi = points[index + 1] ?? lo
  const span = hi - lo
  const fraction = span === 0 ? 0 : Math.max(0, Math.min(1, (revenueUsd - lo) / span))
  return ((index + fraction) / segments) * 100
}

export function formatArm(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function compactCount(value: number): string {
  const text = value >= 10 ? Math.round(value).toString() : value.toFixed(1)
  return text.replace(/\.0$/, '')
}

export function formatUsd(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const abs = Math.abs(rounded)
  if (abs >= 1_000_000) return `${sign}$${compactCount(abs / 1_000_000)}M`
  if (abs >= 10_000) return `${sign}$${compactCount(abs / 1_000)}K`
  return `${sign}$${abs.toLocaleString('en-US')}`
}

export function directLedgerRow(
  address: string,
  allocation: bigint,
  released: bigint,
  releasable: bigint,
  unlockBps: bigint,
): LedgerRow {
  const unlocked = mulBps(allocation, unlockBps)
  return {
    address,
    source: 'direct',
    total: toArm(allocation),
    unlocked: toArm(unlocked),
    claimed: toArm(released),
    available: toArm(releasable),
    locked: toArm(max0(allocation - unlocked)),
  }
}

/** `available` is what the distributor can pay now, which lags `unlocked` until it collects from the lock. */
export function reserveLedgerRow(
  address: string,
  effective: bigint,
  claimed: bigint,
  claimable: bigint,
  unlockBps: bigint,
): LedgerRow {
  const unlocked = mulBps(effective, unlockBps)
  return {
    address,
    source: 'reserve',
    total: toArm(effective),
    unlocked: toArm(unlocked),
    claimed: toArm(claimed),
    available: toArm(claimable),
    locked: toArm(max0(effective - unlocked)),
  }
}

export function summarizeAllocation(parts: AllocationParts): AllocationRead {
  const hasDirect = parts.directAlloc > 0n
  const hasReserve = parts.resEffective > 0n || parts.resAssigned > 0n
  if (!hasDirect && !hasReserve) {
    return { status: 'empty', address: parts.address }
  }
  const unlocked = mulBps(parts.directAlloc, parts.unlockBps) + mulBps(parts.resEffective, parts.unlockBps)
  const total = parts.directAlloc + parts.resEffective
  const claimed = parts.directReleased + parts.resClaimed
  const available = parts.directReleasable + parts.resClaimable
  return {
    status: 'found',
    address: parts.address,
    total: toArm(total),
    unlocked: toArm(unlocked),
    available: toArm(available),
    claimed: toArm(claimed),
    locked: toArm(max0(total - unlocked)),
  }
}

/** Provider for `url` with a bounded fetch timeout and small JSON-RPC batches. */
export function mainnetProvider(url: string): JsonRpcProvider {
  const request = new FetchRequest(url)
  request.timeout = RPC_TIMEOUT_MS
  return new JsonRpcProvider(request, undefined, { batchMaxCount: RPC_BATCH_MAX })
}

async function readers(): Promise<Readers> {
  if (!readersPromise) {
    readersPromise = connect().catch((error: unknown) => {
      readersPromise = null
      throw error
    })
  }
  return readersPromise
}

async function connect(): Promise<Readers> {
  const provider = mainnetProvider(mainnetRpcUrl())
  const network = await provider.getNetwork()
  if (network.chainId !== MAINNET_CHAIN_ID) {
    throw new Error('RPC is not Ethereum mainnet')
  }
  const distributor = new Contract(ARM_DISTRIBUTOR, DIST_ABI, provider) as unknown as DistributorReader
  const lockAddress = asAddress(await distributor.revenueLock())
  const lock = new Contract(lockAddress, LOCK_ABI, provider) as unknown as LockReader
  return { lock, lockAddress, distributor, storage: provider }
}

export async function readDirectLedger(): Promise<LedgerRow[]> {
  const { lock, lockAddress, storage } = await readers()
  const [countRaw, bpsRaw] = await Promise.all([lock.beneficiaryCount(), lock.unlockPercentage()])
  const count = Number(asBigint(countRaw, 'beneficiary count'))
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_BENEFICIARIES) {
    throw new Error('Unexpected beneficiary count from Ethereum')
  }
  if (count === 0) return []
  const unlockBps = asBigint(bpsRaw, 'unlock percentage')
  const base = BigInt(keccak256(zeroPadValue(toBeHex(BENEFICIARIES_SLOT), 32)))
  const words = await Promise.all(
    Array.from({ length: count }, (_, index) => storage.getStorage(lockAddress, base + BigInt(index))),
  )
  const addresses = words.map((word) => decodeStorageAddress(word)).filter((address) => address !== getAddress('0x' + '0'.repeat(40)))
  const rows: LedgerRow[] = []
  for (let start = 0; start < addresses.length; start += LEDGER_CHUNK) {
    const chunk = addresses.slice(start, start + LEDGER_CHUNK)
    const part = await Promise.all(
      chunk.map(async (address) => {
        const [allocation, released, releasable] = await Promise.all([
          lock.allocation(address),
          lock.released(address),
          lock.releasable(address),
        ])
        return directLedgerRow(
          address,
          asBigint(allocation, 'allocation'),
          asBigint(released, 'released'),
          asBigint(releasable, 'releasable'),
          unlockBps,
        )
      }),
    )
    rows.push(...part)
  }
  return rows
}

/** Reserve grants from the distributor's beneficiary list, in list order. The allocator is always index 0. */
export async function collectReserveLedger(
  distributor: ReserveDistributorReader,
  lock: { unlockPercentage(): Promise<unknown> },
): Promise<ReserveLedger> {
  const [countRaw, bpsRaw, collectedRaw] = await Promise.all([
    distributor.beneficiaryCount(),
    lock.unlockPercentage(),
    distributor.collectedBps(),
  ])
  const count = Number(asBigint(countRaw, 'reserve beneficiary count'))
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_RESERVE_BENEFICIARIES) {
    throw new Error('Unexpected reserve beneficiary count from Ethereum')
  }
  const unlockBps = asBigint(bpsRaw, 'unlock percentage')
  const awaitingCollection = asBigint(collectedRaw, 'collected bps') < unlockBps
  const addresses = await Promise.all(
    Array.from({ length: count }, async (_, index) => asAddress(await distributor.beneficiaries(BigInt(index)))),
  )
  const rows: LedgerRow[] = []
  for (let start = 0; start < addresses.length; start += LEDGER_CHUNK) {
    const chunk = addresses.slice(start, start + LEDGER_CHUNK)
    const part = await Promise.all(
      chunk.map(async (address) => {
        const [effective, claimed, claimable] = await Promise.all([
          distributor.effectiveAllocation(address),
          distributor.claimed(address),
          distributor.claimable(address),
        ])
        return reserveLedgerRow(
          address,
          asBigint(effective, 'effective allocation'),
          asBigint(claimed, 'claimed'),
          asBigint(claimable, 'claimable'),
          unlockBps,
        )
      }),
    )
    rows.push(...part.filter((row) => row.total > 0))
  }
  return { rows, awaitingCollection }
}

export async function readReserveLedger(): Promise<ReserveLedger> {
  const { lock, distributor } = await readers()
  return collectReserveLedger(distributor, lock)
}

export async function readUnlockSnapshot(): Promise<UnlockSnapshot> {
  const { lock, lockAddress } = await readers()
  const [raw, effective, bps] = await Promise.all([
    lock.currentRevenue(),
    lock.getCappedObservedRevenue(),
    lock.unlockPercentage(),
  ])
  const unlockBps = Number(asBigint(bps, 'unlock percentage'))
  const effectiveUsd = toArm(asBigint(effective, 'effective revenue'))
  const nextStep = ARM_UNLOCK_STEPS.find((step) => step.bps > unlockBps) ?? null
  return {
    revenueUsd: toArm(asBigint(raw, 'revenue')),
    effectiveRevenueUsd: effectiveUsd,
    unlockBps,
    lockAddress,
    next: nextStep
      ? { usd: nextStep.usd, bps: nextStep.bps, remainingUsd: Math.max(0, nextStep.usd - effectiveUsd) }
      : null,
  }
}

export async function readAllocation(address: string): Promise<AllocationRead> {
  const normalized = getAddress(address)
  const { lock, distributor } = await readers()
  const [directAlloc, directReleased, directReleasable, resAssigned, resClaimed, resClaimable, resEffective, bps] =
    await Promise.all([
      lock.allocation(normalized),
      lock.released(normalized),
      lock.releasable(normalized),
      distributor.assigned(normalized),
      distributor.claimed(normalized),
      distributor.claimable(normalized),
      distributor.effectiveAllocation(normalized),
      lock.unlockPercentage(),
    ])
  return summarizeAllocation({
    address: normalized,
    directAlloc: asBigint(directAlloc, 'allocation'),
    directReleased: asBigint(directReleased, 'released'),
    directReleasable: asBigint(directReleasable, 'releasable'),
    resAssigned: asBigint(resAssigned, 'assigned'),
    resClaimed: asBigint(resClaimed, 'claimed'),
    resClaimable: asBigint(resClaimable, 'claimable'),
    resEffective: asBigint(resEffective, 'effective allocation'),
    unlockBps: asBigint(bps, 'unlock percentage'),
  })
}
