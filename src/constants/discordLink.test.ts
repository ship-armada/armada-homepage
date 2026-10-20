// ABOUTME: Tests that every Discord link on the site goes through armada.blue/discord,
// ABOUTME: and that both hosting configs redirect that path to the current Discord invite.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SOCIAL_LINKS } from './siteNav'
import { BUILD_WITH_ARMADA } from './aboutContent'

const DISCORD_LINK = 'https://armada.blue/discord'
const DISCORD_INVITE = 'https://discord.gg/fjWquSpFjb'

const repoRoot = resolve(__dirname, '../..')

type Redirect = Record<string, string>

/** Reads the `[[redirects]]` tables from netlify.toml as flat key/value records. */
function readNetlifyRedirects(): Redirect[] {
  const toml = readFileSync(resolve(repoRoot, 'netlify.toml'), 'utf8')
  return toml
    .split('[[redirects]]')
    .slice(1)
    .map((block) => {
      const redirect: Redirect = {}
      for (const line of block.split('\n')) {
        const match = line.match(/^\s*(\w+)\s*=\s*"?([^"]*)"?\s*$/)
        if (match) redirect[match[1]] = match[2]
      }
      return redirect
    })
}

describe('Discord links', () => {
  it('points the social icon at armada.blue/discord', () => {
    const discord = SOCIAL_LINKS.find((link) => link.icon === 'discord')
    expect(discord?.href).toBe(DISCORD_LINK)
  })

  it('points the About page "Join Discord" button at armada.blue/discord', () => {
    const joinDiscord = BUILD_WITH_ARMADA.ctas.find((cta) => cta.label === 'Join Discord')
    expect(joinDiscord?.href).toBe(DISCORD_LINK)
  })
})

describe('/discord redirect', () => {
  it('is a temporary redirect to the Discord invite on Netlify', () => {
    const redirect = readNetlifyRedirects().find((r) => r.from === '/discord')
    expect(redirect).toEqual({ from: '/discord', to: DISCORD_INVITE, status: '302', force: 'true' })
  })

  it('is a temporary redirect to the Discord invite on Vercel', () => {
    const vercel = JSON.parse(readFileSync(resolve(repoRoot, 'vercel.json'), 'utf8'))
    const redirect = vercel.redirects.find((r: { source: string }) => r.source === '/discord')
    expect(redirect).toEqual({ source: '/discord', destination: DISCORD_INVITE, permanent: false })
  })
})
