import {Schema} from '../../foundations/mongodb'

let UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  profilePic: String,
  deviceId: String,
  hideUserDetails: {type: Boolean, default: 0},
  dateCreated: {type: Date, default: Date.now}
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

export default UserSchema
