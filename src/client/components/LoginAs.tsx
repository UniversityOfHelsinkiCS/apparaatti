import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  TextField,
  Typography,
} from '@mui/material'
import { loginAs } from '../util/loginAs'
import useApi from '../util/useApi'
import { User } from '../../common/types'


const trimSearch = (search: string) => {
 
  const trimmedSearch = search.trim()
  if (!trimmedSearch || trimmedSearch.length < 5) {
    return []
  }
  return trimmedSearch
}
const LoginAs = () => {
  const { t } = useTranslation()

  const [loginAsCandidate, setLoginAsCandidate] = useState<User | null>(null)

  const [userSearch, setUserSearch] = useState('')
  
  const trimmedSearch = trimSearch(userSearch)  
  const url = `/api/admin/users?search=${trimmedSearch ? trimmedSearch : ''}`

  const {data: users, isLoading: isUsersLoading, refetch} = useApi('users', url, 'GET',)

  const handleLoginAs = () => {
    loginAs(loginAsCandidate)
  }

  useEffect(() => {
    console.log('refetch called')
    refetch()

  }, [userSearch])

  return (
    <>
      <Typography component="h1" variant="h4">
        {t('loginAsPage:title')}
      </Typography>
      <Box
        sx={{
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          mt: '2rem',
          mx: 'auto',
        }}
      >
        <FormControl fullWidth>
          <Autocomplete
            id="login-as-user"
            noOptionsText={t('userSearchNoOptions')}
            data-testid="login-as-user"
            disablePortal
            options={users ?? []}
            getOptionLabel={(user) =>
              `${user.firstName} ${user.lastName} ${user.email ? `(${user.email})` : ''} ${user.username ? `(${user.username})` : ''}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('loginAsPage:userHeader')}
                required
              />
            )}
            inputValue={userSearch}
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={loginAsCandidate}
            onChange={(_, value) => {
              setLoginAsCandidate(value)
            }}
            onInputChange={(_, value) => {
              setUserSearch(value)
            }}
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          data-testid="login-as-button"
          disabled={!loginAsCandidate}
          onClick={handleLoginAs}
          fullWidth
          sx={{ borderRadius: '0.5rem' }}
        >
          Login As
        </Button>
      </Box>
    </>
  )
}

export default LoginAs
