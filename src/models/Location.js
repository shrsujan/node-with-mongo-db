import {mongoose} from '../foundations/mongodb'
import LocationSchema from './schemas/LocationSchema'

// LocationSchema.pre('save', function (next, done) {
//   // mongoose.models['Location'].findOne(/* conditions - {property: value} */, cb})
// }

let Location = mongoose.model('locations', LocationSchema)

export default Location
