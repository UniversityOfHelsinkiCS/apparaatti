import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { DsRadioButtonGroupChangeEvent, DsRadioButtonGroupCustomEvent } from '@uh-design-system/component-library'

export type RadioOption = {
  id: string
  label: string
  disabled?: boolean
}

type Props = {
  name: string
  value?: string
  options: RadioOption[]
  onChange: (value: string) => void
  style?: CSSProperties
}

const RadioButtonGroup = ({ name, value, options, onChange, style }: Props) => {
  const groupRef = useRef<HTMLDsRadioButtonGroupElement>(null)

  // Keep a stable ref to onChange so the effect never needs to re-subscribe when the callback changes.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const el = groupRef.current
    if (!el) return
    const handler = (e: DsRadioButtonGroupCustomEvent<DsRadioButtonGroupChangeEvent>) => {
      onChangeRef.current(e.detail.value)
    }
    el.addEventListener('dsChange', handler)
    return () => el.removeEventListener('dsChange', handler)
  }, [])

  return (
    <ds-radio-button-group ref={groupRef} dsName={name} dsValue={value} style={style}>
      {options.map(o => (
        <ds-radio-button
          key={o.id}
          dsValue={o.id}
          dsText={o.label}
          dsDisabled={o.disabled}
          data-cy={`${name}-option-${o.id}`}
        />
      ))}
    </ds-radio-button-group>
  )
}

export default RadioButtonGroup
