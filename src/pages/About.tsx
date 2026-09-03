import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AboutHero } from '@/components/about/AboutHero'
import { RoadmapCard } from '@/components/about/RoadmapCard'
import { FleetPanel } from '@/components/about/FleetPanel'
import { CoreTeam } from '@/components/about/CoreTeam'
import { Supporters } from '@/components/about/Supporters'
import { BuildWithArmada } from '@/components/about/BuildWithArmada'
import { useBrandChromeFill } from '@/hooks/useBrandChromeFill'
import styles from './About.module.css'

export function About() {
  useBrandChromeFill()

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      {/* Opens on the light gem wash, not the hero photo — dark chrome keeps AA. */}
      <SiteHeader tone="ink" />
      <main id="main-content" className={styles.main}>
        <div className={styles.topBand}>
          <AboutHero />
          <RoadmapCard />
        </div>
        <FleetPanel />
        <CoreTeam />
        <Supporters />
        <BuildWithArmada />
      </main>
      <SiteFooter />
    </div>
  )
}
