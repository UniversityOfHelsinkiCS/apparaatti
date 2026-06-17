import { Box } from '@mui/material'

import ActionButtonV2 from './ActionButtonV2'

type FormSubmitActionsProps = {
  submitLabel: string
  cancelLabel: string
  actionGroupAriaLabel: string
  onCancel: () => void
}

const FormSubmitActions = ({ submitLabel, cancelLabel, actionGroupAriaLabel, onCancel }: FormSubmitActionsProps) => {
  return (
    <Box
      role="group"
      aria-label={actionGroupAriaLabel}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'flex-end' }}
    >
      <ActionButtonV2 text={submitLabel} type="submit" />
      <ActionButtonV2 text={cancelLabel} type="button" onClick={onCancel} />
    </Box>
  )
}

export default FormSubmitActions
