import {mongoose} from '../foundations/mongodb'
import UserSchema from './schemas/UserSchema'

// UserSchema.virtual('fullName').get(function () {
//   return this.firstName + ' ' + this.lastName
// })

let User = mongoose.model('User', UserSchema)

export default User
