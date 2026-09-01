import { useTranslation } from 'react-i18next'

const useOpensInNewWindowLabel = (): string => {
  const { t } = useTranslation()

  return t('v2:opensInNewWindow')
}

export default useOpensInNewWindowLabel
