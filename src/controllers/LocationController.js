import log from 'winston-logger-setup'
import Location from '../models/Location'
import CollectClass from '../foundations/CollectClass'

exports.collectToInsert = (req, res, next) => {
  let collectInstance = new CollectClass()
  collectInstance.setBody([
    'country',
    'zip',
    'state',
    'nearestBiggestCity',
    'city',
    'lat',
    'long',
    'streetAddress',
    'placeId'
  ])
  collectInstance.setMandatoryFields({
    country: 'Country name not provided',
    zip: 'Zip code not provided',
    state: 'State not provided',
    nearestBiggestCity: 'Nearest biggest city not provided',
    city: 'City not provided',
    lat: 'Latitude not provided',
    long: 'Longitude not provided',
    streetAddress: 'Street address not provided',
    placeId: 'Place id not provided'
  })
  collectInstance.collect(req).then((data) => {
    req.locationData = data
    next()
  }).catch((err) => {
    next(err)
  })
}

exports.insert = (req, res, next) => {
  try {
    let newLocation = new Location(req.locationData)
    newLocation.save((err, data) => {
      if (err) {
        next(err)
      } else {
        req.cdata = {
          success: 1,
          message: 'Location inserted successfully',
          data
        }
        next()
      }
    })
  } catch (err) {
    let error = new Error(err)
    log.error(error, {})
    next(error)
  }
}

exports.list = (req, res, next) => {
  try {
    Location.find((err, data) => {
      if (err) {
        throw err
      } else {
        req.cdata = {
          success: 1,
          message: 'Locations retrieved successfully',
          data
        }
        next()
      }
    })
  } catch (err) {
    let error = new Error(err)
    log.error(error, {})
    next(error)
  }
}
