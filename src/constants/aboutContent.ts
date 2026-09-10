import { APP_URL } from '@/utils/appNavigation'

export type RoadmapStage = {
  id: string
  /** Short uppercase marker rendered on the roadmap card. */
  label: string
  /** Bold lead-in after the label (verb / key phrase). */
  lead: string
  /** Remainder of the stage sentence after `lead`. */
  body: string
}

export type TeamSocial = {
  label: 'X'
  href: string
  icon: 'x'
}

export type TeamMember = {
  id: string
  name: string
  bio: string
  socials: TeamSocial[]
}

export type SupportersParagraph =
  | { lead: string; body: string }
  | { body: string }

const teamSocials = (x: string): TeamSocial[] => [
  { label: 'X', href: x, icon: 'x' },
]

export const ABOUT_HERO = {
  title: ['Armada is designed to be', 'a privacy layer for stablecoins'],
  body: 'A simple, durable way for wallets, fintechs, and on-chain financial products to offer shielded USDC balances and transfers.',
  cta: {
    label: 'Try Armada',
    href: APP_URL,
  },
}

export const ROADMAP = {
  title: ['Where', 'Armada is', 'going'],
  stages: [
    {
      id: 'now',
      label: 'Now',
      lead: 'launch',
      body: ' the shielded USDC protocol, SDK, and first integrations.',
    },
    {
      id: 'next',
      label: 'Next',
      lead: 'expand',
      body: ' integration surfaces, custody and signing models, and supported capital workflows.',
    },
    {
      id: 'then',
      label: 'Then',
      lead: 'broaden',
      body: ' the network of applications using Armada, so privacy improves through increased usage and activity.',
    },
    {
      id: 'finally',
      label: 'Finally',
      lead: 'make private stablecoin infrastructure normal',
      body: ', disappearing into on-chain financial products and services.',
    },
  ] as RoadmapStage[],
}

export const FLEET = {
  title: ['The Armada', 'fleet'],
  body: 'Armada is developed and supported by a small core team supported by a growing network of advisors, contributors, cryptographers, Ethereum community members, past colleagues, and fellow builders.',
}

export const CORE_TEAM = {
  title: ['Core team'],
  members: [
    {
      id: 'gavin',
      name: 'Gavin Birch',
      bio: 'Gavin Birch leads Armada’s vision and launch. Previously part of the founding teams at Figment and Figment Capital, and an angel investor in 50+ projects. He later bootstrapped Knowable, a technical team that has supported privacy projects for more than three years. A long-time privacy power user, he is building the product he wants to use himself.',
      socials: teamSocials('https://x.com/Ether_Gavin'),
    },
    {
      id: 'andrew',
      name: 'Andrew',
      bio: 'Andrew leads protocol architecture and mission-critical technical operations. Previously worked at a major Web3 foundation on messaging protocols and threshold cryptography. His background spans distributed systems, cryptography, multi-party computation, consensus, state machines, game theory, and economic security.',
      socials: teamSocials(''),
    },
    {
      id: 'ian',
      name: 'Ian',
      bio: 'Ian leads protocol implementation. An electrical engineer by training and technical mainstay at Knowable, with hands-on experience in blockchain infrastructure, full-stack development, and cross-chain applications.',
      socials: teamSocials(''),
    },
    {
      id: 'cryptodruide',
      name: 'CryptoDruide',
      bio: 'CryptoDruide focuses on strategy, team operations, and community development. A Web3 operator with a background in digital consulting, project management, and entrepreneurship.',
      socials: teamSocials(''),
    },
    {
      id: 'diego',
      name: 'Diego',
      bio: 'Diego leads front-end design and Armada’s creative direction. He has worked across crypto and fintech, including work for Aave.',
      socials: teamSocials('https://x.com/diegoprudencio'),
    },
    {
      id: 'ola',
      name: 'Ola',
      bio: 'Ola leads ecosystem growth and marketing strategy. Over the past decade, she has contributed to projects including Status, Cosmos/Tendermint, Fluence, and Epicenter.',
      socials: teamSocials(''),
    },
  ] as TeamMember[],
}

export const SUPPORTERS = {
  title: ['Advisors and supporters'],
  body: [
    {
      lead: 'Veil',
      body: ' advises on economics and market design. A crypto-native tactical unit founded by former Polychain Capital team members, Veil has supported some of the largest projects in the space.',
    },
    {
      body: 'Armada is also supported by cryptographers, Ethereum core community members, past colleagues, fellow builders, and friends from the trenches, advising and contributing in varying capacities.',
    },
  ] as SupportersParagraph[],
}

export const BUILD_WITH_ARMADA = {
  title: ['Build with Armada'],
  body: 'Integrating Armada, building something that works privately, or interested in contributing? We’d love to hear from you.',
  ctas: [
    {
      label: 'Start building',
      href: 'https://docs.armada.blue/guide/getting-started',
      external: true,
      variant: 'primary',
    },
    {
      label: 'Join Discord',
      href: 'https://discord.gg/eyD58prEV',
      external: true,
      variant: 'secondary',
    },
  ] as { label: string; href: string; external?: boolean; variant: 'primary' | 'secondary' }[],
}
