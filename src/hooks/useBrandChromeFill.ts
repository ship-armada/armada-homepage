import { useEffect } from 'react'

/**
 * The HTML files already set background-color and theme-color to the wash-start
 * (#e9c9d5) before any JS runs, so there is no amber flash. This hook's only
 * remaining job is cleanup (restore white surface-bg when the component unmounts,
 * e.g. if the page ever shares a document with a non-marketing view).
 */
const CHROME_FILL_CLASS = 'armada-brand-chrome'

export function useBrandChromeFill() {
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.add(CHROME_FILL_CLASS)
    body.classList.add(CHROME_FILL_CLASS)

    return () => {
      root.classList.remove(CHROME_FILL_CLASS)
      body.classList.remove(CHROME_FILL_CLASS)
    }
  }, [])
}
