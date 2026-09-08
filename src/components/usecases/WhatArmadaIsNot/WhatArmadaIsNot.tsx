import { RevealStack } from '@/components/ScrollReveal'
import { Tag } from '@/components/Tag'
import { WHAT_ARMADA_IS_NOT } from '@/constants/useCasesContent'
import styles from './WhatArmadaIsNot.module.css'

/** Clarifying statement — eyebrow + title + body on the gem wash. */
export function WhatArmadaIsNot() {
  return (
    <section
      className={styles.section}
      aria-labelledby="what-armada-is-not-heading"
    >
      <RevealStack className={styles.copy}>
        <Tag
          label={WHAT_ARMADA_IS_NOT.eyebrow}
          dot="lavender"
          className={styles.eyebrow}
        />
        <h2
          id="what-armada-is-not-heading"
          className={`armada-text-title ${styles.title}`}
        >
          {WHAT_ARMADA_IS_NOT.title}
        </h2>
        <p className={`armada-text-body ${styles.body}`}>{WHAT_ARMADA_IS_NOT.body}</p>
      </RevealStack>
    </section>
  )
}
