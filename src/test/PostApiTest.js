// import supertest from 'supertest'
// import {expect} from 'chai'
// import app from '../server'
// import fs from 'fs'

// describe('Post Api test', function () {
//   let token = null

//   before(function (done) {
//     new Promise((resolve, reject) => {
//       let testUser = {
//         firstName: 'test',
//         lastName: 'tester',
//         email: 'post@test.com',
//         password: 'posttest123',
//         deviceId: '123testdevice123'
//       }
//       supertest(app)
//       .post('/register')
//       .field('firstName', testUser.firstName)
//       .field('lastName', testUser.lastName)
//       .field('email', testUser.email)
//       .field('password', testUser.password)
//       .field('deviceId', testUser.deviceId)
//       .attach('profilePic', 'src/test/fixtures/image.jpg')
//       .expect(200)
//       .end(function (err, response) {
//         if (err) {
//           reject(err)
//         }
//         let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
//         expect(res).to.be.an('object')
//         expect(res).to.have.property('success', 1)
//         expect(res).to.have.property('message', 'User registered successfully')
//         expect(res).to.have.property('data').that.is.an('object')
//         expect(res.data).to.have.property('firstName', testUser.firstName)
//         expect(res.data).to.have.property('lastName', testUser.lastName)
//         expect(res.data).to.have.property('email', testUser.email)
//         expect(res.data).to.have.property('password')
//         expect(res.data).to.have.property('deviceId', testUser.deviceId)
//         expect(res.data).to.have.property('profilePic').that.is.a('string')
//         fs.stat('src/public/images/users/' + res.data.profilePic, function (e, stats) {
//           if (e) reject(e)
//           fs.unlink('src/public/images/users/' + res.data.profilePic, function (err) {
//             if (err) reject(err)
//           })
//         })
//         resolve()
//       })
//     }).then(function () {
//       let testUser = {
//         email: 'post@test.com',
//         password: 'posttest123'
//       }
//       supertest(app)
//       .post('/login')
//       .field('email', testUser.email)
//       .field('password', testUser.password)
//       .expect(200)
//       .end(function (err, response) {
//         if (err) {
//           done(err)
//         }
//         let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
//         let header = JSON.parse(JSON.stringify(response)).header
//         expect(res).to.be.an('object')
//         expect(res).to.have.property('success', 1)
//         expect(res).to.have.property('message', 'Login successful')
//         expect(header).to.have.property('authorization')
//         token = header.authorization
//         done()
//       })
//     }).catch(function (e) {
//       done(e)
//     })
//   })

//   describe('for adding new post', function () {
//     it('returns an array of errors when mandatory fields are not provided', function (done) {
//       supertest(app)
//       .post('/post/insert')
//       .set('authorization', token)
//       .expect(400)
//       .end(function (err, response) {
//         if (err) {
//           done(err)
//         } else if (response) {
//           let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
//           expect(res).to.be.an('object')
//           expect(res).to.have.property('success', 0)
//           expect(res).to.have.property('error', 1)
//           expect(res).to.have.property('errorMsg').that.is.an('array').and.to.include('Country name not provided', 'Zip code not provided', 'State not provided', 'Nearest biggest city not provided', 'City not provided', 'Latitude not provided', 'Longitude not provided', 'Street address not provided', 'Place id not provided')
//           done()
//         } else {
//           done('Error in post adding test')
//         }
//       })
//     })

//     it('adds new post to database', function (done) {
//       let testUser = {
//         country: 'Nepal',
//         zip: 44700,
//         state: 'Bagmati',
//         nearestBiggestCity: 'Kathmandu',
//         city: 'Lalitpur',
//         lat: 28.88,
//         long: -85.86,
//         streetAddress: 'Pulchowk',
//         placeId: '123testPlaceId123'
//       }
//       supertest(app)
//       .post('/post/insert')
//       .set('authorization', token)
//       .send(testUser)
//       .expect(200)
//       .end(function (err, response) {
//         if (err) {
//           done(err)
//         }
//         let res = JSON.parse(JSON.parse(JSON.stringify(response)).text)
//         expect(res).to.be.an('object')
//         expect(res).to.have.property('success', 1)
//         expect(res).to.have.property('message', 'Post inserted successfully')
//         expect(res).to.have.property('data').that.is.an('object')
//         expect(res.data).to.have.property('country', testUser.country.toLowerCase())
//         expect(res.data).to.have.property('zip', testUser.zip)
//         expect(res.data).to.have.property('state', testUser.state.toLowerCase())
//         expect(res.data).to.have.property('nearestBiggestCity', testUser.nearestBiggestCity.toLowerCase())
//         expect(res.data).to.have.property('city', testUser.city.toLowerCase())
//         expect(res.data).to.have.property('lat', testUser.lat)
//         expect(res.data).to.have.property('long', testUser.long)
//         expect(res.data).to.have.property('streetAddress', testUser.streetAddress.toLowerCase())
//         expect(res.data).to.have.property('placeId', testUser.placeId.toLowerCase())
//         done()
//       })
//     })
//   })
// })
