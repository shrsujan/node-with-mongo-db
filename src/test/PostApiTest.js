import supertest from 'supertest'
import {expect} from 'chai'
import app from '../server'
import fs from 'fs'

describe('Post Api test', function () {
  let token = null
  let testLocation = {
    country: 'Nepal',
    zip: 44600,
    state: 'Bagmati',
    nearestBiggestCity: 'Lalitpur',
    city: 'Kathmandu',
    lat: 27.88,
    long: -86.86,
    streetAddress: 'Teku',
    placeId: '123PlaceId123'
  }
  let testUser = {
    firstName: 'test',
    lastName: 'tester',
    email: 'post@test.com',
    password: 'posttest123',
    deviceId: '123testdevice123'
  }

  before(function (done) {
    new Promise((resolve, reject) => {
      supertest(app)
      .post('/register')
      .field('firstName', testUser.firstName)
      .field('lastName', testUser.lastName)
      .field('email', testUser.email)
      .field('password', testUser.password)
      .field('deviceId', testUser.deviceId)
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
        expect(res.data).to.have.property('firstName', testUser.firstName)
        expect(res.data).to.have.property('lastName', testUser.lastName)
        expect(res.data).to.have.property('email', testUser.email)
        expect(res.data).to.have.property('password')
        expect(res.data).to.have.property('deviceId', testUser.deviceId)
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
      return new Promise((resolve, reject) => {
        let testUser = {
          email: 'post@test.com',
          password: 'posttest123'
        }
        supertest(app)
        .post('/login')
        .field('email', testUser.email)
        .field('password', testUser.password)
        .expect(200)
        .end(function (err, response) {
          if (err) {
            reject(err)
          }
          let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
          let header = JSON.parse(JSON.stringify(response)).header
          expect(res).to.be.an('object')
          expect(res).to.have.property('success', 1)
          expect(res).to.have.property('message', 'Login successful')
          expect(header).to.have.property('authorization')
          token = header.authorization
          resolve()
        })
      })
    }).then(function () {
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
    }).catch(function (e) {
      done(e)
    })
  })

  describe('for adding new post', function () {
    let testPost = {
      category: 'IT',
      subCategory: 'Web',
      title: 'testPost',
      content: 'test post test post',
      salary: 12345,
      postId: '123'
    }

    it('returns an array of errors when mandatory fields are not provided', function (done) {
      supertest(app)
      .put('/job/' + testLocation.country + '/' + testLocation.state + '/' + testLocation.city + '/' + testPost.category + '/' + testPost.subCategory + '/' + testPost.postId)
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
          expect(res).to.have.property('errorMsg').that.is.an('array').and.to.include('Title not provided', 'Content not provided', 'Title image not provided', 'Salary not provided')
          done()
        } else {
          done('Error in post adding test')
        }
      })
    })

    it('adds new post to database', function (done) {
      supertest(app)
      .put('/job/' + testLocation.country + '/' + testLocation.state + '/' + testLocation.city + '/' + testPost.category + '/' + testPost.subCategory + '/' + testPost.postId)
      .set('authorization', token)
      .field('title', testPost.title)
      .field('content', testPost.content)
      .field('salary', testPost.salary)
      .attach('titleImage', 'src/test/fixtures/image.jpg')
      .expect(200)
      .end(function (err, response) {
        if (err) {
          done(err)
        }
        let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
        expect(res).to.be.an('object')
        expect(res).to.have.property('success', 1)
        expect(res).to.have.property('message', 'Post created successfully')
        expect(res).to.have.property('data').that.is.an('array')
        expect(res.data[0]).to.have.property('title', testPost.title)
        expect(res.data[0]).to.have.property('content', testPost.content)
        expect(res.data[0]).to.have.property('salary', testPost.salary)
        expect(res.data[0]).to.have.property('titleImage').that.is.a('string')
        expect(res.data[0]).to.have.property('category', testPost.category.toLowerCase())
        expect(res.data[0]).to.have.property('subCategory', testPost.subCategory.toLowerCase())
        expect(res.data[0]).to.have.property('postId', testPost.postId.toLowerCase())
        expect(res.data[0]).to.have.property('locationDetails').that.is.an('object')
        expect(res.data[0].locationDetails).to.have.property('country', testLocation.country.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('zip', testLocation.zip)
        expect(res.data[0].locationDetails).to.have.property('state', testLocation.state.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('nearestBiggestCity', testLocation.nearestBiggestCity.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('city', testLocation.city.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('lat', testLocation.lat)
        expect(res.data[0].locationDetails).to.have.property('long', testLocation.long)
        expect(res.data[0].locationDetails).to.have.property('streetAddress', testLocation.streetAddress.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('placeId', testLocation.placeId.toLowerCase())
        expect(res.data[0]).to.have.property('userDetails').that.is.an('object')
        expect(res.data[0].userDetails).to.have.property('firstName', testUser.firstName)
        expect(res.data[0].userDetails).to.have.property('lastName', testUser.lastName)
        expect(res.data[0].userDetails).to.have.property('email', testUser.email)
        expect(res.data[0].userDetails).to.not.have.property('password')
        expect(res.data[0].userDetails).to.have.property('deviceId', testUser.deviceId)
        expect(res.data[0].userDetails).to.have.property('profilePic').that.is.a('string')
        fs.stat('src/public/images/posts/' + res.data[0].titleImage, function (e, stats) {
          if (e) done(e)
          fs.unlink('src/public/images/posts/' + res.data[0].titleImage, function (err) {
            if (err) done(err)
          })
        })
        done()
      })
    })

    it('retrieves existing post from database', function (done) {
      supertest(app)
      .get('/job/' + testLocation.country + '/' + testLocation.state + '/' + testLocation.city + '/' + testPost.category + '/' + testPost.subCategory + '/' + testPost.postId)
      .set('authorization', token)
      .expect(200)
      .end(function (err, response) {
        if (err) {
          done(err)
        }
        let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
        expect(res).to.be.an('object')
        expect(res).to.have.property('success', 1)
        expect(res).to.have.property('message', 'Post retrieved successfully')
        expect(res).to.have.property('data').that.is.an('object')
        expect(res.data).to.have.property('title', testPost.title)
        expect(res.data).to.have.property('content', testPost.content)
        expect(res.data).to.have.property('salary', testPost.salary)
        expect(res.data).to.have.property('titleImage').that.is.a('string')
        expect(res.data).to.have.property('category', testPost.category.toLowerCase())
        expect(res.data).to.have.property('subCategory', testPost.subCategory.toLowerCase())
        expect(res.data).to.have.property('postId', testPost.postId.toLowerCase())
        expect(res.data).to.have.property('locationDetails').that.is.an('object')
        expect(res.data.locationDetails).to.have.property('country', testLocation.country.toLowerCase())
        expect(res.data.locationDetails).to.have.property('zip', testLocation.zip)
        expect(res.data.locationDetails).to.have.property('state', testLocation.state.toLowerCase())
        expect(res.data.locationDetails).to.have.property('nearestBiggestCity', testLocation.nearestBiggestCity.toLowerCase())
        expect(res.data.locationDetails).to.have.property('city', testLocation.city.toLowerCase())
        expect(res.data.locationDetails).to.have.property('lat', testLocation.lat)
        expect(res.data.locationDetails).to.have.property('long', testLocation.long)
        expect(res.data.locationDetails).to.have.property('streetAddress', testLocation.streetAddress.toLowerCase())
        expect(res.data.locationDetails).to.have.property('placeId', testLocation.placeId.toLowerCase())
        expect(res.data).to.have.property('userDetails').that.is.an('object')
        expect(res.data.userDetails).to.have.property('firstName', testUser.firstName)
        expect(res.data.userDetails).to.have.property('lastName', testUser.lastName)
        expect(res.data.userDetails).to.have.property('email', testUser.email)
        expect(res.data.userDetails).to.not.have.property('password')
        expect(res.data.userDetails).to.have.property('deviceId', testUser.deviceId)
        expect(res.data.userDetails).to.have.property('profilePic').that.is.a('string')
        done()
      })
    })

    it('updates existing post', function (done) {
      let newTestPost = {
        title: 'newTitle',
        content: 'new content',
        salary: 999999
      }

      supertest(app)
      .put('/job/' + testLocation.country + '/' + testLocation.state + '/' + testLocation.city + '/' + testPost.category + '/' + testPost.subCategory + '/' + testPost.postId)
      .set('authorization', token)
      .field('title', newTestPost.title)
      .field('content', newTestPost.content)
      .field('salary', newTestPost.salary)
      .attach('titleImage', 'src/test/fixtures/image.jpg')
      .expect(200)
      .end(function (err, response) {
        if (err) {
          done(err)
        }
        let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
        expect(res).to.be.an('object')
        expect(res).to.have.property('success', 1)
        expect(res).to.have.property('message', 'Post updated successfully')
        expect(res).to.have.property('data').that.is.an('array')
        expect(res.data[0]).to.have.property('title', newTestPost.title)
        expect(res.data[0]).to.have.property('content', newTestPost.content)
        expect(res.data[0]).to.have.property('salary', newTestPost.salary)
        expect(res.data[0]).to.have.property('titleImage').that.is.a('string')
        expect(res.data[0]).to.have.property('category', testPost.category.toLowerCase())
        expect(res.data[0]).to.have.property('subCategory', testPost.subCategory.toLowerCase())
        expect(res.data[0]).to.have.property('postId', testPost.postId.toLowerCase())
        expect(res.data[0]).to.have.property('locationDetails').that.is.an('object')
        expect(res.data[0].locationDetails).to.have.property('country', testLocation.country.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('zip', testLocation.zip)
        expect(res.data[0].locationDetails).to.have.property('state', testLocation.state.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('nearestBiggestCity', testLocation.nearestBiggestCity.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('city', testLocation.city.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('lat', testLocation.lat)
        expect(res.data[0].locationDetails).to.have.property('long', testLocation.long)
        expect(res.data[0].locationDetails).to.have.property('streetAddress', testLocation.streetAddress.toLowerCase())
        expect(res.data[0].locationDetails).to.have.property('placeId', testLocation.placeId.toLowerCase())
        expect(res.data[0]).to.have.property('userDetails').that.is.an('object')
        expect(res.data[0].userDetails).to.have.property('firstName', testUser.firstName)
        expect(res.data[0].userDetails).to.have.property('lastName', testUser.lastName)
        expect(res.data[0].userDetails).to.have.property('email', testUser.email)
        expect(res.data[0].userDetails).to.not.have.property('password')
        expect(res.data[0].userDetails).to.have.property('deviceId', testUser.deviceId)
        expect(res.data[0].userDetails).to.have.property('profilePic').that.is.a('string')
        fs.stat('src/public/images/posts/' + res.data[0].titleImage, function (e, stats) {
          if (e) done(e)
          fs.unlink('src/public/images/posts/' + res.data[0].titleImage, function (err) {
            if (err) done(err)
          })
        })
        done()
      })
    })

    it('deletes existing post', function (done) {
      supertest(app)
      .delete('/job/' + testLocation.country + '/' + testLocation.state + '/' + testLocation.city + '/' + testPost.category + '/' + testPost.subCategory + '/' + testPost.postId)
      .set('authorization', token)
      .expect(200)
      .end(function (err, response) {
        if (err) {
          done(err)
        }
        let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
        expect(res).to.be.an('object')
        expect(res).to.have.property('success', 1)
        expect(res).to.have.property('message', 'Post deleted successfully')
        done()
      })
    })
  })
})
