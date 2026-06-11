import { Typography } from '@mui/material'
import useApi from '../../util/useApi'

const VersionBadge = () => {
  const { data: versionData } = useApi<{
    gitSha: string
    packageVersion: string
    imageSha?: string
    releaseVersion?: string
  }>('version', '/api/version', 'GET')

  if (!versionData) return null

  const releaseVersion = versionData.releaseVersion || versionData.packageVersion || 'unknown'
  const imageSha = versionData.imageSha || versionData.gitSha || 'unknown'

  return (
    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
      Release {releaseVersion} (image {imageSha})
    </Typography>
  )
}

export default VersionBadge
