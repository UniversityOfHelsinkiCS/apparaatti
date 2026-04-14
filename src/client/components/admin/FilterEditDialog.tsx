import { useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { FilterConfig, FilterOption, FilterVariant } from '../../../common/types.ts'

interface Props {
  filter: FilterConfig | null // null = create mode
  onClose: () => void
  onSaved: () => void
}

const FILTER_TYPES = [
  'multi',
  'language',
  'primary-language',
  'primary-language-specification',
  'previusly-done-lang',
  'study-place',
  'studyphase',
  'period-date',
]

const DISPLAY_TYPES = ['radio', 'dropdownselect', 'multichoice', 'singlechoice']

const adminFetch = (method: string, path: string, body?: unknown) =>
  fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

const blankLocalized = () => ({ fi: '', sv: '', en: '' })

const blankFilter = (): FilterConfig => ({
  id: '',
  effects: '',
  mandatory: false,
  type: 'multi',
  shortName: blankLocalized(),
  explanation: blankLocalized(),
  extraInfo: blankLocalized(),
  parentFilterId: null,
  displayOrder: 0,
  displayType: null,
  superToggle: false,
  hideInCurrentFiltersDisplay: false,
  hideInRecommendationReasons: false,
  hideInFilterSidebar: false,
  showInWelcomeModal: false,
  isStrictByDefault: false,
  enabled: true,
  variants: [{ name: 'default', question: blankLocalized(), options: [] }],
})

const normalizeDraft = (f: FilterConfig): FilterConfig => ({
  ...f,
  explanation: f.explanation ?? blankLocalized(),
  extraInfo: f.extraInfo ?? blankLocalized(),
  variants: (f.variants ?? []).map((v) => ({
    ...v,
    options: v.options ?? [],
  })),
})

const toNullIfEmpty = (loc: { fi: string; sv: string; en: string } | null | undefined) => {
  if (!loc) return null
  if (!loc.fi && !loc.sv && !loc.en) return null
  return loc
}

const FilterEditDialog = ({ filter, onClose, onSaved }: Props) => {
  const isCreate = filter === null
  const [draft, setDraft] = useState<FilterConfig>(() =>
    isCreate ? blankFilter() : normalizeDraft(filter)
  )
  const [tab, setTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patch = (fields: Partial<FilterConfig>) =>
    setDraft((prev) => ({ ...prev, ...fields }))

  const patchShortName = (lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => ({ ...prev, shortName: { ...prev.shortName, [lang]: val } }))

  const patchExplanation = (lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => ({
      ...prev,
      explanation: { ...(prev.explanation ?? blankLocalized()), [lang]: val },
    }))

  const patchExtraInfo = (lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => ({
      ...prev,
      extraInfo: { ...(prev.extraInfo ?? blankLocalized()), [lang]: val },
    }))

  const patchVariant = (vIdx: number, fields: Partial<FilterVariant>) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      variants[vIdx] = { ...variants[vIdx], ...fields }
      return { ...prev, variants }
    })

  const patchVariantQuestion = (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      variants[vIdx] = {
        ...variants[vIdx],
        question: { ...variants[vIdx].question, [lang]: val },
      }
      return { ...prev, variants }
    })

  const patchVariantExplanation = (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const v = variants[vIdx]
      variants[vIdx] = {
        ...v,
        explanation: { ...(v.explanation ?? blankLocalized()), [lang]: val },
      }
      return { ...prev, variants }
    })

  const updateOption = (vIdx: number, oIdx: number, fields: Partial<FilterOption>) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = [...(variants[vIdx].options ?? [])]
      options[oIdx] = { ...options[oIdx], ...fields }
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const updateOptionName = (
    vIdx: number,
    oIdx: number,
    lang: 'fi' | 'sv' | 'en',
    val: string
  ) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = [...(variants[vIdx].options ?? [])]
      options[oIdx] = { ...options[oIdx], name: { ...options[oIdx].name, [lang]: val } }
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const addOption = (vIdx: number) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = [
        ...(variants[vIdx].options ?? []),
        { id: '', name: blankLocalized() },
      ]
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const removeOption = (vIdx: number, oIdx: number) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = (variants[vIdx].options ?? []).filter((_, i) => i !== oIdx)
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const addVariant = () =>
    setDraft((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', question: blankLocalized(), options: [] }],
    }))

  const removeVariant = (vIdx: number) =>
    setDraft((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== vIdx),
    }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const { id, ...rest } = draft
      const body = {
        ...rest,
        displayType: rest.displayType || null,
        explanation: toNullIfEmpty(rest.explanation as { fi: string; sv: string; en: string }),
        extraInfo: toNullIfEmpty(rest.extraInfo as { fi: string; sv: string; en: string }),
      }
      let res: Response
      if (isCreate) {
        res = await adminFetch('POST', '/api/admin/filter-config', { id, ...body })
      } else {
        res = await adminFetch('PUT', `/api/admin/filter-config/${id}`, body)
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError((json as { message?: string }).message ?? 'Unknown error')
      } else {
        onSaved()
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const explanationVal = draft.explanation as { fi: string; sv: string; en: string } | undefined
  const extraInfoVal = draft.extraInfo as { fi: string; sv: string; en: string } | undefined

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>{isCreate ? 'Create filter' : `Edit: ${draft.id}`}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v as number)} sx={{ mb: 2 }}>
          <Tab label="General" />
          <Tab label="Variants" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="ID"
              value={draft.id}
              onChange={(e) => patch({ id: e.target.value })}
              disabled={!isCreate}
              helperText={isCreate ? 'Lowercase alphanumeric + hyphens' : ''}
            />
            <TextField
              label="Effects"
              value={draft.effects}
              onChange={(e) => patch({ effects: e.target.value })}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Type
              </Typography>
              <Select
                fullWidth
                value={draft.type}
                onChange={(e) => patch({ type: e.target.value as string })}
              >
                {FILTER_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Display type
              </Typography>
              <Select
                fullWidth
                value={draft.displayType ?? ''}
                onChange={(e) => patch({ displayType: (e.target.value as string) || null })}
              >
                <MenuItem value="">— none —</MenuItem>
                {DISPLAY_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <TextField
              label="Display order"
              type="number"
              value={draft.displayOrder}
              onChange={(e) => patch({ displayOrder: Number(e.target.value) })}
            />
            <TextField
              label="Parent filter ID (optional)"
              value={draft.parentFilterId ?? ''}
              onChange={(e) => patch({ parentFilterId: e.target.value || null })}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(
                [
                  ['mandatory', 'Mandatory'],
                  ['superToggle', 'Super toggle'],
                  ['showInWelcomeModal', 'Show in welcome modal'],
                  ['hideInCurrentFiltersDisplay', 'Hide in current filters'],
                  ['hideInRecommendationReasons', 'Hide in rec. reasons'],
                  ['hideInFilterSidebar', 'Hide in sidebar'],
                  ['isStrictByDefault', 'Strict by default'],
                  ['enabled', 'Enabled'],
                ] as const
              ).map(([field, label]) => (
                <FormControlLabel
                  key={field}
                  label={label}
                  control={
                    <Switch
                      checked={!!draft[field]}
                      onChange={(e) => patch({ [field]: e.target.checked })}
                    />
                  }
                />
              ))}
            </Box>
            <Typography variant="subtitle2">Short name</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['fi', 'sv', 'en'] as const).map((lang) => (
                <TextField
                  key={lang}
                  label={lang.toUpperCase()}
                  value={draft.shortName[lang]}
                  onChange={(e) => patchShortName(lang, e.target.value)}
                  sx={{ flex: 1 }}
                />
              ))}
            </Box>
            <Typography variant="subtitle2">Explanation (optional)</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['fi', 'sv', 'en'] as const).map((lang) => (
                <TextField
                  key={lang}
                  label={lang.toUpperCase()}
                  multiline
                  minRows={2}
                  value={explanationVal?.[lang] ?? ''}
                  onChange={(e) => patchExplanation(lang, e.target.value)}
                  sx={{ flex: 1 }}
                />
              ))}
            </Box>
            <Typography variant="subtitle2">Extra info (optional)</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['fi', 'sv', 'en'] as const).map((lang) => (
                <TextField
                  key={lang}
                  label={lang.toUpperCase()}
                  multiline
                  minRows={2}
                  value={extraInfoVal?.[lang] ?? ''}
                  onChange={(e) => patchExtraInfo(lang, e.target.value)}
                  sx={{ flex: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ pt: 1 }}>
            {draft.variants.map((variant, vIdx) => (
              <Accordion key={vIdx} defaultExpanded={vIdx === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
                  >
                    <Typography sx={{ flexGrow: 1 }}>
                      {variant.name || `Variant ${vIdx + 1}`}
                    </Typography>
                    {variant.name !== 'default' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeVariant(vIdx)
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Variant name"
                      value={variant.name}
                      onChange={(e) => patchVariant(vIdx, { name: e.target.value })}
                      disabled={variant.name === 'default'}
                    />
                    <FormControlLabel
                      label="Skipped"
                      control={
                        <Switch
                          checked={!!variant.skipped}
                          onChange={(e) => patchVariant(vIdx, { skipped: e.target.checked })}
                        />
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      Question
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {(['fi', 'sv', 'en'] as const).map((lang) => (
                        <TextField
                          key={lang}
                          label={lang.toUpperCase()}
                          multiline
                          minRows={2}
                          value={variant.question[lang]}
                          onChange={(e) => patchVariantQuestion(vIdx, lang, e.target.value)}
                          sx={{ flex: 1 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Explanation override (optional)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {(['fi', 'sv', 'en'] as const).map((lang) => (
                        <TextField
                          key={lang}
                          label={lang.toUpperCase()}
                          multiline
                          minRows={2}
                          value={variant.explanation?.[lang] ?? ''}
                          onChange={(e) =>
                            patchVariantExplanation(vIdx, lang, e.target.value)
                          }
                          sx={{ flex: 1 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="subtitle2">Options</Typography>
                    {(variant.options ?? []).map((option, oIdx) => (
                      <Box
                        key={oIdx}
                        sx={{
                          pl: 2,
                          borderLeft: '3px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            label="Option ID"
                            size="small"
                            value={option.id}
                            onChange={(e) => updateOption(vIdx, oIdx, { id: e.target.value })}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label="Value override"
                            size="small"
                            value={option.valueOverride ?? ''}
                            onChange={(e) =>
                              updateOption(vIdx, oIdx, {
                                valueOverride: e.target.value || undefined,
                              })
                            }
                            sx={{ flex: 1 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Set strict
                            </Typography>
                            <Select
                              fullWidth
                              size="small"
                              value={
                                option.setStrict === true
                                  ? 'true'
                                  : option.setStrict === false
                                    ? 'false'
                                    : ''
                              }
                              onChange={(e) => {
                                const v = e.target.value as string
                                updateOption(vIdx, oIdx, {
                                  setStrict:
                                    v === 'true' ? true : v === 'false' ? false : null,
                                })
                              }}
                            >
                              <MenuItem value="">— null —</MenuItem>
                              <MenuItem value="true">true</MenuItem>
                              <MenuItem value="false">false</MenuItem>
                            </Select>
                          </Box>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeOption(vIdx, oIdx)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {(['fi', 'sv', 'en'] as const).map((lang) => (
                            <TextField
                              key={lang}
                              label={`Name (${lang})`}
                              size="small"
                              value={option.name[lang]}
                              onChange={(e) =>
                                updateOptionName(vIdx, oIdx, lang, e.target.value)
                              }
                              sx={{ flex: 1 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={() => addOption(vIdx)}
                      sx={{ color: 'black' }}
                    >
                      Add option
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
            <Button startIcon={<AddIcon />} onClick={addVariant} sx={{ mt: 2, color: 'black' }}>
              Add variant
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving} sx={{ color: 'black' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          Save
        </Button>
      </DialogActions>
      <Snackbar
        open={error !== null}
        message={error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      />
    </Dialog>
  )
}

export default FilterEditDialog
