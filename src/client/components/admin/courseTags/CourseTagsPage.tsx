import { Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CurTagMutation, TagBase, TagVocabMutation } from '../../../../common/types.ts'
import { useAdminUser } from '../AdminMain.tsx'
import AdminNavbar from '../AdminNavbar.tsx'
import CourseTagsTabs from './CourseTagsTabs.tsx'
import type { CurTagMutationMode } from './courseTagUtils.ts'
import { fetchCourseTags, fetchSnapshots } from './courseTagUtils.ts'
import CurTagMatrix from './CurTagMatrix.tsx'
import CuTagTab from './CuTagTab.tsx'
import EditedSnapshotSelect from './EditedSnapshotSelect.tsx'
import PendingChangesBar from './PendingChangesBar.tsx'
import SnapshotsTab from './SnapshotsTab.tsx'
import type { TagDraft } from './tagDraftBuffer.ts'
import {
  clearStoredDraft,
  draftSize,
  emptyDraft,
  mergedVocabulary,
  readDraft,
  storeDraft,
  withCuMutation,
  withCurMutations,
  withTagMutation,
} from './tagDraftBuffer.ts'
import TagVocabularyTab from './TagVocabularyTab.tsx'

const CourseTagsPage = () => {
  const { t } = useTranslation()
  const user = useAdminUser()
  const [tab, setTab] = useState(0)
  const [draft, setDraft] = useState<TagDraft>(readDraft)

  const { data: tags } = useQuery({ queryKey: ['course-tags'], queryFn: fetchCourseTags })
  const { data: snapshots } = useQuery({ queryKey: ['course-tag-snapshots'], queryFn: fetchSnapshots })

  const resetDraft = useCallback(
    (base: TagBase) => {
      clearStoredDraft()
      setDraft(emptyDraft(base))
    },
    [setDraft]
  )

  const handleBaseChange = (base: TagBase) => {
    if (draftSize(draft) > 0 && !window.confirm(t('v2:courseTags.editing.switchConfirm'))) return
    resetDraft(base)
  }

  const handleCurToggle = useCallback(
    (curId: string, tagKey: string, mode: CurTagMutationMode) => {
      setDraft(current => {
        const next = withCurMutations(current, [{ curId, tagKey, mode }])
        storeDraft(next)
        return next
      })
    },
    [setDraft]
  )

  const handleBulkApply = useCallback(
    (curIds: string[], tagKeys: string[], mode: CurTagMutationMode) => {
      const entries: CurTagMutation[] = curIds.flatMap(curId => tagKeys.map(tagKey => ({ curId, tagKey, mode })))
      setDraft(current => {
        const next = withCurMutations(current, entries)
        storeDraft(next)
        return next
      })
    },
    [setDraft]
  )

  const handleCuToggle = useCallback(
    (courseCode: string, cuIds: string[], tagKey: string, present: boolean) => {
      setDraft(current => {
        const next = withCuMutation(current, { courseCode, cuIds, tagKey, present })
        storeDraft(next)
        return next
      })
    },
    [setDraft]
  )

  const handleTagMutation = useCallback(
    (mutation: TagVocabMutation) => {
      setDraft(current => {
        const next = withTagMutation(current, mutation)
        storeDraft(next)
        return next
      })
    },
    [setDraft]
  )

  const courseTags = useMemo(() => mergedVocabulary(tags ?? [], draft.mutations), [tags, draft.mutations])

  return (
    <Box>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />

      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('v2:courseTags.title')}
      </Typography>

      <EditedSnapshotSelect snapshots={snapshots ?? []} base={draft.base} onChange={handleBaseChange} />

      <PendingChangesBar
        draft={draft}
        onSaved={() => resetDraft(draft.base)}
        onDiscard={() => resetDraft(draft.base)}
      />

      <CourseTagsTabs value={tab} onChange={setTab} />

      {tab === 0 ? (
        <CurTagMatrix
          tags={courseTags}
          base={draft.base}
          mutations={draft.mutations}
          onCurToggle={handleCurToggle}
          onBulkApply={handleBulkApply}
        />
      ) : null}
      {tab === 1 ? (
        <CuTagTab tags={courseTags} base={draft.base} mutations={draft.mutations} onCuToggle={handleCuToggle} />
      ) : null}
      {tab === 2 ? (
        <TagVocabularyTab tags={courseTags} isSuperuser={user.isSuperuser === true} onTagMutation={handleTagMutation} />
      ) : null}
      {tab === 3 ? (
        <SnapshotsTab
          isSuperuser={user.isSuperuser === true}
          base={draft.base}
          onEditBase={base => handleBaseChange(base)}
        />
      ) : null}
    </Box>
  )
}

export default CourseTagsPage
