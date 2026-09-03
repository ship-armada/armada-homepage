import { RevealStack } from '@/components/ScrollReveal'
import { FLEET } from '@/constants/aboutContent'
import { FleetRadar } from './FleetRadar'
import styles from './FleetPanel.module.css'

/** Split card on the lavender surface — copy left, sonar plot right. */
export function FleetPanel() {
  return (
    <section className={styles.section} aria-labelledby="fleet-heading">
      <article className={styles.panel}>
        <RevealStack className={styles.content}>
          <h2 id="fleet-heading" className={`armada-text-title ${styles.title}`}>
            {FLEET.title.map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={`armada-text-body ${styles.body}`}>{FLEET.body}</p>
        </RevealStack>

        <div className={styles.diagram}>
          <FleetRadar />
        </div>
      </article>
    </section>
  )
}
