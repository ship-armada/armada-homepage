import type { ComponentType, SVGProps } from 'react'
import { NewspaperIcon } from '@heroicons/react/24/outline'
import { GitHubIcon } from '@/icons/GitHubIcon'

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>

export type MegaMenuItem = {
  id: string
  title: string
  description: string
  href: string
  external?: boolean
  icon: NavIcon
}

/** Top-level item with a mega-menu panel. */
export type NavMenu = {
  id: string
  label: string
  items: MegaMenuItem[]
}

/** Top-level item that links directly (no dropdown). */
export type NavLink = {
  id: string
  label: string
  href: string
  external?: boolean
}

export type NavItem = NavLink | NavMenu

export function isNavMenu(item: NavItem): item is NavMenu {
  return 'items' in item && Array.isArray(item.items)
}

export type SocialIconName = 'discord' | 'x' | 'github'

export type SocialLink = {
  label: string
  href: string
  icon: SocialIconName
}

/** Shared header + footer social icons. */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Discord', href: 'https://discord.gg/eyD58prEV', icon: 'discord' },
  { label: 'X', href: 'https://x.com/ship_armada', icon: 'x' },
  { label: 'GitHub', href: 'https://github.com/ship-armada', icon: 'github' },
]

/**
 * Footer sitemap: direct nav links + menu children (Blog, GitHub).
 * GitHub also appears as a social icon next to Discord / X.
 */
export function getFooterNavLinks(): NavLink[] {
  return NAV_ITEMS.flatMap((item) => {
    if (isNavMenu(item)) {
      return item.items.map((link) => ({
        id: link.id,
        label: link.title,
        href: link.href,
        ...(link.external ? { external: true as const } : {}),
      }))
    }
    return [item]
  })
}

/**
 * Primary site navigation.
 * Only Resources opens a dropdown; other items are direct links.
 * Header + footer both read from this list.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'use-cases',
    label: 'Use cases',
    href: '#use-cases',
  },
  {
    id: 'developers',
    label: 'Developers',
    href: 'https://docs.armada.blue/',
    external: true,
  },
  {
    id: 'security',
    label: 'Security',
    href: 'https://docs.armada.blue/guide/security',
    external: true,
  },
  {
    id: 'protocol',
    label: 'Protocol',
    href: 'https://docs.armada.blue/',
    external: true,
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      {
        id: 'blog',
        title: 'Blog',
        description: 'News and updates from the team',
        href: 'https://armada.ghost.io',
        external: true,
        icon: NewspaperIcon,
      },
      {
        id: 'github',
        title: 'GitHub',
        description: 'Source code and open repositories',
        href: 'https://github.com/ship-armada',
        external: true,
        icon: GitHubIcon,
      },
    ],
  },
  {
    id: 'about',
    label: 'About',
    href: '#about',
  },
]
