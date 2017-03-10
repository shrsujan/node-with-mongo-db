import {Schema} from '../../foundations/mongodb'

let PostSchema = new Schema({
  title: String,
  category: String,
  content: String,
  titleImage: String,
  salary: Number,
  userDetails: {type: Schema.Types.ObjectId, ref: 'User'},
  locationDetails: {type: Schema.Types.ObjectId, ref: 'Location'},
  dateTime: { type: Date, default: Date.now }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

export default PostSchema
