import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { BuildWithArmada } from '@/components/about/BuildWithArmada'
import { UseCasesHero } from '@/components/usecases/UseCasesHero'
import { ShieldedMpcCard } from '@/components/usecases/ShieldedMpcCard'
import { UseCaseList } from '@/components/usecases/UseCaseList'
import { WhatArmadaIsNot } from '@/components/usecases/WhatArmadaIsNot'
import { USE_CASES_BUILD } from '@/constants/useCasesContent'
import { useBrandChromeFill } from '@/hooks/useBrandChromeFill'
import styles from './UseCases.module.css'

/** Default use-cases page — accordion list (01 Title). */
export function UseCases() {
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
        <UseCaseList />
        <WhatArmadaIsNot />
        <BuildWithArmada content={USE_CASES_BUILD} />
      </main>
      <SiteFooter />
    </div>
  )
}
