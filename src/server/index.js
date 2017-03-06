import express from 'express'
import bodyParser from 'body-parser'
import config from '../config/config'
import log from 'winston-logger-setup'
import routes from './routes'
import http from 'http'
import jwt from '../middlewares/jwt'

let app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

jwt.authMiddleware(app)

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
