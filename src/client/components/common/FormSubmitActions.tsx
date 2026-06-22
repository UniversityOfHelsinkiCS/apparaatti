import { Box } from '@mui/material'

import ActionButton from './ActionButton'

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
      <ActionButton text={submitLabel} type="submit" />
      <ActionButton text={cancelLabel} type="button" onClick={onCancel} />
    </Box>
  )
}

export default FormSubmitActions
