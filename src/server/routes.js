import express from 'express'
import UC from '../controllers/UserController'
import LC from '../controllers/LocationController'
import PC from '../controllers/PostController'
import mw from '../middlewares/response'

let router = express.Router()

router.post('/register', UC.collectToRegister, UC.register, mw.respond, mw.error)
router.post('/login', UC.collectToLogin, UC.authenticate, mw.respond, mw.error)
router.get('/user/list', UC.list, mw.respond, mw.error)

router.post('/location/insert', LC.collectToInsert, LC.insert, mw.respond, mw.error)
router.get('/location/list', LC.list, mw.respond, mw.error)

router.post('/post/insert', PC.collectToInsert, PC.insert, mw.respond, mw.error)
router.get('/post/list', PC.list, mw.respond, mw.error)

router.all('/*', (req, res, next) => {
  res.status(400).json({
    success: 0,
    error: 1,
    error_msg: 'Unavailable route'
  })
})

export default router
