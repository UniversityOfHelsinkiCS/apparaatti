import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { defaultVariant } from '../../common/conditionMatching'
import AppMarkdown from '../components/common/AppMarkdown'
import EditableText from '../components/editMode/EditableText'
import { useEditScope } from '../components/editMode/editScope'

interface InfoOnlyFilterComponentProps {
  extraInfo?: string
}

const InfoOnlyFilterComponent = ({ extraInfo }: InfoOnlyFilterComponentProps) => {
  const { t } = useTranslation()
  const scope = useEditScope()

  const content = extraInfo ? (
    <AppMarkdown>{extraInfo}</AppMarkdown>
  ) : (
    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
      {t('question:noExtrainfo')}
    </Typography>
  )

  if (!scope) {
    return <Box sx={{ px: 2 }}>{content}</Box>
  }

  const sharedExtraInfo = defaultVariant(scope.rawFilter?.variants ?? [])?.extraInfo ?? scope.rawFilter?.extraInfo

  const editable = (
    <Box sx={{ px: 2 }}>
      <EditableText
        filterId={scope.filterId}
        field="variantExtraInfo"
        variantName={scope.variantName}
        isFallbackVariant={scope.isFallbackVariant}
        variantQuery={scope.variantQuery}
        filterVariants={scope.rawFilter?.variants ?? []}
        current={scope.rawVariant?.extraInfo ?? sharedExtraInfo}
        filterText={sharedExtraInfo ?? null}
        block
      >
        {content}
      </EditableText>
    </Box>
  )

  return editable
}

export default InfoOnlyFilterComponent
