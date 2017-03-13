import {Schema} from '../../foundations/mongodb'

let LocationSchema = new Schema({
  country: String,
  zip: Number,
  state: String,
  nearestBiggestCity: String,
  city: String,
  lat: Number,
  long: Number,
  streetAddress: String,
  placeId: String
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

export default LocationSchema
