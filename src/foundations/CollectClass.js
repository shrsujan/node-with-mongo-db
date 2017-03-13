import formidable from 'formidable'
import googleCaja from 'google-caja'

const sanitize = googleCaja.sanitize

export default class CollectClass {

  constructor () {
    this.body = []
    this.query = []
    this.params = []
    this.files = []
    this.mandatoryFields = {}
    this.providedFields = {}
    this.checkStatus = true
  }

  setBody (body) {
    this.body = body
  }

  setQuery (query) {
    this.query = query
  }

  setParams (params) {
    this.params = params
  }

  setFiles (files) {
    this.files = files
  }

  setMandatoryFields (mandatoryFields) {
    this.mandatoryFields = mandatoryFields
  }

  setProvidedFields (providedFields) {
    this.providedFields = providedFields
  }

  setCheckStatus (status) {
    this.checkStatus = status
  }

  multipart (req) {
    return new Promise((resolve, reject) => {
      if ((req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put') && req.headers['content-type'] && req.headers['content-type'].substr(0, 9) === 'multipart') {
        let form = formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err)
          } else {
            req.body = fields
            req.files = files
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  group (req) {
    return new Promise((resolve, reject) => {
      try {
        var data = {}
        this.body.forEach(function (body) {
          if (typeof (req.body[body]) !== 'undefined') {
            if (typeof (req.body[body]) === 'object') {
              data[body] = JSON.parse(sanitize(JSON.stringify(req.body[body])))
            } else {
              data[body] = sanitize(req.body[body])
            }
          }
        })
        this.query.forEach(function (query) {
          if (typeof (req.query[query]) !== 'undefined') {
            data[query] = sanitize(req.query[query])
          }
        })
        this.params.forEach(function (params) {
          if (typeof (req.params[params]) !== 'undefined') {
            data[params] = sanitize(req.params[params])
          }
        })
        this.files.forEach(function (files) {
          if (typeof (req.files) !== 'undefined') {
            if (typeof (req.files[files]) !== 'undefined') {
              data[files] = req.files[files]
            }
          }
        })
        this.providedFields = data
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  check () {
    return new Promise((resolve, reject) => {
      let errorArr = []
      for (var entry in this.mandatoryFields) {
        if (!this.providedFields[entry]) {
          errorArr.push(this.mandatoryFields[entry])
          // reject(this.mandatoryFields[entry])
        }
      }
      if (errorArr.length > 0) {
        reject(errorArr)
      } else {
        resolve()
      }
    })
  }

  collect (req) {
    return new Promise((resolve, reject) => {
      this.multipart(req).then(() => {
        this.group(req).then(() => {
          this.check().then(() => {
            resolve(this.providedFields)
          }).catch((err) => {
            reject(err)
          })
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }
}
