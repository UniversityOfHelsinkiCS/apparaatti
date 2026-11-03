import { TableCell, TableRow, Typography } from '@mui/material'
import { memo } from 'react'

import type { CourseTag, CourseUnitGroup } from '../../../../common/types.ts'
import { translateLocalizedString } from '../../../util/i18n.ts'
import { stickyFirstCellSx } from './matrixStyles.ts'
import TagCell from './TagCell.tsx'
import { addedCell, unsetCell } from './tagVersionState.ts'

interface CuTagRowProps {
  group: CourseUnitGroup
  tags: CourseTag[]
  tagKeys: Set<string>
  isEditable: boolean
  onToggle: (courseCode: string, tagKey: string) => void
}

const CuTagRow = ({ group, tags, tagKeys, isEditable, onToggle }: CuTagRowProps) => (
  <TableRow hover>
    <TableCell sx={stickyFirstCellSx}>
      <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
        {group.courseCode} {translateLocalizedString(group.name)}
      </Typography>
    </TableCell>
    <TableCell align="right">{group.realisationCount}</TableCell>
    {tags.map(tag => (
      <TableCell key={tag.key} align="center" sx={{ p: 0.25 }}>
        <TagCell
          rowId={group.courseCode}
          tagKey={tag.key}
          description={tag.description}
          state={tagKeys.has(tag.key) ? addedCell : unsetCell}
          disabled={!isEditable}
          onToggle={onToggle}
        />
      </TableCell>
    ))}
  </TableRow>
)

export default memo(CuTagRow)
