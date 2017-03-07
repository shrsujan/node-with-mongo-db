import jwt from 'jsonwebtoken'
import config from '../config/config'
import jwtsign from '../helpers/jwtsign'
const jwtSecret = config.jwt.jwtSecret
const refreshJwtSecret = config.jwt.refreshJwtSecret

let jwtmw = {
  authMiddleware: (app, apiList) => {
    apiList.forEach((api) => {
      app.use(api, jwtmw.jwtAuth())
    })
  },

  jwtAuth: () => {
    return (req, res, next) => {
      if (typeof (req.headers.authorization) === 'undefined' && typeof (req.headers.refreshtoken) === 'undefined') {
        res.status(401).json({
          result: 'failure',
          success: 0,
          error: 1,
          error_msg: 'Token not provided',
          statusCode: 401,
          errorCode: 402
        })
      } else {
        if (req.headers.authorization) {
          let authHeader = req.headers.authorization
          let header = authHeader.split(' ')[0]
          if (header.toLowerCase() === 'bearer') {
            let token = authHeader.split(' ')[1]
            jwt.verify(token, jwtSecret, (err, decoded) => {
              if (decoded) {
                req.user = decoded
                next()
              }
              if (err) {
                if (req.headers.refreshtoken) {
                  let authHeader = req.headers.refreshtoken
                  let header = authHeader.split(' ')[0]
                  if (header.toLowerCase() === 'bearer') {
                    let token = authHeader.split(' ')[1]
                    jwt.verify(token, refreshJwtSecret, (e, decoded) => {
                      if (decoded) {
                        jwtsign.generateAccessToken(decoded.data).then((newAccessToken) => {
                          res.setHeader('authorization', 'Bearer ' + newAccessToken)
                          res.status(403).json({
                            result: 'failure',
                            success: 0,
                            error: 1,
                            error_msg: 'Access token refreshed',
                            statusCode: 403,
                            errorCode: 403
                          })
                        })
                      }
                      if (e) {
                        res.status(400).json({
                          result: 'failure',
                          success: 0,
                          error: 1,
                          error_msg: 'AccessToken: ' + err.message + ' and RefreshToken: ' + e.message,
                          statusCode: 400,
                          errorCode: 400
                        })
                      }
                    })
                  } else {
                    res.status(401).json({
                      result: 'failure',
                      success: 0,
                      error: 1,
                      error_msg: 'AccessToken: ' + err.message + 'and Invalid RefreshToken header',
                      statusCode: 401,
                      errorCode: 401
                    })
                  }
                } else {
                  res.status(400).json({
                    result: 'failure',
                    success: 0,
                    error: 1,
                    error_msg: 'AccessToken: ' + err.message,
                    statusCode: 400,
                    errorCode: 400
                  })
                }
              }
            })
          } else {
            res.status(401).json({
              result: 'failure',
              success: 0,
              error: 1,
              error_msg: 'Invalid AccessToken header',
              statusCode: 401,
              errorCode: 401
            })
          }
        } else {
          let authHeader = req.headers.refreshtoken
          let header = authHeader.split(' ')[0]
          if (header.toLowerCase() === 'bearer') {
            let token = authHeader.split(' ')[1]
            jwt.verify(token, refreshJwtSecret, (e, decoded) => {
              if (decoded) {
                jwtsign.generateAccessToken(decoded.data).then((newAccessToken) => {
                  res.setHeader('authorization', 'Bearer ' + newAccessToken)
                  res.status(403).json({
                    result: 'failure',
                    success: 0,
                    error: 1,
                    error_msg: 'Access token refreshed',
                    statusCode: 403,
                    errorCode: 403
                  })
                })
              }
              if (e) {
                res.status(400).json({
                  result: 'failure',
                  success: 0,
                  error: 1,
                  error_msg: 'RefreshToken: ' + e.message,
                  statusCode: 400,
                  errorCode: 400
                })
              }
            })
          } else {
            res.status(401).json({
              result: 'failure',
              success: 0,
              error: 1,
              error_msg: 'Invalid RefreshToken header',
              statusCode: 401,
              errorCode: 401
            })
          }
        }
      }
    }
  }
}

export default jwtmw
