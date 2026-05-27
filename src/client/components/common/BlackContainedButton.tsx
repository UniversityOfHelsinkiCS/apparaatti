import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

const BlackContainedButton = ({ sx, ...props }: ButtonProps) => {
  const sxProp = Array.isArray(sx) ? sx : sx ? [sx] : []

  return (
    <Button
      variant="contained"
      sx={[
        (theme) => ({
          color: theme.palette.common.white,
          backgroundColor: theme.palette.secondary.main,
        }),
        ...sxProp,
      ]}
      {...props}
    />
  )
}

export default BlackContainedButton
