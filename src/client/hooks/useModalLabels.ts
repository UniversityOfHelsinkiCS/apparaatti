import { useTranslation } from 'react-i18next'

import type { HyModalLabels } from '../components/common/hy/HyModal'

const useModalLabels = (): HyModalLabels => {
  const { t } = useTranslation()

  return {
    close: t('v2:modal.close'),
    warning: t('v2:modal.warning'),
  }
}

export default useModalLabels
