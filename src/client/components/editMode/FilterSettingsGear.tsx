import { Settings } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import HyIconButton from '../common/hy/HyIconButton'
import { useEditScope } from './editScope'
import FilterSettingsDialog from './FilterSettingsDialog'

const FilterSettingsGear = () => {
  const { t } = useTranslation()
  const { isEditMode } = useFilterEditMode()
  const scope = useEditScope()
  const [isOpen, setIsOpen] = useState(false)

  if (!isEditMode || !scope?.rawFilter) {
    return null
  }

  return (
    <>
      <HyIconButton
        onClick={() => setIsOpen(true)}
        aria-label={t('v2:filterSettings.open', { filter: scope.filterId })}
        data-testid={`filter-settings-gear-${scope.filterId}`}
      >
        <Settings />
      </HyIconButton>
      {isOpen && (
        <FilterSettingsDialog
          filter={scope.rawFilter}
          variantName={scope.variantName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default FilterSettingsGear
