import { useEffect, useRef } from 'react'
import type { DsCheckboxChangeEvent, DsCheckboxCustomEvent } from '@uh-design-system/component-library'

export type CheckboxOption = {
  id: string
  label: string
  checked: boolean
  disabled?: boolean
}

type Props = {
  name: string
  options: CheckboxOption[]
  onChange: (value: string, checked: boolean) => void
}

const CheckboxGroup = ({ name, options, onChange }: Props) => {
  const groupRef = useRef<HTMLDsCheckboxGroupElement>(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const el = groupRef.current
    if (!el) return
    const handler = (e: Event) => {
      const { value, checked } = (e as DsCheckboxCustomEvent<DsCheckboxChangeEvent>).detail
      onChangeRef.current(value, checked)
    }
    el.addEventListener('dsChange', handler)
    return () => el.removeEventListener('dsChange', handler)
  }, [])

  return (
    <ds-checkbox-group ref={groupRef} dsName={name}>
      {options.map(o => (
        <ds-checkbox
          key={o.id}
          dsValue={o.id}
          dsText={o.label}
          dsChecked={o.checked}
          dsDisabled={o.disabled}
          data-cy={`${name}-option-${o.id}`}
        />
      ))}
    </ds-checkbox-group>
  )
}

export default CheckboxGroup
