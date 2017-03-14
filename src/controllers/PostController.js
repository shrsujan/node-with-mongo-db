import log from 'winston-logger-setup'
import Post from '../models/Post'
import User from '../models/User'
import Location from '../models/Location'
import CollectClass from '../foundations/CollectClass'
import imageUpload from '../helpers/imageUpload'

exports.collectToInsert = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setBody([
    'postId',
    'title',
    'category',
    'subCategory',
    'content',
    'salary',
    'country',
    'placeId'
  ])
  collectInstance.setFiles(['titleImage'])
  collectInstance.setMandatoryFields({
    postId: 'Post id not provided',
    title: 'Title not provided',
    category: 'Category not provided',
    subCategory: 'Sub-category not provided',
    content: 'Content not provided',
    titleImage: 'Title image not provided',
    salary: 'Salary not provided',
    country: 'Country name not provided',
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
    User.findOne({_id: req.user._id}, (err, user) => {
      if (err) {
        log.error(err, {})
        next(new Error('No such user'))
      } else if (user) {
        Location.findOne({
          country: req.postData.country.toLowerCase(),
          placeId: req.postData.placeId
        }, (err, place) => {
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
                  .populate({
                    path: 'userDetails',
                    select: {password: 0}
                  })
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
        next(new Error('User not found'))
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
    .populate({
      path: 'userDetails',
      match: {
        hideUserDetails: false
      },
      select: {password: 0}
    })
    .populate('locationDetails')
    .exec((err, data) => {
      console.log('1')
      if (err) {
        log.error(err)
        next(err)
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

exports.collectToRetrieve = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setParams([
    'country',
    'state',
    'city',
    'category',
    'subCategory',
    'postId'
  ])
  collectInstance.setMandatoryFields({
    country: 'Country name not provided',
    state: 'State not provided',
    city: 'City not provided',
    category: 'Category not provided',
    subCategory: 'Sub-category not provided',
    postId: 'Post id not provided'
  })
  collectInstance.collect(req).then((data) => {
    req.postData = data
    next()
  }).catch((err) => {
    next(err)
  })
}

exports.postInformation = (req, res, next) => {
  try {
    Post.findOne({
      category: req.postData.category.toLowerCase(),
      subCategory: req.postData.subCategory.toLowerCase(),
      postId: req.postData.postId.toLowerCase()
    })
    .populate({
      path: 'userDetails',
      match: {
        hideUserDetails: false
      },
      select: {password: 0}
    })
    .populate({
      path: 'locationDetails',
      match: {
        country: req.postData.country.toLowerCase(),
        state: req.postData.state.toLowerCase(),
        city: req.postData.city.toLowerCase()
      }
    })
    .exec((err, data) => {
      if (err || !data || data.locationDetails === null) {
        log.error(err, {})
        next(err || new Error('No such post'))
      } else {
        req.cdata = {
          success: 1,
          message: 'Post retrieved successfully',
          data
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

exports.deletePost = (req, res, next) => {
  try {
    Post.findOne({
      category: req.postData.category.toLowerCase(),
      subCategory: req.postData.subCategory.toLowerCase(),
      postId: req.postData.postId.toLowerCase()
    })
    .populate({
      path: 'userDetails',
      select: {password: 0}
    })
    .populate({
      path: 'locationDetails',
      match: {
        country: req.postData.country.toLowerCase(),
        state: req.postData.state.toLowerCase(),
        city: req.postData.city.toLowerCase()
      }
    })
    .remove()
    .exec((err, data) => {
      // log.cnsl(data)
      if (err || !data || !data.result.n) {
        log.error(err, {})
        next(err || new Error('No such post'))
      } else {
        req.cdata = {
          success: 1,
          message: 'Post deleted successfully'
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

exports.collectToEdit = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setBody([
    'title',
    'content',
    'salary'
  ])
  collectInstance.setFiles(['titleImage'])
  collectInstance.setParams([
    'country',
    'state',
    'city',
    'category',
    'subCategory',
    'postId'
  ])
  collectInstance.setMandatoryFields({
    country: 'Country name not provided',
    state: 'State not provided',
    city: 'City not provided',
    category: 'Category not provided',
    subCategory: 'Sub-category not provided',
    postId: 'Post id not provided',
    title: 'Title not provided',
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

exports.editInformation = (req, res, next) => {
  try {
    Post.findOne({
      category: req.postData.category.toLowerCase(),
      subCategory: req.postData.subCategory.toLowerCase(),
      postId: req.postData.postId.toLowerCase()
    })
    .populate({
      path: 'userDetails',
      select: {password: 0}
    })
    .populate({
      path: 'locationDetails',
      match: {
        country: req.postData.country.toLowerCase(),
        state: req.postData.state.toLowerCase(),
        city: req.postData.city.toLowerCase()
      }
    })
    .exec((err, data) => {
      if (err || !data || data.locationDetails === null) {
        log.error(err, {})
        next(err || new Error('No such post'))
      } else {
        imageUpload(req.postData.titleImage, 'posts').then((filename) => {
          data.title = req.postData.title
          data.content = req.postData.content
          data.salary = req.postData.salary
          data.titleImage = filename
          data.save((err, data) => {
            if (err || !data) {
              log.error(err, {})
              next(err || new Error('Post not created'))
            } else {
              Post.find({_id: data._id})
              .populate({
                path: 'userDetails',
                match: {
                  hideUserDetails: false
                },
                select: {password: 0}
              })
              .populate('locationDetails')
              .exec((err, data) => {
                if (err || !data) {
                  log.error(err, {})
                  next(err || new Error('No data'))
                } else {
                  req.cdata = {
                    success: 1,
                    message: 'Post updated successfully',
                    data
                  }
                  next()
                }
              })
            }
          })
        }).catch((e) => {
          let error = new Error(e)
          log.error(error, {})
          next(error)
        })
      }
    })
  } catch (err) {
    let error = new Error(err)
    log.error(error, {})
    next(error)
  }
}
