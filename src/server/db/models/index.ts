import User from './user'
import Enrolment from './enrolment'
import Filter from './filter'

Enrolment.belongsTo(User, { as: 'user' })
User.hasMany(Enrolment, { as: 'enrolments' })

export {
  User,
  Enrolment,
  Filter,
}
