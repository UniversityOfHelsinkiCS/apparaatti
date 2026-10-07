import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useOutletContext } from 'react-router-dom'

import type { User } from '../../../common/types'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useRequiredUser from '../../util/useRequiredUser.ts'

export type AdminOutletContext = { user: User }

export const useAdminUser = () => useOutletContext<AdminOutletContext>().user

const AdminMain = () => {
  const { t } = useTranslation()
  const { user, isLoading, isUnauthorized } = useRequiredUser()

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isLoading || !user) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  return <Outlet context={{ user } satisfies AdminOutletContext} />
}

export default AdminMain
