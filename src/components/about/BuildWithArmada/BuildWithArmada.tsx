import { Button } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import { BUILD_WITH_ARMADA } from '@/constants/aboutContent'
import styles from './BuildWithArmada.module.css'

export type BuildWithArmadaCta = {
  label: string
  href: string
  external?: boolean
  variant: 'primary' | 'secondary'
}

export type BuildWithArmadaContent = {
  title: string[]
  body: string
  ctas: BuildWithArmadaCta[]
}

type BuildWithArmadaProps = {
  /** Defaults to About-page copy when omitted. */
  content?: BuildWithArmadaContent
}

/** Closing CTA card — centered content on the gem-gradient wash. */
export function BuildWithArmada({ content = BUILD_WITH_ARMADA }: BuildWithArmadaProps) {
  return (
    <section className={styles.section} aria-labelledby="build-heading">
      <article className={styles.card}>
        <RevealStack className={styles.copy}>
          <h2 id="build-heading" className={`armada-text-title ${styles.title}`}>
            {content.title.map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={`armada-text-body ${styles.body}`}>{content.body}</p>
          <div className={styles.ctaRow}>
            {content.ctas.map((cta) => (
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
