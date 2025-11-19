import User from './user'
import Enrolment from './enrolment'
Enrolment.belongsTo(User, { as: 'user' })

User.hasMany(Enrolment, { as: 'enrolments' })

export {
  User,
  Enrolment,
}
