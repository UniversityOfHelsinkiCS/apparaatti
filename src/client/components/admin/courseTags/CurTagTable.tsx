import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CourseTag } from '../../../../common/types.ts'
import type { CurTagRowCourse } from './CurTagRow.tsx'
import CurTagRow from './CurTagRow.tsx'
import { matrixContainerSx, stickyCornerCellSx } from './matrixStyles.ts'
import type { TagCellState } from './TagCell.tsx'
import TagHeaderCell from './TagHeaderCell.tsx'

interface CurTagTableProps {
  courses: CurTagRowCourse[]
  tags: CourseTag[]
  stateByCur: Map<string, Map<string, TagCellState>>
  isEditable: boolean
  onToggle: (curId: string, tagKey: string) => void
}

const emptyTagStates = new Map<string, TagCellState>()

const CurTagTable = ({ courses, tags, stateByCur, isEditable, onToggle }: CurTagTableProps) => {
  const { t } = useTranslation()

  return (
    <TableContainer sx={matrixContainerSx}>
      <Table size="small" stickyHeader sx={{ width: 'auto' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={stickyCornerCellSx}>{t('v2:courseTags.course')}</TableCell>
            {tags.map(tag => (
              <TagHeaderCell key={tag.key} tag={tag} />
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.map(course => (
            <CurTagRow
              key={course.id}
              course={course}
              tags={tags}
              tagStates={stateByCur.get(course.id) ?? emptyTagStates}
              isEditable={isEditable}
              onToggle={onToggle}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CurTagTable
