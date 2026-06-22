import { SxProps } from '@mui/material'

export const mergeSx = (...args: (SxProps | undefined)[]): SxProps =>
  args.flatMap(sx => (Array.isArray(sx) ? sx : [sx]))
