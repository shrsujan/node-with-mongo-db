import mongoose from 'mongoose'
import config from '../config/config'
import log from 'winston-logger-setup'

mongoose.Promise = global.Promise
mongoose.connect(config.database.connection.url)

let db = mongoose.connection

db.on('error', () => {
  log.error('Connection error', {})
})
db.once('open', () => {
  log.cnslLog.debug(`Connection established: '${config.database.connection.url}'`, {})
})

exports.mongoose = db
exports.Schema = mongoose.Schema
