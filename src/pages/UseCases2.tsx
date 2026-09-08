import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BuildWithArmada } from '@/components/about/BuildWithArmada'
import { UseCasesHero } from '@/components/usecases/UseCasesHero'
import { ShieldedMpcCard } from '@/components/usecases/ShieldedMpcCard'
import { UseCaseSlider } from '@/components/usecases/UseCaseSlider'
import { WhatArmadaIsNot } from '@/components/usecases/WhatArmadaIsNot'
import { USE_CASES_BUILD } from '@/constants/useCasesContent'
import { useBrandChromeFill } from '@/hooks/useBrandChromeFill'
import styles from './UseCases.module.css'

/** Use-cases alt — numbered cards (01–07) in a horizontal slider. */
export function UseCases2() {
  useBrandChromeFill()

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <SiteHeader tone="ink" />
      <main id="main-content" className={styles.main}>
        <UseCasesHero hideEyebrow />
        <ShieldedMpcCard />
        <UseCaseSlider />
        <WhatArmadaIsNot />
        <BuildWithArmada content={USE_CASES_BUILD} />
      </main>
      <SiteFooter />
    </div>
  )
}
