import jwt from 'jsonwebtoken'
import log from 'winston-logger-setup'
import config from '../config/config'
const jwtSecret = config.jwt.jwtSecret
const refreshJwtSecret = config.jwt.refreshJwtSecret

let jwtmw = {
  authMiddleware: (app) => {
    jwtmw.accessMiddleware(app, '/user/list')
  },

  accessMiddleware: (app, privateApi) => {
    app.use(privateApi, jwtmw.jwtAuth({secret: jwtSecret}))
  },

  refreshMiddleware: (app, privateApi) => {
    app.use(privateApi, jwtmw.refreshJwtAuth({secret: refreshJwtSecret}))
  },

  jwtAuth: (signature) => {
    return (req, res, next) => {
      if (typeof (req.headers.authorization) === 'undefined') {
        res.status(401).json({
          result: 'failure',
          success: 0,
          error: 1,
          error_msg: 'Token not provided',
          statusCode: 401,
          errorCode: 402
        })
      } else {
        let authHeader = req.headers.authorization
        let header = authHeader.split(' ')[0]
        if (header.toLowerCase() === 'bearer') {
          let token = authHeader.split(' ')[1]
          jwt.verify(token, signature.secret, {ignoreExpiration: true}, (err, decoded) => {
              // log.cnsl(decoded, {})
            if (decoded) {
              let currentTime = parseInt((Date.now()) * 0.001)
              let diff = currentTime - decoded.exp
              // log.cnsl(diff, {})
              if (diff >= 0) {
                let token = jwt.sign({id: decoded.id, email: decoded.email}, refreshJwtSecret, {expiresIn: 60})
                res.setHeader('authorization', 'Bearer ' + token)
                res.status(401).json({
                  result: 'failure',
                  success: 0,
                  error: 1,
                  error_msg: 'Token expired',
                  statusCode: 401,
                  errorCode: 401
                })
              } else {
                req.user = decoded
                next()
              }
            }
            if (err) {
              next(err)
            }
          })
        } else {
          res.status(401).json({
            result: 'failure',
            success: 0,
            error: 1,
            error_msg: 'Invalid authorization header',
            statusCode: 401,
            errorCode: 401
          })
        }
      }
    }
  },

  refreshJwtAuth: (signature) => {
    return (req, res, next) => {
      // log.cnsl(req.headers, {})
      if (typeof (req.headers.refreshauthorization) === 'undefined') {
        res.status(401).json({
          result: 'failure',
          success: 0,
          error: 1,
          error_msg: 'Refresh token not provided',
          statusCode: 401,
          errorCode: 402
        })
      } else {
        let authHeader = req.headers.refreshauthorization
        let header = authHeader.split(' ')[0]
        if (header.toLowerCase() === 'bearer') {
          let token = authHeader.split(' ')[1]
          jwt.verify(token, signature.secret, (err, decoded) => {
            if (decoded) {
              // log.cnsl('decoded', {})
              req.refreshTokenData = decoded
              next()
            }
            if (err) {
              log.cnsl('err', {})
              res.status(401).json({
                result: 'failure',
                success: 0,
                error: 1,
                error_msg: 'Refresh token expired',
                statusCode: 401,
                errorCode: 402
              })
            }
          })
        } else {
          res.status(401).json({
            result: 'failure',
            success: 0,
            error: 1,
            error_msg: 'Invalid authorization header',
            statusCode: 401,
            errorCode: 401
          })
        }
      }
    }
  }
}

export default jwtmw
