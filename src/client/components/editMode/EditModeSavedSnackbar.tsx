import { Alert, Snackbar } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { useFilterEditMode } from '../../contexts/filterEditModeContext'

/** Confirms that an edited wording was saved to the version. */
const EditModeSavedSnackbar = () => {
  const { t } = useTranslation()
  const { savedField, clearSaved } = useFilterEditMode()

  return (
    <Snackbar
      open={savedField !== null}
      autoHideDuration={3000}
      onClose={clearSaved}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert severity="success" onClose={clearSaved} variant="filled">
        {t('v2:filterWordings.saved', {
          field: savedField ? t(`v2:filterWordings.field.${savedField}`) : '',
        })}
      </Alert>
    </Snackbar>
  )
}

export default EditModeSavedSnackbar
