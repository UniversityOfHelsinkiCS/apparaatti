import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface PendingChangesActionsProps {
  isBusy: boolean
  onSave: () => void
  onPublish: () => void
}

const PendingChangesActions = ({ isBusy, onSave, onPublish }: PendingChangesActionsProps) => {
  const { t } = useTranslation()

  return (
    <>
      <BlackOutlinedButton type="button" onClick={onSave} disabled={isBusy}>
        {t('v2:courseTags.publish.saveOnly')}
      </BlackOutlinedButton>
      <BlackOutlinedButton type="button" onClick={onPublish} disabled={isBusy}>
        {t('v2:courseTags.publish.confirmApply')}
      </BlackOutlinedButton>
    </>
  )
}

export default PendingChangesActions
