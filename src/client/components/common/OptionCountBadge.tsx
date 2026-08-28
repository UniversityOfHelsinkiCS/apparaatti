import { useTranslation } from 'react-i18next'

import HyBadge from './hy/HyBadge'
import VisuallyHidden from './VisuallyHidden'

export const useOptionCountText = () => {
  const { t } = useTranslation()

  return (count: number) => (count === 0 ? t('v2:filter.noMatches') : t('v2:filter.matchCount', { count }))
}

const OptionCountBadge = ({ count }: { count: number }) => {
  const optionCountText = useOptionCountText()

  return (
    <>
      <HyBadge variant={count === 0 ? 'disabled' : 'default'} ariaHidden>
        {count}
      </HyBadge>
      <VisuallyHidden component="span">{optionCountText(count)}</VisuallyHidden>
    </>
  )
}

export default OptionCountBadge
