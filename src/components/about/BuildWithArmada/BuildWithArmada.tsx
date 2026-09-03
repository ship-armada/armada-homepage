import { Button } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import { BUILD_WITH_ARMADA } from '@/constants/aboutContent'
import styles from './BuildWithArmada.module.css'

/** Closing CTA card — centered content on the gem-gradient wash. */
export function BuildWithArmada() {
  return (
    <section className={styles.section} aria-labelledby="build-heading">
      <article className={styles.card}>
        <RevealStack className={styles.copy}>
          <h2 id="build-heading" className={`armada-text-title ${styles.title}`}>
            {BUILD_WITH_ARMADA.title.map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={`armada-text-body ${styles.body}`}>{BUILD_WITH_ARMADA.body}</p>
          <div className={styles.ctaRow}>
            {BUILD_WITH_ARMADA.ctas.map((cta) => (
              <Button
                key={cta.label}
                variant={cta.variant}
                size="lg"
                label={cta.label}
                showIcon={false}
                href={cta.href}
                {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              />
            ))}
          </div>
        </RevealStack>
      </article>
    </section>
  )
}
