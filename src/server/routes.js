import express from 'express'
import users from '../controllers/UserController'
import mw from '../middlewares/response'

let router = express.Router()

router.post('/register', users.collectToRegister, users.register, mw.respond, mw.error)
router.post('/login', users.collectToLogin, users.authenticate, mw.respond, mw.error)
router.get('/user/list', users.list, mw.respond, mw.error)

router.all('/*', (req, res, next) => {
  res.status(400).json({
    success: 0,
    error: 1,
    error_msg: 'Unavailable route'
  })
})

export default router
