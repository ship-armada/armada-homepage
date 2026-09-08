import type { ComponentType, SVGProps } from 'react'
import {
  ArrowsRightLeftIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  DocumentCheckIcon,
  GiftIcon,
  UsersIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'

export type UseCaseIcon = ComponentType<SVGProps<SVGSVGElement>>

export type UseCaseCardContent = {
  id: string
  title: string
  /** One or more body paragraphs under the title. */
  body: string[]
  Icon: UseCaseIcon
}

export const USE_CASES_HERO = {
  eyebrow: 'Use cases',
  title: [
    'If everything you do',
    'could be seen by everyone,',
    'would you still want to use USDC?',
  ],
  body: 'Designed to disappear into existing products and services, Armada gives platforms and organizations a private way to hold and move USDC on-chain.',
  cta: {
    label: 'Explore integrations',
    href: 'https://docs.armada.blue/',
    external: true,
  },
}

/** Homepage-style split panel — diagram ships later. */
export const SHIELDED_MPC = {
  tag: 'Shielded MPC',
  title: [
    'MPC controls who can move funds. Armada controls what the public can see.',
  ],
  body: 'Institutional wallets handle approvals, policies and MPC signing. Armada adds private balances, counterparties and transaction relationships for on-chain operations.',
  cta: {
    label: 'Explore integrations',
    href: 'https://docs.armada.blue/',
    external: true,
  },
  diagramLabel: 'How Armada works with institutional wallets and selective disclosure',
}

export const USE_CASE_CARDS: UseCaseCardContent[] = [
  {
    id: 'treasury',
    title: 'Treasury and operations',
    body: [
      'Keep routine organizational activity from becoming public intelligence.',
      'Use Armada for treasury movements, vendor payments, grants, reimbursements, and other recurring operating flows without exposing balances, counterparties, or transaction relationships to everyone watching the chain.',
    ],
    Icon: BanknotesIcon,
  },
  {
    id: 'payroll',
    title: 'Payroll and contributor payments',
    body: [
      'Pay employees, contractors, contributors, and community members without publishing compensation relationships on-chain.',
      'Recipients can receive and move USDC without their payment history becoming part of an easily traceable public graph.',
    ],
    Icon: UsersIcon,
  },
  {
    id: 'capital',
    title: 'Private capital management',
    body: [
      'Move capital between accounts, venues, strategies, and counterparties without making every allocation decision public. Armada can sit beneath existing custody and policy systems, adding privacy without requiring institutions to abandon their operational controls.',
      'Useful for platforms that serve funds, trading teams, DAOs, family offices, and other organizations whose operational activity can reveal strategy before they intend to disclose it.',
    ],
    Icon: ArrowsRightLeftIcon,
  },
  {
    id: 'wallets',
    title: 'Wallets and fintech products',
    body: [
      'Add shielded USDC balances and transfers directly to an existing product.',
      'Armada’s SDK is designed to let wallets, fintechs, and on-chain applications offer privacy without requiring users to understand zero-knowledge proofs or interact with a separate privacy application.',
    ],
    Icon: WalletIcon,
  },
  {
    id: 'grants',
    title: 'Grants, bounties, and community payments',
    body: [
      'Distribute funds without permanently linking recipients to a public treasury or revealing the size and timing of every payment.',
      'Useful for ecosystems where recipients may reasonably want financial activity separated from their public identity.',
    ],
    Icon: GiftIcon,
  },
  {
    id: 'commerce',
    title: 'Commerce and business payments',
    body: [
      'Settle invoices, supplier payments, and other business transactions in USDC without publishing a company’s cash movements and commercial relationships.',
      'Stablecoins can provide fast, programmable settlement without requiring the underlying business activity to become public.',
    ],
    Icon: BuildingStorefrontIcon,
  },
  {
    id: 'disclosure',
    title: 'Selective disclosure',
    body: [
      'Privacy does not require making records inaccessible.',
      'Armada is designed so users can disclose relevant transaction information to auditors, accountants, counterparties, or other authorized parties when needed, without making the same information public by default.',
    ],
    Icon: DocumentCheckIcon,
  },
]

export const WHAT_ARMADA_IS_NOT = {
  eyebrow: 'What Armada is not',
  title:
    'Armada is not intended to hide every observable signal or make all blockchain activity indistinguishable.',
  body: 'It is designed to remove the most consequential forms of routine financial exposure while keeping the system simple enough to integrate into real products and workflows.',
}

export const USE_CASES_BUILD = {
  title: ['Build with Armada'],
  body: 'Building something that needs private stablecoin infrastructure?',
  ctas: [
    {
      label: 'Start building',
      href: 'https://docs.armada.blue/guide/getting-started',
      external: true,
      variant: 'primary' as const,
    },
    {
      label: 'Get in touch',
      href: 'mailto:integrate@armada.blue',
      external: false,
      variant: 'secondary' as const,
    },
  ],
}
