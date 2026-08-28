import { Box, type BoxProps } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import type { ElementType } from 'react'

export type VisuallyHiddenProps = BoxProps & { component?: ElementType }

const VisuallyHidden = ({ sx, ...props }: VisuallyHiddenProps) => (
  <Box {...props} sx={[visuallyHidden, ...(Array.isArray(sx) ? sx : [sx])]} />
)

export default VisuallyHidden
