import { Box } from '@mui/material'
import LoginAs from './LoginAs.tsx'
import useApi from '../util/useApi.tsx'

const AdminPage = () => {

  const { data: user, isLoading: isUserLoading } = useApi('user', '/api/user', 'GET', null)
  if (isUserLoading) {
    return <div>Loading...</div>
  }
  
  return (
    <Box>
      <p>this is the admin page</p>
      <LoginAs/>
    </Box>
  )
}



export default AdminPage
