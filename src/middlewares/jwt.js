import jwt from 'jsonwebtoken'
import config from '../config/config'
import jwtsign from '../helpers/jwtsign'
import User from '../models/User'
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
        jwtmw.errorResponse(res, 401, 'Token not provided')
      } else {
        if (req.headers.authorization) {
          let authHeader = req.headers.authorization
          let header = authHeader.split(' ')[0]
          if (header.toLowerCase() === 'bearer') {
            let token = authHeader.split(' ')[1]
            jwt.verify(token, jwtSecret, (err, decoded) => {
              if (decoded) {
                User.findOne({id: decoded.id}, (error, user) => {
                  if (error) {
                    jwtmw.errorResponse(res, 500, 'Unexpected error: jwt middleware -> user model')
                  } else if (user) {
                    req.user = decoded.data
                    next()
                  } else {
                    jwtmw.errorResponse(res, 400, 'AccessToken: invalid token')
                  }
                })
              }
              if (err) {
                if (req.headers.refreshtoken) {
                  let authHeader = req.headers.refreshtoken
                  let header = authHeader.split(' ')[0]
                  if (header.toLowerCase() === 'bearer') {
                    let token = authHeader.split(' ')[1]
                    jwt.verify(token, refreshJwtSecret, (e, decoded) => {
                      if (decoded) {
                        User.findOne({id: decoded.id}, (error, user) => {
                          if (error) {
                            jwtmw.errorResponse(res, 500, 'Unexpected error: jwt middleware -> user model')
                          } else if (user) {
                            jwtsign.generateAccessToken(decoded.data).then((newAccessToken) => {
                              res.setHeader('authorization', 'Bearer ' + newAccessToken)
                              jwtmw.errorResponse(res, 403, 'Access token refreshed')
                            })
                          } else {
                            jwtmw.errorResponse(res, 400, 'AccessToken: invalid token')
                          }
                        })
                      }
                      if (e) {
                        jwtmw.errorResponse(res, 400, 'AccessToken: ' + err.message + ' and RefreshToken: ' + e.message)
                      }
                    })
                  } else {
                    jwtmw.errorResponse(res, 401, 'AccessToken: ' + err.message + 'and Invalid RefreshToken header')
                  }
                } else {
                  jwtmw.errorResponse(res, 400, 'AccessToken: ' + err.message)
                }
              }
            })
          } else {
            if (req.headers.refreshtoken) {
              let authHeader = req.headers.refreshtoken
              let header = authHeader.split(' ')[0]
              if (header.toLowerCase() === 'bearer') {
                let token = authHeader.split(' ')[1]
                jwt.verify(token, refreshJwtSecret, (e, decoded) => {
                  if (decoded) {
                    User.findOne({id: decoded.id}, (error, user) => {
                      if (error) {
                        jwtmw.errorResponse(res, 500, 'Unexpected error: jwt middleware -> user model')
                      } else if (user) {
                        jwtsign.generateAccessToken(decoded.data).then((newAccessToken) => {
                          res.setHeader('authorization', 'Bearer ' + newAccessToken)
                          jwtmw.errorResponse(res, 403, 'Access token refreshed')
                        })
                      } else {
                        jwtmw.errorResponse(res, 400, 'AccessToken: invalid token')
                      }
                    })
                  }
                  if (e) {
                    jwtmw.errorResponse(res, 400, 'Invalid AccessToken header' + ' and RefreshToken: ' + e.message)
                  }
                })
              } else {
                jwtmw.errorResponse(res, 401, 'Invalid AccessToken header' + 'and Invalid RefreshToken header')
              }
            } else {
              jwtmw.errorResponse(res, 400, 'Invalid AccessToken header')
            }
          }
        } else {
          let authHeader = req.headers.refreshtoken
          let header = authHeader.split(' ')[0]
          if (header.toLowerCase() === 'bearer') {
            let token = authHeader.split(' ')[1]
            jwt.verify(token, refreshJwtSecret, (e, decoded) => {
              if (decoded) {
                User.findOne({id: decoded.id}, (error, user) => {
                  if (error) {
                    jwtmw.errorResponse(res, 500, 'Unexpected error: jwt middleware -> user model')
                  } else if (user) {
                    jwtsign.generateAccessToken(decoded.data).then((newAccessToken) => {
                      res.setHeader('authorization', 'Bearer ' + newAccessToken)
                      jwtmw.errorResponse(res, 403, 'Access token refreshed')
                    })
                  } else {
                    jwtmw.errorResponse(res, 400, 'AccessToken: invalid token')
                  }
                })
              }
              if (e) {
                jwtmw.errorResponse(res, 400, 'RefreshToken: ' + e.message)
              }
            })
          } else {
            jwtmw.errorResponse(res, 401, 'Invalid RefreshToken header')
          }
        }
      }
    }
  },

  errorResponse: (res, code, errorMsg) => {
    res.status(code).json({
      result: 'failure',
      success: 0,
      error: 1,
      errorMsg,
      statusCode: code,
      errorCode: code
    })
  }
}

export default jwtmw
