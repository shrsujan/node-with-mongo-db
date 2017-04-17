import {mongoose} from '../foundations/mongodb'
import LocationSchema from './schemas/LocationSchema'

LocationSchema.pre('save', function (next) {
  // mongoose.models['Location'].findOne(/* conditions - {property: value} */, cb})
  this.country = this.country.toLowerCase()
  this.state = this.state.toLowerCase()
  this.nearestBiggestCity = this.nearestBiggestCity.toLowerCase()
  this.city = this.city.toLowerCase()
  this.streetAddress = this.streetAddress.toLowerCase()
  this.placeId = this.placeId.toLowerCase()
  next()
})

let Location = mongoose.model('locations', LocationSchema)

export default Location
