import log from 'winston-logger-setup'
import Post from '../models/Post'
import User from '../models/User'
import Location from '../models/Location'
import CollectClass from '../foundations/CollectClass'
import imageUpload from '../helpers/imageUpload'

exports.collectToInsert = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setBody([
    'title',
    'category',
    'content',
    'salary',
    'placeId'
  ])
  collectInstance.setFiles(['titleImage'])
  collectInstance.setMandatoryFields({
    title: 'Title not provided',
    category: 'Category not provided',
    content: 'Content not provided',
    titleImage: 'Title image not provided',
    salary: 'Salary not provided',
    placeId: 'Place id not provided'
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
    User.findOne({id: req.user.id}, (err, user) => {
      if (err) {
        log.error(err, {})
        next(err)
      } else if (user) {
        Location.findOne({placeId: req.postData.placeId}, (err, place) => {
          if (err) {
            log.error(err, {})
            next(err)
          } else if (place) {
            imageUpload(req.postData.titleImage, 'posts').then((filename) => {
              req.postData.titleImage = filename
              req.postData.userDetails = user._id
              req.postData.locationDetails = place._id
              let newPost = new Post(req.postData)
              newPost.save((err, data) => {
                if (err || !data) {
                  log.error(err, {})
                  next(err || new Error('Post not created'))
                } else {
                  // Post.populate(data, {path: 'userDetails'}, (err, data) => {
                  //   if (err) {
                  //     throw err
                  //   } else {
                  //     req.cdata = {
                  //       success: 1,
                  //       message: 'Post inserted successfully',
                  //       data
                  //     }
                  //     next()
                  //   }
                  // })

                  Post.find({_id: data._id})
                  .populate('userDetails')
                  .populate('locationDetails')
                  .exec((err, data) => {
                    if (err || !data) {
                      log.error(err, {})
                      next(err || new Error('No data'))
                    } else {
                      req.cdata = {
                        success: 1,
                        message: 'Post created successfully',
                        data
                      }
                      next()
                    }
                  })

                  // req.cdata = {
                  //   success: 1,
                  //   message: 'Post created successfully'
                  // }
                  // next()
                }
              })
            }).catch((e) => {
              let error = new Error(e)
              log.error(error, {})
              next(error)
            })
          } else {
            let e = new Error('Place not found')
            e.status = 400
            next(e)
          }
        })
      } else {
        throw new Error('User not found')
      }
    })
  } catch (err) {
    let error = new Error(err)
    log.error(error, {})
    next(error)
  }
}

exports.list = (req, res, next) => {
  try {
    Post.find()
    .populate('userDetails')
    .populate('locationDetails')
    .exec((err, data) => {
      if (err) {
        throw err
      } else if (data && data.length > 0) {
        req.cdata = {
          success: 1,
          message: 'Posts retrieved successfully',
          data
        }
        next()
      } else {
        req.cdata = {
          success: 0,
          message: 'No posts yet'
        }
        next()
      }
    })
  } catch (err) {
    let error = new Error(err)
    log.error(error, {})
    next(error)
  }
}
