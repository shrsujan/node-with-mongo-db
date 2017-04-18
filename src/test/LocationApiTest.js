import supertest from 'supertest'
import {expect} from 'chai'
import app from '../server'
import fs from 'fs'

describe('Location Api test', function () {
  let token = null

  before(function (done) {
    new Promise((resolve, reject) => {
      let testLocation = {
        firstName: 'test',
        lastName: 'tester',
        email: 'location@test.com',
        password: 'locationtest123',
        deviceId: '123testdevice123'
      }
      supertest(app)
      .post('/register')
      .field('firstName', testLocation.firstName)
      .field('lastName', testLocation.lastName)
      .field('email', testLocation.email)
      .field('password', testLocation.password)
      .field('deviceId', testLocation.deviceId)
      .attach('profilePic', 'src/test/fixtures/image.jpg')
      .expect(200)
      .end(function (err, response) {
        if (err) {
          reject(err)
        }
        let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
        expect(res).to.be.an('object')
        expect(res).to.have.property('success', 1)
        expect(res).to.have.property('message', 'User registered successfully')
        expect(res).to.have.property('data').that.is.an('object')
        expect(res.data).to.have.property('firstName', testLocation.firstName)
        expect(res.data).to.have.property('lastName', testLocation.lastName)
        expect(res.data).to.have.property('email', testLocation.email)
        expect(res.data).to.have.property('password')
        expect(res.data).to.have.property('deviceId', testLocation.deviceId)
        expect(res.data).to.have.property('profilePic').that.is.a('string')
        fs.stat('src/public/images/users/' + res.data.profilePic, function (e, stats) {
          if (e) reject(e)
          fs.unlink('src/public/images/users/' + res.data.profilePic, function (err) {
            if (err) reject(err)
          })
        })
        resolve()
      })
    }).then(function () {
      let testLocation = {
        email: 'location@test.com',
        password: 'locationtest123'
      }
      supertest(app)
      .post('/login')
      .field('email', testLocation.email)
      .field('password', testLocation.password)
      .expect(200)
      .end(function (err, response) {
        if (err) {
          done(err)
        }
        let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
        let header = JSON.parse(JSON.stringify(response)).header
        expect(res).to.be.an('object')
        expect(res).to.have.property('success', 1)
        expect(res).to.have.property('message', 'Login successful')
        expect(header).to.have.property('authorization')
        token = header.authorization
        done()
      })
    }).catch(function (e) {
      done(e)
    })
  })

  describe('for adding new location', function () {
    it('returns an array of errors when mandatory fields are not provided', function (done) {
      supertest(app)
      .post('/location/insert')
      .set('authorization', token)
      .expect(400)
      .end(function (err, response) {
        if (err) {
          done(err)
        } else if (response) {
          let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
          expect(res).to.be.an('object')
          expect(res).to.have.property('success', 0)
          expect(res).to.have.property('error', 1)
          expect(res).to.have.property('errorMsg').that.is.an('array').and.to.include('Country name not provided', 'Zip code not provided', 'State not provided', 'Nearest biggest city not provided', 'City not provided', 'Latitude not provided', 'Longitude not provided', 'Street address not provided', 'Place id not provided')
          done()
        } else {
          done('Error in location adding test')
        }
      })
    })

    it('adds new location to database', function (done) {
      let testLocation = {
        country: 'Nepal',
        zip: 44700,
        state: 'Bagmati',
        nearestBiggestCity: 'Kathmandu',
        city: 'Lalitpur',
        lat: 28.88,
        long: -85.86,
        streetAddress: 'Pulchowk',
        placeId: '123testPlaceId123'
      }
      supertest(app)
      .post('/location/insert')
      .set('authorization', token)
      .send(testLocation)
      .expect(200)
      .end(function (err, response) {
        if (err) {
          done(err)
        }
        let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
        expect(res).to.be.an('object')
        expect(res).to.have.property('success', 1)
        expect(res).to.have.property('message', 'Location inserted successfully')
        expect(res).to.have.property('data').that.is.an('object')
        expect(res.data).to.have.property('country', testLocation.country.toLowerCase())
        expect(res.data).to.have.property('zip', testLocation.zip)
        expect(res.data).to.have.property('state', testLocation.state.toLowerCase())
        expect(res.data).to.have.property('nearestBiggestCity', testLocation.nearestBiggestCity.toLowerCase())
        expect(res.data).to.have.property('city', testLocation.city.toLowerCase())
        expect(res.data).to.have.property('lat', testLocation.lat)
        expect(res.data).to.have.property('long', testLocation.long)
        expect(res.data).to.have.property('streetAddress', testLocation.streetAddress.toLowerCase())
        expect(res.data).to.have.property('placeId', testLocation.placeId.toLowerCase())
        done()
      })
    })
  })
})
