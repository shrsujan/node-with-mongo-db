import bcrypt from 'bcrypt'
import config from '../config/config'

let saltRounds = config.bcrypt.saltRounds || 10

export default {
  generate: (plainTextPassword) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
        if (hash) {
          resolve(hash)
        } else if (err) {
          reject(err)
        } else {
          reject('passwordModule: Unexpected Error at Generate')
        }
      })
    })
  },

  compare: (credentials, model) => {
    return new Promise((resolve, reject) => {
      model.findOne({email: credentials.email}, function (err, user) {
        if (err) {
          reject(err)
        } else if (user) {
          bcrypt.compare(credentials.password, user.password, (err, res) => {
            if (res) {
              resolve(JSON.parse(JSON.stringify(user)))
            } else if (err) {
              reject(err)
            } else {
              reject('Username/Password incorrect')
            }
          })
        } else {
          reject('Username/Password incorrect')
        }
      })
    })
  }
}
