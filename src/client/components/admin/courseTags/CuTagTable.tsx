import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CourseTag, CourseUnitGroup } from '../../../../common/types.ts'
import CuTagRow from './CuTagRow.tsx'
import { matrixContainerSx, stickyCornerCellSx, stickyHeaderCellSx } from './matrixStyles.ts'
import TagHeaderCell from './TagHeaderCell.tsx'

interface CuTagTableProps {
  groups: CourseUnitGroup[]
  tags: CourseTag[]
  tagKeysByCourseCode: Map<string, Set<string>>
  onToggle: (courseCode: string, tagKey: string) => void
}

const emptyTagKeys = new Set<string>()

const CuTagTable = ({ groups, tags, tagKeysByCourseCode, onToggle }: CuTagTableProps) => {
  const { t } = useTranslation()

  return (
    <TableContainer sx={matrixContainerSx}>
      <Table size="small" stickyHeader sx={{ width: 'auto' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={stickyCornerCellSx}>{t('v2:courseTags.cu.courseUnit')}</TableCell>
            <TableCell align="right" sx={stickyHeaderCellSx}>
              {t('v2:courseTags.cu.realisations')}
            </TableCell>
            {tags.map(tag => (
              <TagHeaderCell key={tag.key} tag={tag} />
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map(group => (
            <CuTagRow
              key={group.courseCode}
              group={group}
              tags={tags}
              tagKeys={tagKeysByCourseCode.get(group.courseCode) ?? emptyTagKeys}
              onToggle={onToggle}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CuTagTable
