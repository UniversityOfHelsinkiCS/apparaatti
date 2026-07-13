import Box from '@mui/material/Box'
import { styled, type SxProps, type Theme } from '@mui/material/styles'
import { type ChangeEvent, type FocusEvent, useEffect, useId, useRef, useState } from 'react'

import { HOVER_MEDIA, hy } from './hyTokens'

// warning_fill / check_circle_fill icons: match hy-ds Material Symbols shapes
const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    width="24"
    height="24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m18-107 462-799 462 799H18Zm466.18-132q13.4 0 23.61-10.39Q518-259.78 518-273.18q0-13.4-10.39-23.11-10.39-9.71-23.79-9.71-13.4 0-23.61 9.89Q450-286.22 450-272.82q0 13.4 10.39 23.61Q470.78-239 484.18-239ZM454-348h60v-216h-60v216Z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    width="24"
    height="24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m419-283 294-294-66-66-228 228-111-111-65 66 176 177Zm61.14 228Q392-55 314.51-88.08q-77.48-33.09-135.41-91.02-57.93-57.93-91.02-135.27Q55-391.72 55-479.86 55-569 88.08-646.49q33.09-77.48 90.86-134.97 57.77-57.48 135.19-91.01Q391.56-906 479.78-906q89.22 0 166.83 33.45 77.6 33.46 135.01 90.81t90.89 134.87Q906-569.34 906-480q0 88.28-33.53 165.75t-91.01 135.28q-57.49 57.8-134.83 90.89Q569.28-55 480.14-55Z" />
  </svg>
)

const FONT = "'Open Sans Variable', 'Open Sans', sans-serif"

export interface HyTextAreaProps {
  label?: string
  id?: string
  name?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  optional?: boolean
  assistiveText?: string
  errorText?: string
  successText?: string
  characterLimit?: number
  resize?: 'both' | 'none' | 'vertical' | 'horizontal' | 'auto'
  fullWidth?: boolean
  rows?: number
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  sx?: SxProps<Theme>
}

const LabelSection = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 8, // --ds-spacing-2xSmall
})

const Label = styled('label')({
  fontFamily: FONT,
  fontSize: 16,
  fontWeight: 600, // --ds-fontWeight-semibold
  letterSpacing: 0,
  lineHeight: 1.5,
  color: hy.textColor.default,
})

const AssistiveText = styled('span')({
  display: 'inline-block',
  fontFamily: FONT,
  fontSize: 14,
  color: hy.textColor.secondary,
  lineHeight: 1.5,
  marginTop: 4, // --ds-spacing-3xSmall
})

interface ContainerProps {
  $disabled?: boolean
  $readonly?: boolean
  $invalid?: boolean
  $valid?: boolean
  $fullWidth?: boolean
  $active?: boolean
}

const Container = styled('div')<ContainerProps>(({ $disabled, $readonly, $invalid, $valid, $fullWidth, $active }) => ({
  boxSizing: 'border-box',
  display: 'inline-flex',
  position: 'relative',
  alignItems: 'flex-start',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: hy.borderColor.default,
  padding: 0,

  ...($fullWidth && { width: '100%' }),

  ...(($disabled || $readonly) && {
    backgroundColor: hy.bgColor.disabledOnLight,
    borderColor: hy.borderColor.disabledOnLight,
  }),

  ...($invalid &&
    !$disabled &&
    !$readonly && {
      backgroundColor: hy.bgColor.danger,
      borderColor: hy.borderColor.danger,
      ...($active && { backgroundColor: hy.bgColor.dangerActive }),
      ...(!$active && {
        [HOVER_MEDIA]: {
          '&:hover:not(:focus-within)': {
            backgroundColor: hy.bgColor.dangerHover,
            borderColor: hy.borderColor.danger,
          },
        },
      }),
    }),

  ...($valid &&
    !$disabled &&
    !$readonly && {
      backgroundColor: hy.bgColor.success,
      borderColor: hy.borderColor.success,
      ...($active && { backgroundColor: hy.bgColor.successActive }),
      ...(!$active && {
        [HOVER_MEDIA]: {
          '&:hover:not(:focus-within)': {
            backgroundColor: hy.bgColor.successHover,
            borderColor: hy.borderColor.success,
          },
        },
      }),
    }),

  ...(!$invalid &&
    !$valid &&
    !$disabled &&
    !$readonly && {
      ...($active && { backgroundColor: hy.bgColor.whiteActive }),
      ...(!$active && {
        [HOVER_MEDIA]: {
          '&:hover:not(:focus-within)': {
            borderColor: hy.borderColor.default,
            backgroundColor: hy.bgColor.whiteHover,
          },
        },
      }),
    }),

  '&:focus-within': {
    boxShadow: `0 0 0 2px ${hy.borderColor.white}`,
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: 2,
    ...(!$invalid &&
      !$valid &&
      !$readonly && {
        borderColor: hy.borderColor.primary,
      }),
  },
}))

type ResizeProp = 'both' | 'none' | 'vertical' | 'horizontal' | 'auto'
type CssResize = 'none' | 'both' | 'horizontal' | 'vertical'

const resolveResize = (resize: ResizeProp, fullWidth?: boolean): CssResize => {
  if (resize === 'auto') return 'none'
  if (fullWidth && resize === 'both') return 'vertical'
  if (fullWidth && resize === 'horizontal') return 'none'
  return resize
}

interface TextareaProps {
  $resize: ResizeProp
  $fullWidth?: boolean
}

const StyledTextarea = styled('textarea')<TextareaProps>(({ $resize, $fullWidth }) => ({
  fontFamily: FONT,
  fontSize: 16,
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 1.5,
  width: $fullWidth ? '100%' : 288,
  minWidth: 0,
  minHeight: 96,
  boxSizing: 'border-box',
  backgroundColor: 'transparent',
  color: hy.textColor.default,
  border: 'none',
  padding: 8, // --ds-spacing-2xSmall
  resize: resolveResize($resize, $fullWidth),
  ...($resize === 'auto' && { overflow: 'hidden' }),

  '&::placeholder': {
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 1.5,
    color: hy.textColor.secondary,
  },

  '&:disabled': {
    color: hy.textColor.disabledOnLight,
    backgroundColor: 'transparent',
    cursor: 'not-allowed',
  },

  '&:disabled::placeholder': {
    color: hy.textColor.disabledOnLight,
  },

  '&:focus': {
    outline: 'none',
    border: 'none',
  },
}))

interface ValidityContainerProps {
  $hasCharacterLimit: boolean
}

const ValidityContainer = styled('div')<ValidityContainerProps>(({ $hasCharacterLimit }) => ({
  alignItems: 'center',
  width: '100%',
  fontSize: 14,
  ...($hasCharacterLimit && {
    display: 'flex',
    gap: 16, // --ds-spacing-small
    justifyContent: 'space-between',
  }),
}))

interface ValidityMessageProps {
  $type: 'error' | 'success'
}

const ValidityMessage = styled('div')<ValidityMessageProps>(({ $type }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: 8, // --ds-spacing-2xSmall
  gap: 8, // --ds-spacing-2xSmall
  color: $type === 'error' ? hy.textColor.danger : hy.textColor.success,
}))

const ValidityText = styled('small')({
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 1.5,
})

interface CharacterCountProps {
  $overLimit: boolean
}

const CharacterCount = styled('div')<CharacterCountProps>(({ $overLimit }) => ({
  marginTop: 8, // --ds-spacing-2xSmall
  fontSize: 14,
  ...($overLimit && { color: hy.textColor.danger }),
  '& > small': {
    display: 'inline-block',
    fontSize: 'inherit',
  },
}))

function HyTextArea({
  label,
  id: idProp,
  name,
  placeholder,
  value,
  defaultValue,
  disabled,
  readOnly,
  required,
  optional,
  assistiveText,
  errorText,
  successText,
  characterLimit,
  resize = 'both',
  fullWidth,
  rows,
  onChange,
  onBlur,
  onFocus,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  sx,
}: HyTextAreaProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [charCount, setCharCount] = useState(() => (value ?? defaultValue ?? '').length)
  const [active, setActive] = useState(false)

  const assistiveTextId = assistiveText ? `${id}-assistive-text` : undefined
  const errorTextId = errorText ? `${id}-error-text` : undefined
  const successTextId = successText ? `${id}-success-text` : undefined

  const computedDescribedby =
    ariaDescribedby ?? ([assistiveTextId, errorTextId, successTextId].filter(Boolean).join(' ') || undefined)

  useEffect(() => {
    if (value !== undefined) {
      setCharCount(value.length)
    }
  }, [value])

  const adjustHeight = (el: HTMLTextAreaElement | null = textareaRef.current) => {
    if (resize === 'auto' && el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [resize, adjustHeight])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) {
      setCharCount(e.target.value.length)
    }
    adjustHeight(e.target)
    onChange?.(e)
  }

  const getLabelText = () => {
    if (!label) return undefined
    if (required) return `${label} *`
    if (optional) return `${label} (optional)`
    return label
  }

  const overLimit = characterLimit !== undefined && charCount > characterLimit

  return (
    <Box component="div" sx={[{ display: fullWidth ? 'block' : 'inline-block' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {(label || assistiveText) && (
        <LabelSection>
          {label && <Label htmlFor={id}>{getLabelText()}</Label>}
          {assistiveText && <AssistiveText id={assistiveTextId}>{assistiveText}</AssistiveText>}
        </LabelSection>
      )}
      <Container
        $disabled={disabled}
        $readonly={readOnly}
        $invalid={!!errorText}
        $valid={!!successText}
        $fullWidth={fullWidth}
        $active={active}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
        onClick={() => textareaRef.current?.focus()}
      >
        <StyledTextarea
          ref={textareaRef}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={rows}
          $resize={resize}
          $fullWidth={fullWidth}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={computedDescribedby}
          aria-invalid={errorText ? 'true' : 'false'}
        />
      </Container>
      {(errorText || successText || characterLimit !== undefined) && (
        <ValidityContainer $hasCharacterLimit={characterLimit !== undefined}>
          {characterLimit !== undefined ? (
            <>
              <div>
                {errorText && (
                  <ValidityMessage $type="error" id={errorTextId}>
                    <WarningIcon />
                    <ValidityText>{errorText}</ValidityText>
                  </ValidityMessage>
                )}
                {successText && (
                  <ValidityMessage $type="success" id={successTextId}>
                    <CheckCircleIcon />
                    <ValidityText>{successText}</ValidityText>
                  </ValidityMessage>
                )}
              </div>
              <CharacterCount $overLimit={overLimit}>
                <small>
                  {charCount}/{characterLimit}
                </small>
              </CharacterCount>
            </>
          ) : (
            <>
              {errorText && (
                <ValidityMessage $type="error" id={errorTextId}>
                  <WarningIcon />
                  <ValidityText>{errorText}</ValidityText>
                </ValidityMessage>
              )}
              {successText && (
                <ValidityMessage $type="success" id={successTextId}>
                  <CheckCircleIcon />
                  <ValidityText>{successText}</ValidityText>
                </ValidityMessage>
              )}
            </>
          )}
        </ValidityContainer>
      )}
    </Box>
  )
}

export default HyTextArea
