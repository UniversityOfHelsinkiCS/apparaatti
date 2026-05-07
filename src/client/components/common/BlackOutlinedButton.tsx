import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

const BlackOutlinedButton = ({ sx, ...props }: ButtonProps) => {
  const sxProp = Array.isArray(sx) ? sx : sx ? [sx] : []

  return (
    <Button
      variant="outlined"
      sx={[
        {
          color: 'black',
          borderColor: 'black',
        },
        ...sxProp,
      ]}
      {...props}
    />
  )
}

export default BlackOutlinedButton
