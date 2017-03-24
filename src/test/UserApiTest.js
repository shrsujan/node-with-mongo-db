import {expect} from 'chai'
import supertest from 'supertest'
import app from '../server/index'

describe('User Api tests', function () {
  it('registers new user with unique email address', function (done) {
    supertest(app)
    .post('/register')
    .end(function (err, res) {
      if (err) {
        done(err)
      }
      let response = JSON.parse(JSON.stringify(res))
      console.log(response)
      expect(response.status).to.equal(200)
      done()
    })
  })
})
