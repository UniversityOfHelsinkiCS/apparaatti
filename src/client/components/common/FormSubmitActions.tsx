import { Box, Button } from '@mui/material'
import BlackOutlinedButton from './BlackOutlinedButton'

type FormSubmitActionsProps = {
  submitLabel: string
  cancelLabel: string
  onCancel: () => void
}

const FormSubmitActions = ({ submitLabel, cancelLabel, onCancel }: FormSubmitActionsProps) => {
  return (
    <Box>
      <Button variant="contained" color="primary" type="submit" sx={{ mr: 1 }}>
        {submitLabel}
      </Button>
      <BlackOutlinedButton type="button" onClick={onCancel}>
        {cancelLabel}
      </BlackOutlinedButton>
    </Box>
  )
}

export default FormSubmitActions
