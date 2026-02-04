import { Box, Typography, Stack, Modal, IconButton } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import { UserCoordinates } from '../../../common/types'
import { filterConfigMap, useFilterContext, coordinateKeyToFilterId, getCoordinateDisplayName } from '../filterContext'

interface RecommendationReasonsModalV2Props {
  open: boolean
  onClose: () => void
  courseCoordinates: UserCoordinates
  userCoordinates: UserCoordinates
}

const RecommendationReasonsModalV2 = ({
  open,
  onClose,
  courseCoordinates,
  userCoordinates,
}: RecommendationReasonsModalV2Props) => {
  const { t } = useTranslation()
  const filterContext = useFilterContext()
  const { uiVariant } = filterContext
  
  const hideIncorrect = uiVariant.find(u => u.name === 'recommendation-reasons-incorrect-hidden')?.value === 'true'
  const filterConfig = filterConfigMap(filterContext)

  const getMatchStatus = (key: keyof UserCoordinates) => {
    const userValue = userCoordinates[key]
    const courseValue = courseCoordinates[key]

    if (userValue === null || userValue === undefined) {
      return null // User didn't answer or chose "I don't care"
    }

    
    if(key === 'date'){
      return true
    }
    // For now, a simple equality check. This might need more complex logic
    // depending on how coordinates are compared in the recommender.
    return userValue === courseValue
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2" gutterBottom>
            {t('recommendationReasons:title')}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('recommendationReasons:description')}
        </Typography>

        <Stack spacing={1}>
          {Object.keys(coordinateKeyToFilterId).map((key) => {
            const matchStatus = getMatchStatus(key as keyof UserCoordinates)
            if (matchStatus === null) {
              return null
            }

            // Check if this filter should be hidden in recommendation reasons
            const filterId = coordinateKeyToFilterId[key]
            const filterCfg = filterId ? filterConfig.get(filterId) : null
            const hideInReasons = filterCfg?.hideInRecommendationReasons ?? false
            
            if (hideInReasons) {
              return null
            }

            // Get translated display name from filterContext
            const filterName = getCoordinateDisplayName(key, filterContext, t)
            const isMatch = matchStatus

            if (!isMatch && hideIncorrect) {
              return null
            }

            return (
              <Stack key={key} direction="row" alignItems="center" spacing={1}>
                {isMatch ? (
                  <CheckCircleOutlineIcon color="success" />
                ) : (
                  <CancelOutlinedIcon color="error" />
                )}
                <Typography variant="body1">{filterName}</Typography>
              </Stack>
            )
          })}
        </Stack>
      </Box>
    </Modal>
  )
}

export default RecommendationReasonsModalV2
