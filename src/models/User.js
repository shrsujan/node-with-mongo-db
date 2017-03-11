import {mongoose} from '../foundations/mongodb'
import UserSchema from './schemas/UserSchema'

// UserSchema.virtual('fullName').get(function () {
//   return this.firstName + ' ' + this.lastName
// })

UserSchema.pre('save', function (next) {
  mongoose.models['users'].findOne({email: this.email}, (err, result) => {
    if (err) {
      next(err)
    } else if (result) {
      this.invalidate('email', 'This email is already registered')
      next(new Error('This email is already registered'))
    } else {
      next()
    }
  })
})

let User = mongoose.model('users', UserSchema)

export default User
