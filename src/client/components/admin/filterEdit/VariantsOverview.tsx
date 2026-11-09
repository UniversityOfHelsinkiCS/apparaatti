import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isCatchAll } from '../../../../common/conditionMatching.ts'
import type { FilterConfig } from '../../../../common/types.ts'

interface VariantsOverviewProps {
  filters: FilterConfig[]
  onEditFilter: (filter: FilterConfig) => void
}

const VariantsOverview = ({ filters, onEditFilter }: VariantsOverviewProps) => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const anyLabel = t('v2:admin.backendLocales.anyValue')

  const conditionLabel = (value: string | null) => (value === null ? anyLabel : value)

  return (
    <Box sx={{ mt: 4 }}>
      <Button size="small" onClick={() => setShow(current => !current)} sx={{ color: 'black' }}>
        {show ? t('v2:admin.filterEdit.overviewHide') : t('v2:admin.filterEdit.overviewShow')}
      </Button>

      {show && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('v2:admin.filterEdit.overviewTitle')}
          </Typography>

          {filters.length === 0 ? (
            <Typography variant="body2">{t('v2:admin.filterEdit.overviewEmpty')}</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>{t('v2:admin.filterConfig.table.id')}</TableCell>
                  <TableCell>{t('v2:admin.filterConfig.table.shortNameFi')}</TableCell>
                  <TableCell>{t('v2:admin.filterEdit.variantsColumn')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filters.map(filter => {
                  const hasCatchAll = filter.variants.some(isCatchAll)

                  return (
                    <Fragment key={filter.id}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedId(current => (current === filter.id ? null : filter.id))}
                          >
                            {expandedId === filter.id ? <ChevronUp /> : <ChevronDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{filter.id}</TableCell>
                        <TableCell>{filter.shortName.fi}</TableCell>
                        <TableCell>
                          {filter.variants.length}
                          {!hasCatchAll && (
                            <Chip
                              size="small"
                              sx={{ ml: 1, backgroundColor: '#fff4e5', color: '#663c00' }}
                              label={t('v2:admin.filterEdit.noCatchAllWarning')}
                            />
                          )}
                        </TableCell>
                      </TableRow>

                      {expandedId === filter.id && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>{t('v2:admin.backendLocales.organisation')}</TableCell>
                                  <TableCell>{t('v2:admin.backendLocales.lang')}</TableCell>
                                  <TableCell>{t('v2:admin.backendLocales.primaryLanguage')}</TableCell>
                                  <TableCell>{t('v2:admin.backendLocales.specification')}</TableCell>
                                  <TableCell>{t('v2:admin.filterEdit.questionText')}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filter.variants.map((variant, vIdx) => (
                                  <TableRow key={vIdx}>
                                    <TableCell>{conditionLabel(variant.organisationCode)}</TableCell>
                                    <TableCell>{conditionLabel(variant.lang)}</TableCell>
                                    <TableCell>{conditionLabel(variant.primaryLanguage)}</TableCell>
                                    <TableCell>{conditionLabel(variant.primaryLanguageSpecification)}</TableCell>
                                    <TableCell>{variant.question.fi.slice(0, 80)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <Button size="small" sx={{ color: 'black', mt: 1 }} onClick={() => onEditFilter(filter)}>
                              {t('v2:admin.filterConfig.edit')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Box>
  )
}

export default VariantsOverview
