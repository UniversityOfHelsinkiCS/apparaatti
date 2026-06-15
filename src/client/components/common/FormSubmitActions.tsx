import { Box } from '@mui/material'
import DsButton from './DsButton'

type FormSubmitActionsProps = {
  submitLabel: string
  cancelLabel: string
  actionGroupAriaLabel: string
  onSubmit: () => void
  onCancel: () => void
}

const FormSubmitActions = ({ submitLabel, cancelLabel, actionGroupAriaLabel, onSubmit, onCancel }: FormSubmitActionsProps) => {
  return (
    <Box
      role="group"
      aria-label={actionGroupAriaLabel}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'flex-end' }}
    >
      <DsButton text={submitLabel} variant="primary" onClick={onSubmit} />
      <DsButton text={cancelLabel} variant="secondary" onClick={onCancel} />
    </Box>
  )
}

export default FormSubmitActions
