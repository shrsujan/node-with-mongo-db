import {Schema} from '../../foundations/mongodb'

let PostSchema = new Schema({
  title: String,
  category: String,
  content: String,
  titleImage: String,
  salary: Number,
  userDetails: {type: Schema.ObjectId, ref: 'users', default: null},
  locationDetails: {type: Schema.ObjectId, ref: 'locations', default: null},
  dateTime: {type: Date, default: Date.now}
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

export default PostSchema
