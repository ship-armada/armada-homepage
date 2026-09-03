/**
 * Lightweight MPA page transition — fade out on leave, fade in on arrive.
 * Works in all browsers. Skips same-page anchor clicks and external links.
 *
 * Usage: call `initPageTransition()` once in each page entry point.
 */

const FADE_OUT_MS = 180
const FADE_IN_MS  = 280

const isSameOriginPath = (href: string): boolean => {
  try {
    const url = new URL(href, location.href)
    return url.origin === location.origin && !url.hash
  } catch {
    return false
  }
}

/** Apply a CSS-driven fade-in on the document element. */
function fadeIn() {
  const el = document.documentElement
  el.style.opacity = '0'
  el.style.transition = `opacity ${FADE_IN_MS}ms ease`
  // Let the style paint before starting
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1'
      el.addEventListener(
        'transitionend',
        () => {
          el.style.transition = ''
          el.style.opacity = ''
        },
        { once: true },
      )
    })
  })
}

/** Fade out then navigate to `href`. */
function fadeOutThen(href: string) {
  const el = document.documentElement
  el.style.transition = `opacity ${FADE_OUT_MS}ms ease`
  el.style.opacity = '0'
  setTimeout(() => {
    location.assign(href)
  }, FADE_OUT_MS)
}

export function initPageTransition() {
  // Fade in when this page loads
  fadeIn()

  // Intercept internal link clicks
  document.addEventListener('click', (e) => {
    const anchor = (e.target as Element).closest<HTMLAnchorElement>('a[href]')
    if (!anchor) return
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
    if (anchor.target && anchor.target !== '_self') return

    const href = anchor.getAttribute('href') ?? ''
    if (!isSameOriginPath(href)) return

    e.preventDefault()
    fadeOutThen(href)
  })
}
