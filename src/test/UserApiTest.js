import {expect} from 'chai'
import supertest from 'supertest'
import app from '../server'
import fs from 'fs'

describe('User Api test', function () {
  describe('for register', function () {
    it('returns an array of errors when mandatory fields are not provided', function (done) {
      supertest(app)
      .post('/register')
      .expect(400)
      .end(function (err, response) {
        if (err) {
          done(err)
        } else if (response) {
          let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
          expect(res).to.be.an('object')
          expect(res).to.have.property('success', 0)
          expect(res).to.have.property('error', 1)
          expect(res).to.have.property('errorMsg').that.is.an('array').and.to.include('First name not provided', 'Last name not provided', 'Email not provided', 'Password not provided', 'Device Id not provided', 'Profile picture not provided')
          done()
        } else {
          done('Error in login test')
        }
      })
    })

    it('registers new user with unique email address', function (done) {
      let testUser = {
        firstName: 'test',
        lastName: 'tester',
        email: 'test@test.com',
        password: 'test123',
        deviceId: '123testdevice123'
      }
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
          done(err)
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
          if (e) done(e)
          fs.unlink('src/public/images/users/' + res.data.profilePic, function (err) {
            if (err) done(err)
          })
        })
        done()
      })
    })
  })

  describe('for login', function () {
    it('returns an array of errors when mandatory fields are not provided', function (done) {
      supertest(app)
      .post('/login')
      .expect(400)
      .end(function (err, response) {
        if (err) {
          done(err)
        } else if (response) {
          let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
          expect(res).to.be.an('object')
          expect(res).to.have.property('success', 0)
          expect(res).to.have.property('error', 1)
          expect(res).to.have.property('errorMsg').that.is.an('array').and.to.include('Email not provided', 'Password not provided')
          done()
        } else {
          done('Error in login test')
        }
      })
    })

    it('registers new user with unique email address', function (done) {
      let testUser = {
        email: 'test@test.com',
        password: 'test123'
      }
      supertest(app)
      .post('/login')
      .field('email', testUser.email)
      .field('password', testUser.password)
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
        done()
      })
    })
  })
})
