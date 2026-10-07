import { Tab, Tabs } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface CourseTagsTabsProps {
  value: number
  onChange: (value: number) => void
}

const CourseTagsTabs = ({ value, onChange }: CourseTagsTabsProps) => {
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
      <Tab label={t('v2:courseTags.tabs.realisations')} />
      <Tab label={t('v2:courseTags.tabs.courseUnits')} />
      <Tab label={t('v2:courseTags.tabs.vocabulary')} />
      <Tab label={t('v2:courseTags.tabs.snapshots')} />
    </Tabs>
  )
}

export default CourseTagsTabs
