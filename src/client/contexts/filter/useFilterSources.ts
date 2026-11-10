import type { User, UserSettings } from '../../../common/types'
import useApi from '../../util/useApi'

export type OrganisationOption = {
  id: string
  code: string
  name: unknown
}

export type StudyDataResponse = {
  organisations: OrganisationOption[]
}

/** Server data the filters depend on: the user, their settings, study data and the faculties. */
const useFilterSources = () => {
  const { data: user, isLoading: userLoading } = useApi<User>('user', '/api/user', 'GET')
  const {
    data: userSettings,
    isLoading: userSettingsLoading,
    refetch: refetchUserSettings,
  } = useApi<UserSettings>('userSettings', '/api/user/settings', 'GET')
  const { data: studyData, isLoading: studyDataLoading } = useApi<StudyDataResponse>(
    'studyData',
    '/api/user/studydata',
    'GET'
  )
  const { data: supportedOrganisations, isLoading: supportedOrganisationsLoading } = useApi<OrganisationOption[]>(
    'supportedOrganisations',
    '/api/organisations/supported',
    'GET'
  )

  return {
    user,
    userSettings,
    userSettingsLoading,
    refetchUserSettings,
    studyData,
    supportedOrganisations,
    isLoading: userLoading || studyDataLoading || supportedOrganisationsLoading || userSettingsLoading,
  }
}

export default useFilterSources
