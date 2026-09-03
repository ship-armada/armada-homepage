import { APP_URL } from '@/utils/appNavigation'

export type RoadmapStage = {
  id: string
  /** Short uppercase marker rendered on the roadmap card. */
  label: string
  body: string
}

export type TeamSocial = {
  label: 'LinkedIn' | 'X'
  href: string
  icon: 'linkedin' | 'x'
}

export type TeamMember = {
  id: string
  name: string
  bio: string
  socials: TeamSocial[]
}

const teamSocials = (linkedin: string, x: string): TeamSocial[] => [
  { label: 'LinkedIn', href: linkedin, icon: 'linkedin' },
  { label: 'X', href: x, icon: 'x' },
]

export const ABOUT_HERO = {
  title: ['Armada is designed to be', 'a privacy layer for stablecoins'],
  body: 'Shielded USDC that settles across chains, with disclosure that stays under the account holder’s control.',
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
      body: 'Launch the shielded USDC pool, SDK and first integrations.',
    },
    {
      id: 'next',
      label: 'Next',
      body: 'Expand cross-chain coverage and open the relayer set so transfers settle wherever balances already live.',
    },
    {
      id: 'then',
      label: 'Then',
      body: 'Ship shielded yield and selective disclosure tooling that treasuries and auditors can rely on.',
    },
    {
      id: 'finally',
      label: 'Finally',
      body: 'Hand the protocol to its users: neutral, governed in the open, and impossible for any single party to capture.',
    },
  ] as RoadmapStage[],
}

export const FLEET = {
  title: ['The Armada', 'fleet'],
  body: 'Armada is built to be a small fleet supported by a broad network of sailors: contributors, research partners, Ethereum core teams, security reviewers and fellow builders.',
}

export const CORE_TEAM = {
  title: ['The core team'],
  members: [
    {
      id: 'gavin',
      name: 'Gavin',
      bio: 'Gavin Birch leads Armada’s vision and launch. Previously part of the founding teams at Figment and Figment Capital, and an angel investor in 50+ projects. He later bootstrapped Knowable, a technical team that has supported privacy projects for more than three years. A long-time privacy power user, he is building the product he wants to use himself.',
      socials: teamSocials(
        'https://www.linkedin.com/in/gavin-birch-74729918b',
        'https://x.com/Ether_Gavin',
      ),
    },
    {
      id: 'andrew',
      name: 'Andrew',
      bio: 'Andrew leads protocol architecture and mission-critical technical operations. Previously worked at a major Web3 foundation on messaging protocols and threshold cryptography. His background spans distributed systems, cryptography, multi-party computation, consensus, state machines, game theory, and economic security.',
      socials: teamSocials('', ''),
    },
    {
      id: 'ian',
      name: 'Ian',
      bio: 'Ian leads protocol implementation. An electrical engineer by training and technical mainstay at Knowable, with hands-on experience in blockchain infrastructure, full-stack development, and cross-chain applications.',
      socials: teamSocials('', ''),
    },
    {
      id: 'cryptodruide',
      name: 'CryptoDruide',
      bio: 'CryptoDruide focuses on strategy, team operations, and community development. A Web3 operator with a background in digital consulting, project management, and entrepreneurship.',
      socials: teamSocials('', ''),
    },
    {
      id: 'diego',
      name: 'Diego',
      bio: 'Diego leads design and Armada’s creative direction. He has worked across crypto and fintech, including work for Aave.',
      socials: teamSocials(
        'https://www.linkedin.com/in/diegoprudencio',
        'https://x.com/diegoprudencio',
      ),
    },
    {
      id: 'ola',
      name: 'Ola',
      bio: 'Ola leads ecosystem growth and marketing strategy. Over the past decade, she has contributed to projects including Status, Cosmos/Tendermint, Fluence, and Epicenter.',
      socials: teamSocials('', ''),
    },
  ] as TeamMember[],
}

export const SUPPORTERS = {
  title: ['Advisors and', 'supporters'],
  body: [
    'Veil advises on economics and market design. A crypto-native tactical unit founded by former Polychain Capital team members, Veil has supported some of the largest projects in the space.',
    'Armada is also supported by cryptographers, Ethereum core community members, past colleagues, fellow builders, and friends from the trenches, advising and contributing in varying capacities.',
  ],
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
