import log from 'winston-logger-setup'
import User from '../models/User'
import CollectClass from '../foundations/CollectClass'
import imageUpload from '../helpers/imageUpload'
import password from '../helpers/passwordModule'
import jwtsign from '../helpers/jwtsign'

exports.collectToRegister = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setBody([
    'firstName',
    'lastName',
    'email',
    'password',
    'deviceId',
    'hideUserDetails'
  ])
  collectInstance.setFiles(['profilePic'])
  collectInstance.setMandatoryFields({
    firstName: 'First name not provided',
    lastName: 'Last name not provided',
    email: 'Email not provided',
    password: 'Password not provided',
    deviceId: 'Device Id not provided',
    profilePic: 'Profile picture not provided'
  })
  collectInstance.collect(req).then((data) => {
    req.userData = data
    next()
  }).catch((err) => {
    err.status = 400
    next(err)
  })
}

exports.register = (req, res, next) => {
  try {
    imageUpload(req.userData.profilePic, 'users').then((filename) => {
      req.userData.profilePic = filename
      // newUser.validateSync()
      password.generate(req.userData.password).then((hash) => {
        req.userData.password = hash
        let newUser = new User(req.userData)
        newUser.save((err, data) => {
          if (err) {
            next(err)
          } else {
            // remove password from data
            // change for test as well
            req.cdata = {
              success: 1,
              message: 'User registered successfully',
              data
            }
            next()
          }
        })
      }).catch((e) => {
        throw e
      })
    }).catch((e) => {
      let error = new Error(e)
      log.error(error, {})
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
    User.find({}, {password: 0}, (err, data) => {
      if (err) {
        throw err
      } else {
        req.cdata = {
          success: 1,
          message: 'Users retrieved successfully',
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

exports.collectToLogin = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setBody(['email', 'password'])
  collectInstance.setMandatoryFields({
    'email': 'Email not provided',
    'password': 'Password not provided'
  })
  collectInstance.collect(req).then((data) => {
    req.loginData = data
    next()
  }).catch((err) => {
    err.status = 400
    next(err)
  })
}

exports.authenticate = (req, res, next) => {
  try {
    password.compare(req.loginData, User).then((data) => {
      delete data.password
      jwtsign.generateAccessToken(data).then((accessToken) => {
        jwtsign.generateRefreshToken(data).then((refreshToken) => {
          res.setHeader('authorization', 'Bearer ' + accessToken)
          res.setHeader('refreshtoken', 'Bearer ' + refreshToken)
          req.cdata = {
            success: 1,
            message: 'Login successful'
          }
          next()
        }).catch((e) => {
          throw e
        })
      }).catch((e) => {
        throw e
      })
    }).catch((e) => {
      let error = new Error(e)
      log.error(error, {})
      next(error)
    })
  } catch (err) {
    let error = new Error(err)
    next(error)
  }
}
