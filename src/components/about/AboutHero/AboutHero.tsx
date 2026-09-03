import { Button } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import { ABOUT_HERO } from '@/constants/aboutContent'
import styles from './AboutHero.module.css'

/** Page opener on the gem wash — copy sits under the header, not vertically centred. */
export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-hero-heading">
      <RevealStack motion="fade" immediate className={`armada-site-stack ${styles.copy}`}>
        <h1 id="about-hero-heading" className={`armada-text-title ${styles.title}`}>
          {ABOUT_HERO.title.map((line) => (
            <span key={line} className={styles.titleLine}>
              {line}
            </span>
          ))}
        </h1>
        <p className={`armada-text-detail ${styles.body}`}>{ABOUT_HERO.body}</p>
        <div className={styles.ctaRow}>
          <Button
            variant="primary"
            size="lg"
            label={ABOUT_HERO.cta.label}
            showIcon={false}
            href={ABOUT_HERO.cta.href}
          />
        </div>
      </RevealStack>
    </section>
  )
}
