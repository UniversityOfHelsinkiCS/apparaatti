import { Button } from '@mui/material'


interface actionButtonProps {
  onClick?: () => void
  text?: string
  dataCy?: string
}


const ActionButton = ({onClick = () => {}, text = '', dataCy}: actionButtonProps) => {
  return (
    <Button
      data-cy={dataCy}
      variant="outlined"
      type="submit"
      onClick={onClick}
      sx={{
        borderColor: '#90caf9',
        color: 'black',
        width: '6rem',
        '&:hover': {
          backgroundColor: '#2196f3',
          color: 'white',
        },
        marginTop: 4,
      }}
    >
      {text}
    </Button>
  )
}


export default ActionButton
