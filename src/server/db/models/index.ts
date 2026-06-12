import User from './user'
import UserSettings from './userSettings'
import Enrolment from './enrolment'
import Filter from './filter'

Enrolment.belongsTo(User, { as: 'user' })
User.hasMany(Enrolment, { as: 'enrolments' })

export { User, UserSettings, Enrolment, Filter }
