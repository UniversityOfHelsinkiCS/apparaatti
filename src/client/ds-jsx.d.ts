/**
 * TypeScript JSX type augmentation for the UH Design System web component library.
 * Allows ds-* custom elements to be used in React JSX.
 * React 19 natively supports web components; events are bound as ondsEventName={handler}.
 */

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // Allow any ds-* element with any props (kebab-case attrs + onds… event handlers)
      [tag: `ds-${string}`]: any
    }
  }
}

export {}
