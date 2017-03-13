import express from 'express'
import bodyParser from 'body-parser'
import config from '../config/config'
import log from 'winston-logger-setup'
import routes from './routes'
import http from 'http'
import jwt from '../middlewares/jwt'
// import mongoose from 'mongoose'

let app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

jwt.authMiddleware(app, [
  '/user/list',
  '/location/*',
  '/job/*'
])

/**
mongoose.connect(config.database.connection.url)
mongoose.Promise = global.Promise

let User = mongoose.model('users', {name: String})
let Post = mongoose.model('posts', {
  title: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    default: null
  }
})
*/

/**
app.get('/add', (req, res, next) => {
  let newUser = new User({name: 'Sujan2'})
  newUser.save((err, data) => {
    if (err) {
      res.send(err)
    } else {
      let newPost = new Post({
        title: 'naya3',
        users: data._id
      })
      newPost.save((err, post) => {
        if (err) {
          res.send(err)
        } else {
          Post.populate(post, {path: 'users'}, (err, post) => {
            if (err) {
              res.send(err)
            } else {
              res.json({
                success: 1,
                post
              })
            }
          })
        }
      })
    }
  })
})
*/

app.use('/', routes)

let server = http.createServer(app)

server.listen(config.port)
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof config.port === 'string'
    ? 'Pipe ' + config.port
    : 'Port ' + config.port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(bind + ' requires elevated privileges', {})
      process.exit(1)
      break
    case 'EADDRINUSE':
      log.error(bind + ' is already in use', {})
      process.exit(1)
      break
    default:
      throw error
  }
})

server.on('listening', () => {
  let addr = server.address()
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  log.cnslLog.debug('Listening on ' + bind, {})
})

// app.listen(config.port, () => log.cnslLog.debug(`Listening on port ${config.port}`))
