import type { UserSettings as UserSettingsType } from '../../../common/types.ts'
import User from '../../db/models/user.ts'
import UserSettings from '../../db/models/userSettings.ts'

export async function userWithId(id: string) {
  return await User.findByPk(id)
}

export async function getUserSettings(userId: string) {
  return await UserSettings.findOne({
    where: { userId },
  })
}

export async function updateUserSettings(userId: string, settings: UserSettingsType) {
  const [userSettings] = await UserSettings.upsert({
    ...settings,
    userId,
  })
  return userSettings
}

export async function usersWithWhere(where: Record<string, any>, limit: number) {
  return await User.findAll({
    where,
    limit,
    raw: true,
  })
}
