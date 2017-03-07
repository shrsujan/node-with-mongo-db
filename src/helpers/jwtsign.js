import jwt from 'jsonwebtoken'
import config from '../config/config'

exports.generateAccessToken = (credentials) => {
  return new Promise((resolve, reject) => {
    let accessToken = jwt.sign({data: credentials}, config.jwt.jwtSecret, {expiresIn: 60 * config.jwt.accessExpInMin})
    if (accessToken) {
      resolve(accessToken)
    } else {
      reject('generateAccessToken: Unexpected error during token generation')
    }
  })
}

exports.generateRefreshToken = (credentials) => {
  return new Promise((resolve, reject) => {
    let refreshToken = jwt.sign({data: credentials}, config.jwt.refreshJwtSecret, {expiresIn: 60 * config.jwt.refreshExpInMin})
    if (refreshToken) {
      resolve(refreshToken)
    } else {
      reject('generateRefreshToken: Unexpected error during token generation')
    }
  })
}
