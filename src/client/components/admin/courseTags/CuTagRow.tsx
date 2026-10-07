import { TableCell, TableRow, Typography } from '@mui/material'
import { memo } from 'react'

import type { CourseTag, CourseUnitGroup } from '../../../../common/types.ts'
import { translateLocalizedString } from '../../../util/i18n.ts'
import { stickyFirstCellSx } from './matrixStyles.ts'
import TagCell from './TagCell.tsx'

interface CuTagRowProps {
  group: CourseUnitGroup
  tags: CourseTag[]
  tagKeys: Set<string>
  onToggle: (courseCode: string, tagKey: string) => void
}

const CuTagRow = ({ group, tags, tagKeys, onToggle }: CuTagRowProps) => (
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
          state={tagKeys.has(tag.key) ? 'added' : 'unset'}
          onToggle={onToggle}
        />
      </TableCell>
    ))}
  </TableRow>
)

export default memo(CuTagRow)
