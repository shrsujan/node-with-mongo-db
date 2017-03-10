import log from 'winston-logger-setup'
import Post from '../models/Post'
import CollectClass from '../foundations/CollectClass'
import imageUpload from '../helpers/imageUpload'

exports.collectToInsert = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setBody([
    'title',
    'category',
    'content',
    'salary'
  ])
  collectInstance.setFiles(['titleImage'])
  collectInstance.setMandatoryFields({
    title: 'Title not provided',
    category: 'Category not provided',
    content: 'Content not provided',
    titleImage: 'Title image not provided',
    salary: 'Salary not provided'
  })
  collectInstance.collect(req).then((data) => {
    req.postData = data
    next()
  }).catch((err) => {
    next(err)
  })
}

exports.insert = (req, res, next) => {
  try {
    imageUpload(req.postData.titleImage, 'posts').then((filename) => {
      req.postData.titleImage = filename
      req.postData.userDetails = req.user._id
      let newPost = new Post(req.postData)
      newPost.save((err, data) => {
        if (err) {
          next(err)
        } else {
          req.cdata = {
            success: 1,
            message: 'Post inserted successfully',
            data
          }
          next()
        }
      })
    }).catch((e) => {
      let error = new Error(e)
      log.cnsl(error, {})
      next(error)
    })
  } catch (err) {
    let error = new Error(err)
    log.error(error, {})
    next(error)
  }
}

exports.list = (req, res, next) => {
  try {
    Post.find((err, data) => {
      if (err) {
        throw err
      } else {
        Post.populate(data, {path: 'userDetails'}, (err, posts) => {
          req.cdata = {
            success: 1,
            message: 'Posts retrieved successfully',
            posts
          }
          next()
        })
      }
    })
  } catch (err) {
    let error = new Error(err)
    log.error(error, {})
    next(error)
  }
}
