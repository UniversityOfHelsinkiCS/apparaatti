import { Box } from '@mui/material'
import FilterConfigEditor from './admin/FilterConfigEditor.tsx'
import useApi from '../util/useApi.tsx'
import { Navigate } from 'react-router-dom'

const AdminPage = () => {

  const { data: user, isLoading: isUserLoading } = useApi('user', '/api/user', 'GET', null)
  if (isUserLoading) {
    return <div>Loading...</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  return (
    <Box sx={{ p: 3 }}>
      <FilterConfigEditor isSuperuser={user.isSuperuser === true} />
    </Box>
  )
}

export default AdminPage
