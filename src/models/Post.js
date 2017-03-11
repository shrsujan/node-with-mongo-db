import {mongoose} from '../foundations/mongodb'
import PostSchema from './schemas/PostSchema'

// PostSchema.pre('save', function (next, done) {
//   // mongoose.models['Post'].findOne(/* conditions - {property: value} */, cb})
// }

let Post = mongoose.model('posts', PostSchema)

export default Post
