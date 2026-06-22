import { Button } from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'

interface ActionButtonV2Props {
  onClick?: () => void
  text?: string
  dataCy?: string
  visualStyle?: 'default' | 'course-show' | 'app-bar'
  type?: ButtonProps['type']
}

const ActionButton = ({
  onClick = () => {},
  text = '',
  dataCy,
  visualStyle = 'default',
  type,
}: ActionButtonV2Props) => {
  const buttonSx =
    visualStyle === 'course-show'
      ? {
          marginTop: 0,
          backgroundColor: '#cfd4da',
          color: '#1f2933',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#bfc6cd',
            boxShadow: 'none',
          },
        }
      : visualStyle === 'default'
        ? {
            borderColor: '#b8bec5',
            backgroundColor: '#f2f4f6',
            color: '#1f2933',
            marginTop: 4,
            '&:hover': {
              borderColor: '#a7afb7',
              backgroundColor: '#e6eaee',
              color: '#1f2933',
            },
          }
        : undefined
  const isAppBar = visualStyle === 'app-bar'
  const buttonType = type ?? (isAppBar ? 'button' : 'submit')

  return (
    <Button
      data-cy={dataCy}
      color={isAppBar ? 'inherit' : undefined}
      variant={visualStyle === 'course-show' ? 'contained' : isAppBar ? 'text' : 'outlined'}
      type={buttonType}
      onClick={onClick}
      sx={{
        width: isAppBar ? 'fit-content' : 'auto',
        ml: isAppBar ? 2 : 0,
        ...buttonSx,
      }}
    >
      {text}
    </Button>
  )
}

export default ActionButton
