import {mongoose} from '../foundations/mongodb'
import PostSchema from './schemas/PostSchema'

PostSchema.pre('save', function (next) {
  // mongoose.models['Post'].findOne(/* conditions - {property: value} */, cb})
  this.category = this.category.toLowerCase()
  this.subCategory = this.subCategory.toLowerCase()
  this.postId = this.postId.toLowerCase()
  next()
})

let Post = mongoose.model('posts', PostSchema)

export default Post
