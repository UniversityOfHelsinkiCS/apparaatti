import { Button } from '@mui/material'


interface actionButtonProps {
  onClick?: () => void
  text?: string
}


const ActionButton = ({onClick = () => {}, text = ''}: actionButtonProps) => {
  return (
    <Button
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
