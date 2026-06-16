/// <reference types="vite/client" />

import type { Components } from '@uh-design-system/component-library'

type DsProps<T> = Partial<T> & React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ds-radio-button-group': DsProps<Components.DsRadioButtonGroup>
      'ds-radio-button': DsProps<Components.DsRadioButton>
    }
  }
}
