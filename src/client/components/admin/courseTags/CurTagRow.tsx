import { TableCell, TableRow, Typography } from '@mui/material'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { getDisplayCourseName } from '../../../../common/nameFormatter.ts'
import type { CourseTag, LocalizedString } from '../../../../common/types.ts'
import { stickyFirstCellSx } from './matrixStyles.ts'
import type { TagCellState } from './TagCell.tsx'
import TagCell from './TagCell.tsx'

export interface CurTagRowCourse {
  id: string
  name: LocalizedString
  nameSpecifier: LocalizedString
}

interface CurTagRowProps {
  course: CurTagRowCourse
  tags: CourseTag[]
  tagStates: Map<string, TagCellState>
  onToggle: (curId: string, tagKey: string) => void
}

const CurTagRow = ({ course, tags, tagStates, onToggle }: CurTagRowProps) => {
  const { i18n } = useTranslation()

  return (
    <TableRow hover>
      <TableCell sx={stickyFirstCellSx}>
        <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
          {getDisplayCourseName(course, i18n.language)}
        </Typography>
      </TableCell>
      {tags.map(tag => (
        <TableCell key={tag.key} align="center" sx={{ p: 0.25 }}>
          <TagCell
            rowId={course.id}
            tagKey={tag.key}
            description={tag.description}
            state={tagStates.get(tag.key) ?? 'unset'}
            onToggle={onToggle}
          />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default memo(CurTagRow)
