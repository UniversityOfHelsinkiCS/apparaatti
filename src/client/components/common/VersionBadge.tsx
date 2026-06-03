import { Typography } from '@mui/material'
import useApi from '../../util/useApi'

const VersionBadge = () => {
  const { data: versionData } = useApi('version', '/api/version', 'GET', null) as {
    data: { gitSha: string; packageVersion: string } | null
  }

  if (!versionData) return null

  return (
    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
      v{versionData.packageVersion} ({versionData.gitSha})
    </Typography>
  )
}

export default VersionBadge
