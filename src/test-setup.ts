// ABOUTME: Vitest setup — registers @testing-library/jest-dom matchers and polyfills matchMedia.
// ABOUTME: Loaded automatically via vitest.config.ts → test.setupFiles.

import '@testing-library/jest-dom/vitest'

// jsdom does not implement matchMedia; motion-aware components read it.
// Report reduced motion so fades, rolls, and confetti resolve synchronously under test.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

