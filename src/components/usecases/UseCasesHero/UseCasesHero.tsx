import { Button } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import { Tag } from '@/components/Tag'
import { USE_CASES_HERO } from '@/constants/useCasesContent'
import styles from './UseCasesHero.module.css'

type UseCasesHeroProps = {
  /** Hide the “Use cases” eyebrow tag (e.g. slider exploration page). */
  hideEyebrow?: boolean
}

/** Page opener on the gem wash — title + body + CTA under the header. */
export function UseCasesHero({ hideEyebrow = false }: UseCasesHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="use-cases-hero-heading">
      <RevealStack motion="fade" immediate className={`armada-site-stack ${styles.copy}`}>
        {hideEyebrow ? null : (
          <Tag label={USE_CASES_HERO.eyebrow} dot="lavender" className={styles.eyebrow} />
        )}
        <h1 id="use-cases-hero-heading" className={`armada-text-title ${styles.title}`}>
          {USE_CASES_HERO.title.map((line) => (
            <span key={line} className={styles.titleLine}>
              {line}
            </span>
          ))}
        </h1>
        <p className={`armada-text-body ${styles.body}`}>{USE_CASES_HERO.body}</p>
        <div className={styles.ctaRow}>
          <Button
            variant="primary"
            size="lg"
            label={USE_CASES_HERO.cta.label}
            showIcon={false}
            href={USE_CASES_HERO.cta.href}
            {...(USE_CASES_HERO.cta.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          />
        </div>
      </RevealStack>
    </section>
  )
}
