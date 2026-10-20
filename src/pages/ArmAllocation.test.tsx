// ABOUTME: Tests for the public ARM allocation page — lookup validation and on-chain results.
// ABOUTME: Ethereum reads are stubbed so the page can render without mainnet.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ArmAllocation } from './ArmAllocation'

const { readAllocation, readUnlockSnapshot, readDirectLedger, readReserveLedger } = vi.hoisted(() => ({
  readAllocation: vi.fn(),
  readUnlockSnapshot: vi.fn(),
  readDirectLedger: vi.fn(),
  readReserveLedger: vi.fn(),
}))

vi.mock('@/utils/armAllocation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/armAllocation')>()
  return {
    ...actual,
    readAllocation,
    readUnlockSnapshot,
    readDirectLedger,
    readReserveLedger,
  }
})

const VALID = '0x1111111111111111111111111111111111111111'
const GRANTEE = '0x2222222222222222222222222222222222222222'
const DISTRIBUTOR = '0x3D2970Efcb93Ca20E6204F67C24496a9e5aB0131'

function ledgerRow(address: string, source: 'direct' | 'reserve', total: number) {
  return { address, source, total, unlocked: 0, claimed: 0, available: 0, locked: total }
}

/** Open the "Allocations" disclosure in More detail. */
function openLedger() {
  const summary = screen.getAllByText('Allocations')[0]
  expect(summary).toBeDefined()
  if (summary) fireEvent.click(summary)
}

/** Render and let the on-mount ledger and snapshot reads settle inside act(). */
async function renderPage() {
  await act(async () => {
    render(<ArmAllocation />)
  })
}

describe('ArmAllocation', () => {
  beforeEach(() => {
    readUnlockSnapshot.mockResolvedValue({
      revenueUsd: 0,
      effectiveRevenueUsd: 0,
      unlockBps: 0,
      lockAddress: '0x9f3918cdB8d4B4527B2199Efee70607899de21dD',
      next: { usd: 10_000, bps: 1_000, remainingUsd: 10_000 },
    })
    readAllocation.mockResolvedValue({ status: 'empty', address: VALID })
    readDirectLedger.mockResolvedValue([])
    readReserveLedger.mockResolvedValue({ rows: [], awaitingCollection: false })
  })

  it('renders the lookup and the supply split', async () => {
    await renderPage()
    expect(screen.getByRole('heading', { name: 'Check your ARM allocation, sailor.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How ARM is split' })).toBeInTheDocument()
    expect(screen.getByLabelText('Wallet or Safe address')).toBeInTheDocument()
  })

  it('rejects an address that is not an Ethereum address', async () => {
    await renderPage()
    fireEvent.change(screen.getByLabelText('Wallet or Safe address'), { target: { value: 'not-an-address' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check allocation' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid Ethereum address.')
    expect(readAllocation).not.toHaveBeenCalled()
  })

  it('shows no allocation when Ethereum has none for the address', async () => {
    await renderPage()
    fireEvent.change(screen.getByLabelText('Wallet or Safe address'), { target: { value: VALID } })
    fireEvent.click(screen.getByRole('button', { name: 'Check allocation' }))
    expect(await screen.findByRole('heading', { name: 'No allocation found' })).toBeInTheDocument()
  })

  it('shows the allocation Ethereum returns', async () => {
    readAllocation.mockResolvedValue({
      status: 'found',
      address: VALID,
      total: 60_000,
      unlocked: 0,
      available: 0,
      claimed: 0,
      locked: 60_000,
    })
    await renderPage()
    fireEvent.change(screen.getByLabelText('Wallet or Safe address'), { target: { value: VALID } })
    fireEvent.click(screen.getByRole('button', { name: 'Check allocation' }))
    expect(await screen.findByRole('heading', { name: 'Allocation found' })).toBeInTheDocument()
    expect(screen.getAllByText('60,000').length).toBeGreaterThan(0)
    expect(screen.getByText('Your ARM unlock schedule based on project revenue')).toBeInTheDocument()
    expect(screen.getAllByText('Revenue-locked').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Launch team').length).toBeGreaterThan(0)
    expect(screen.getByText('Launch team allocation')).toBeInTheDocument()
    expect(screen.queryByText('Your allocation')).not.toBeInTheDocument()
    expect(screen.queryByText('Next unlock: 6,000 ARM at $10k revenue')).not.toBeInTheDocument()
    expect(screen.queryByText('Verified on-chain')).not.toBeInTheDocument()
  })

  it('lists direct allocations from Ethereum', async () => {
    readDirectLedger.mockResolvedValue([ledgerRow(VALID, 'direct', 60_000)])
    await renderPage()
    openLedger()
    expect(await screen.findByRole('rowheader', { name: VALID })).toBeInTheDocument()
    expect(screen.getAllByText('60,000').length).toBeGreaterThan(0)
  })

  it('lists direct allocations and reserve grants in one table, each with its source', async () => {
    readDirectLedger.mockResolvedValue([ledgerRow(VALID, 'direct', 60_000)])
    readReserveLedger.mockResolvedValue({ rows: [ledgerRow(GRANTEE, 'reserve', 20_000)], awaitingCollection: false })
    await renderPage()
    openLedger()
    const direct = (await screen.findByRole('rowheader', { name: VALID })).closest('tr')
    const reserve = screen.getByRole('rowheader', { name: GRANTEE }).closest('tr')
    expect(direct).toHaveTextContent('Direct')
    expect(reserve).toHaveTextContent('Reserve')
    expect(reserve).toHaveTextContent('20,000')
  })

  it('labels the reserve distributor row on the lock as the pooled reserve', async () => {
    readDirectLedger.mockResolvedValue([ledgerRow(DISTRIBUTOR, 'direct', 402_950)])
    await renderPage()
    openLedger()
    expect(await screen.findByRole('rowheader', { name: `${DISTRIBUTOR} Reserve distributor (pooled)` })).toBeInTheDocument()
  })

  it('says so when the reserve has no grants yet', async () => {
    readDirectLedger.mockResolvedValue([ledgerRow(DISTRIBUTOR, 'direct', 402_950)])
    await renderPage()
    openLedger()
    expect(await screen.findByText('No reserve grants assigned yet.')).toBeInTheDocument()
  })

  it('keeps direct allocations when reserve grants fail to load', async () => {
    readDirectLedger.mockResolvedValue([ledgerRow(VALID, 'direct', 60_000)])
    readReserveLedger.mockRejectedValue(new Error('rpc down'))
    await renderPage()
    openLedger()
    expect(await screen.findByRole('rowheader', { name: VALID })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load reserve grants from Ethereum.')
  })

  it('explains reserve ARM that is unlocked but not yet collected', async () => {
    readReserveLedger.mockResolvedValue({ rows: [ledgerRow(GRANTEE, 'reserve', 20_000)], awaitingCollection: true })
    await renderPage()
    openLedger()
    expect(
      await screen.findByText('Unlocked reserve ARM becomes claimable once it’s collected from the RevenueLock.'),
    ).toBeInTheDocument()
  })

  it('reports a read failure', async () => {
    readAllocation.mockRejectedValue(new Error('rpc down'))
    await renderPage()
    fireEvent.change(screen.getByLabelText('Wallet or Safe address'), { target: { value: VALID } })
    fireEvent.click(screen.getByRole('button', { name: 'Check allocation' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not read this address from Ethereum.')
  })
})
