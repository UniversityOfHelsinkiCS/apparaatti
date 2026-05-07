import { Button } from '@mui/material'

interface actionButtonProps {
  onClick?: () => void
  text?: string
  dataCy?: string
  visualStyle?: 'default' | 'course-show'
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

  return (
    <Button
      data-cy={dataCy}
      variant={visualStyle === 'course-show' ? 'contained' : 'outlined'}
      type="submit"
      onClick={onClick}
      sx={{
        width: 'auto',
        ...buttonSx,
      }}
    >
      {text}
    </Button>
  )
}

export default ActionButtonV2