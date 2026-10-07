import { Box, TableCell, Tooltip } from '@mui/material'

import type { CourseTag } from '../../../../common/types.ts'
import { stickyHeaderCellSx, verticalHeaderLabelSx } from './matrixStyles.ts'

const TagHeaderCell = ({ tag }: { tag: CourseTag }) => (
  <TableCell align="center" sx={stickyHeaderCellSx}>
    <Tooltip title={tag.description ?? tag.key} disableInteractive>
      <Box component="span" sx={verticalHeaderLabelSx}>
        {tag.key}
      </Box>
    </Tooltip>
  </TableCell>
)

export default TagHeaderCell
