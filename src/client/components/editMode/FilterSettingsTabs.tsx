import { Tab, Tabs } from '@mui/material'
import { useTranslation } from 'react-i18next'

type FilterSettingsTabsProps = {
  value: number
  onChange: (value: number) => void
}

const FilterSettingsTabs = ({ value, onChange }: FilterSettingsTabsProps) => {
  const { t } = useTranslation()

  return (
    <Tabs
      value={value}
      onChange={(_event, next) => onChange(next)}
      sx={{
        mb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '& .MuiTab-root': { color: '#374151', fontWeight: 600 },
        '& .MuiTab-root.Mui-selected': { color: '#111827' },
        '& .MuiTab-root:focus-visible': { outline: '2px solid #2563eb', outlineOffset: -2 },
        '& .MuiTabs-indicator': { backgroundColor: '#111827', height: 3 },
      }}
    >
      <Tab label={t('v2:filterSettings.tabs.basic')} data-testid="filter-settings-tab-basic" />
      <Tab label={t('v2:filterSettings.tabs.texts')} data-testid="filter-settings-tab-texts" />
      <Tab label={t('v2:filterSettings.tabs.structure')} data-testid="filter-settings-tab-structure" />
    </Tabs>
  )
}

export default FilterSettingsTabs
