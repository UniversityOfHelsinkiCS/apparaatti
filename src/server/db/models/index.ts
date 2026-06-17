import Enrolment from './enrolment'
import Filter from './filter'
import User from './user'
import UserSettings from './userSettings'

Enrolment.belongsTo(User, { as: 'user' })
User.hasMany(Enrolment, { as: 'enrolments' })

export { Enrolment, Filter, User, UserSettings }
