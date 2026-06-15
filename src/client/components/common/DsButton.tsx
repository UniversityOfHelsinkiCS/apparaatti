type DsButtonVariant = 'primary' | 'secondary' | 'supplementary'
type DsButtonColour = 'blue' | 'black' | 'white' | 'danger'

interface DsButtonProps {
  text?: string
  onClick?: () => void
  variant?: DsButtonVariant
  colour?: DsButtonColour
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
  dataCy?: string
}

const DsButton = ({
  text = '',
  onClick,
  variant = 'secondary',
  colour,
  type = 'button',
  disabled,
  fullWidth,
  dataCy,
}: DsButtonProps) => {
  return (
    <ds-button
      ds-text={text}
      ds-variant={variant}
      {...(colour ? { 'ds-colour': colour } : {})}
      ds-type={type}
      {...(disabled ? { 'ds-disabled': true } : {})}
      {...(fullWidth ? { 'ds-full-width': true } : {})}
      {...(dataCy ? { 'data-cy': dataCy } : {})}
      onClick={onClick}
    />
  )
}

export default DsButton
