import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface PendingChangesActionsProps {
  editedVersionName: string | null
  isBusy: boolean
  onSaveToVersion: () => void
  onSave: () => void
  onPublish: () => void
}

const PendingChangesActions = ({
  editedVersionName,
  isBusy,
  onSaveToVersion,
  onSave,
  onPublish,
}: PendingChangesActionsProps) => {
  const { t } = useTranslation()

  return (
    <>
      {editedVersionName ? (
        <BlackOutlinedButton type="button" onClick={onSaveToVersion} disabled={isBusy}>
          {t('v2:courseTags.publish.saveToVersion', { name: editedVersionName })}
        </BlackOutlinedButton>
      ) : null}
      <BlackOutlinedButton type="button" onClick={onSave} disabled={isBusy}>
        {editedVersionName ? t('v2:courseTags.publish.saveAsNew') : t('v2:courseTags.publish.saveOnly')}
      </BlackOutlinedButton>
      <BlackOutlinedButton type="button" onClick={onPublish} disabled={isBusy}>
        {t('v2:courseTags.publish.confirmApply')}
      </BlackOutlinedButton>
    </>
  )
}

export default PendingChangesActions
