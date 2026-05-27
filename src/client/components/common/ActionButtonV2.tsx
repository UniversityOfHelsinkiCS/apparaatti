import { Button } from '@mui/material'

interface actionButtonProps {
  onClick?: () => void
  text?: string
  dataCy?: string
  visualStyle?: 'default' | 'course-show' | 'app-bar'
}

const ActionButtonV2 = ({
  onClick = () => {},
  text = '',
  dataCy,
  visualStyle = 'default',
}: actionButtonProps) => {
  const buttonSx = visualStyle === 'course-show'
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
    : visualStyle === 'app-bar'
      ? {}
      : {
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
  const isAppBar = visualStyle === 'app-bar'

  return (
    <Button
      data-cy={dataCy}
      color={isAppBar ? 'inherit' : undefined}
      variant={visualStyle === 'course-show' ? 'contained' : isAppBar ? 'text' : 'outlined'}
      type={isAppBar ? 'button' : 'submit'}
      onClick={onClick}
      sx={{
        width: isAppBar ? 'fit-content' : 'auto',
        ml: isAppBar ? 2 : 0,
        mt: isAppBar ? 0 : undefined,
        ...buttonSx,
      }}
    >
      {text}
    </Button>
  )
}

export default ActionButtonV2