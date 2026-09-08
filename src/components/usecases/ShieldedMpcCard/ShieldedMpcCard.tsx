import { Button } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import { Tag } from '@/components/Tag'
import { ShieldedMpcDiagram } from '@/components/usecases/ShieldedMpcDiagram'
import { SHIELDED_MPC } from '@/constants/useCasesContent'
import styles from './ShieldedMpcCard.module.css'

/**
 * Homepage-style split feature card for Shielded MPC.
 * Diagram pane runs a sequenced vertical hub animation.
 */
export function ShieldedMpcCard() {
  return (
    <section className={styles.section} aria-labelledby="shielded-mpc-heading">
      <article className={styles.panel}>
        <RevealStack className={styles.copy}>
          <div className={styles.copyTop}>
            <Tag label={SHIELDED_MPC.tag} className={styles.tag} />
            <h2 id="shielded-mpc-heading" className={`armada-text-title ${styles.title}`}>
              {SHIELDED_MPC.title.map((line) => (
                <span key={line} className={styles.titleLine}>
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <div className={styles.copyBottom}>
            <p className={`armada-text-body ${styles.body}`}>{SHIELDED_MPC.body}</p>
            <div className={styles.ctaRow}>
              <Button
                variant="primary"
                size="lg"
                label={SHIELDED_MPC.cta.label}
                showIcon={false}
                href={SHIELDED_MPC.cta.href}
                {...(SHIELDED_MPC.cta.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              />
            </div>
          </div>
        </RevealStack>
        <div
          className={styles.diagram}
          role="img"
          aria-label={SHIELDED_MPC.diagramLabel}
        >
          <ShieldedMpcDiagram />
        </div>
      </article>
    </section>
  )
}
