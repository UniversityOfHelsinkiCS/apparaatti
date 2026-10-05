import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { getDisplayCourseName } from '../../../../common/nameFormatter.ts'
import type { TagPayloadDiff } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import type { DiffCourse } from './courseTagUtils.ts'
import {
  fetchCoursesForLabels,
  fetchCourseTags,
  fetchCourseUnitGroupsForLabels,
  fetchCurTagStates,
} from './courseTagUtils.ts'

interface SnapshotDiffDialogProps {
  diff: TagPayloadDiff | null
  onClose: () => void
  title?: string
  content?: ReactNode
  actions?: ReactNode
}

interface DiffBlock {
  id: string
  heading: string
  before: string[]
  added: string[]
  removed: string[]
}

const addedSx = { backgroundColor: '#dcfce7', color: '#14532d', px: 1, py: 0.25, borderRadius: 0.5 }

const removedSx = { backgroundColor: '#fee2e2', color: '#7f1d1d', px: 1, py: 0.25, borderRadius: 0.5 }

const TagLine = ({ tag, isAdded }: { tag: string; isAdded: boolean }) => (
  <Box sx={{ ...(isAdded ? addedSx : removedSx), alignSelf: 'flex-start' }}>
    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
      {isAdded ? '+' : '−'} {tag}
    </Typography>
  </Box>
)

const DiffBlockSection = ({ title, blocks }: { title: string; blocks: DiffBlock[] }) => {
  const { t } = useTranslation()

  if (blocks.length === 0) return null

  return (
    <Stack spacing={2}>
      <Typography fontWeight="bold">{title}</Typography>
      {blocks.map(block => (
        <Stack key={block.id} spacing={0.5} sx={{ borderLeft: '3px solid #d1d5db', pl: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {block.heading}
          </Typography>
          <Typography variant="body2" sx={{ color: '#4b5563' }}>
            {t('v2:courseTags.snapshots.diffBefore', {
              tags: block.before.length > 0 ? block.before.join(', ') : t('v2:courseTags.snapshots.diffNoTags'),
            })}
          </Typography>
          {block.removed.map(tag => (
            <TagLine key={`removed-${tag}`} tag={tag} isAdded={false} />
          ))}
          {block.added.map(tag => (
            <TagLine key={`added-${tag}`} tag={tag} isAdded />
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

const TagListSection = ({ title, added, removed }: { title: string; added: string[]; removed: string[] }) => {
  if (added.length === 0 && removed.length === 0) return null

  return (
    <Stack spacing={0.5}>
      <Typography fontWeight="bold">{title}</Typography>
      {removed.map(tag => (
        <TagLine key={`removed-${tag}`} tag={tag} isAdded={false} />
      ))}
      {added.map(tag => (
        <TagLine key={`added-${tag}`} tag={tag} isAdded />
      ))}
    </Stack>
  )
}

const SnapshotDiffDialog = ({ diff, onClose, title, content, actions }: SnapshotDiffDialogProps) => {
  const { t, i18n } = useTranslation()

  const curIds = [...new Set([...(diff?.addedCurTags ?? []), ...(diff?.removedCurTags ?? [])].map(row => row.curId))]

  const { data: courses, isLoading } = useQuery({
    queryKey: ['course-tag-diff-courses'],
    queryFn: fetchCoursesForLabels,
    enabled: diff !== null,
  })

  const { data: groups } = useQuery({
    queryKey: ['course-tag-diff-cu-groups'],
    queryFn: fetchCourseUnitGroupsForLabels,
    enabled: diff !== null,
  })

  const { data: curStates } = useQuery({
    queryKey: ['course-tag-states', curIds.join(',')],
    queryFn: () => fetchCurTagStates(curIds),
    enabled: diff !== null && curIds.length > 0,
  })

  const { data: tags } = useQuery({ queryKey: ['course-tags'], queryFn: fetchCourseTags, enabled: diff !== null })

  const courseByCuId = new Map<string, DiffCourse>()
  const courseByCurId = new Map<string, DiffCourse>()
  for (const course of courses ?? []) {
    courseByCurId.set(course.id, course)
    for (const cu of course.Cus ?? []) {
      courseByCuId.set(cu.id, course)
    }
  }

  const tagLabel = (tagKey: string) => tags?.find(tag => tag.key === tagKey)?.description || tagKey

  const courseCodeOf = (course: DiffCourse | undefined) => course?.Cus?.[0]?.courseCode ?? ''

  const courseHeading = (course: DiffCourse | undefined, fallbackId: string) => {
    if (!course) return `${t('v2:courseTags.snapshots.diffUnknownCourse')} (${fallbackId})`
    return `${courseCodeOf(course)} ${getDisplayCourseName(course, i18n.language) ?? ''}`.trim()
  }

  const beforeTags = (current: string[], added: string[], removed: string[]) =>
    [...new Set([...current.filter(tag => !added.includes(tag)), ...removed])].sort()

  const courseBlocks = (): DiffBlock[] => {
    const byCode = new Map<string, { added: string[]; removed: string[]; heading: string }>()

    const collect = (cuId: string, tagKey: string, side: 'added' | 'removed') => {
      const course = courseByCuId.get(cuId)
      const code = courseCodeOf(course) || cuId
      const entry = byCode.get(code) ?? { added: [], removed: [], heading: courseHeading(course, cuId) }
      entry[side].push(tagLabel(tagKey))
      byCode.set(code, entry)
    }

    for (const row of diff?.addedCuTags ?? []) collect(row.cuId, row.tagKey, 'added')
    for (const row of diff?.removedCuTags ?? []) collect(row.cuId, row.tagKey, 'removed')

    return [...byCode.entries()].map(([code, entry]) => ({
      id: code,
      heading: entry.heading,
      before: beforeTags(
        (groups ?? []).find(group => group.courseCode === code)?.tagKeys.map(tagLabel) ?? [],
        entry.added,
        entry.removed
      ),
      added: [...new Set(entry.added)].sort(),
      removed: [...new Set(entry.removed)].sort(),
    }))
  }

  const realisationBlocks = (): DiffBlock[] => {
    const byCur = new Map<string, { added: string[]; removed: string[] }>()

    const collect = (curId: string, tagKey: string, mode: string, side: 'added' | 'removed') => {
      const becomesVisible = (side === 'added') === (mode === 'add')
      const entry = byCur.get(curId) ?? { added: [], removed: [] }
      entry[becomesVisible ? 'added' : 'removed'].push(tagLabel(tagKey))
      byCur.set(curId, entry)
    }

    for (const row of diff?.addedCurTags ?? []) collect(row.curId, row.tagKey, row.mode, 'added')
    for (const row of diff?.removedCurTags ?? []) collect(row.curId, row.tagKey, row.mode, 'removed')

    return [...byCur.entries()].map(([curId, entry]) => {
      const course = courseByCurId.get(curId)
      const starts = course?.startDate ? new Date(course.startDate).toLocaleDateString(i18n.language) : ''
      const current =
        curStates
          ?.find(state => state.curId === curId)
          ?.tags.filter(tag => tag.source !== 'ignored')
          .map(tag => tagLabel(tag.key)) ?? []

      return {
        id: curId,
        heading: starts ? `${courseHeading(course, curId)} (${starts})` : courseHeading(course, curId),
        before: beforeTags(current, entry.added, entry.removed),
        added: [...new Set(entry.added)].sort(),
        removed: [...new Set(entry.removed)].sort(),
      }
    })
  }

  const isUnchanged =
    diff !== null &&
    diff.addedTags.length === 0 &&
    diff.removedTags.length === 0 &&
    diff.addedCuTags.length === 0 &&
    diff.removedCuTags.length === 0 &&
    diff.addedCurTags.length === 0 &&
    diff.removedCurTags.length === 0

  return (
    <Dialog open={diff !== null} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title ?? t('v2:courseTags.snapshots.diffTitle')}</DialogTitle>
      <DialogContent>
        {diff === null || isUnchanged ? (
          <Typography>{t('v2:courseTags.snapshots.diffUnchanged')}</Typography>
        ) : (
          <Stack spacing={3}>
            {content}
            {isLoading ? <Typography>{t('v2:courseTags.snapshots.diffLoading')}</Typography> : null}
            <TagListSection
              title={t('v2:courseTags.snapshots.diffVocabularyChanges')}
              added={diff.addedTags.map(tagLabel)}
              removed={diff.removedTags.map(tagLabel)}
            />
            <DiffBlockSection title={t('v2:courseTags.snapshots.diffCourseChanges')} blocks={courseBlocks()} />
            <DiffBlockSection
              title={t('v2:courseTags.snapshots.diffRealisationChanges')}
              blocks={realisationBlocks()}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose}>
          {t('v2:courseTags.close')}
        </BlackOutlinedButton>
        {actions}
      </DialogActions>
    </Dialog>
  )
}

export default SnapshotDiffDialog
