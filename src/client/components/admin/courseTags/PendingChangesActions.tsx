import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import type { EditedSnapshot } from './courseTagUtils.ts'

interface PendingChangesActionsProps {
  editedSnapshot: EditedSnapshot | null
  isBusy: boolean
  onSaveToVersion: () => void
  onSave: () => void
  onPublish: () => void
}

const PendingChangesActions = ({
  editedSnapshot,
  isBusy,
  onSaveToVersion,
  onSave,
  onPublish,
}: PendingChangesActionsProps) => {
  const { t } = useTranslation()

  return (
    <>
      {editedSnapshot ? (
        <BlackOutlinedButton type="button" onClick={onSaveToVersion} disabled={isBusy}>
          {t('v2:courseTags.publish.saveToVersion', { name: editedSnapshot.name })}
        </BlackOutlinedButton>
      ) : null}
      <BlackOutlinedButton type="button" onClick={onSave} disabled={isBusy}>
        {editedSnapshot ? t('v2:courseTags.publish.saveAsNew') : t('v2:courseTags.publish.saveOnly')}
      </BlackOutlinedButton>
      <BlackOutlinedButton type="button" onClick={onPublish} disabled={isBusy}>
        {t('v2:courseTags.publish.confirmApply')}
      </BlackOutlinedButton>
    </>
  )
}

export default PendingChangesActions
