import util from 'util'
import log from 'winston-logger-setup'

export default {
  respond: (req, res, next) => {
    res.json(req.cdata)
  },

  error: (err, req, res, next) => {
    if (!err) {
      err = new Error('an error has occurred')
    }

    let code = err.status || 500

    log.error(util.format('Error [%s]: %s', req.url, err.message || err))

    if (code !== 404 && code !== 403) {
      // not logging traces for 404 and 403 errors
      if (err.stack) {
        log.error(util.inspect(err.stack))
      }
    }

    if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
      err.message = 'Error connecting upstream servers, please try again later.'
    }

    if (req.method === 'POST') {
      if (err.status === 403) {
        err.message = 'Session expired, please refresh the page to continue.'
      }
    }

    if (code === 401) {
      res.status(401).send()
    } else {
      res.json({
        result: 'failure',
        success: 0,
        error: 1,
        errorMsg: err.message || err,
        statusCode: code
      })
    }
  }
}
