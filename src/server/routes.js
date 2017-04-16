import express from 'express'
import UC from '../controllers/UserController'
import LC from '../controllers/LocationController'
import PC from '../controllers/PostController'
import mw from '../middlewares/response'

let router = express.Router()

router.post('/register', UC.collectToRegister, UC.register, mw.respond, mw.error)
router.post('/login', UC.collectToLogin, UC.authenticate, mw.respond, mw.error)
// router.get('/user/list', UC.list, mw.respond, mw.error)

router.post('/location/insert', LC.collectToInsert, LC.insert, mw.respond, mw.error)
// router.get('/location/list', LC.list, mw.respond, mw.error)

// router.post('/job/insert', PC.collectToInsert, PC.insert, mw.respond, mw.error)
// router.get('/job/list', PC.list, mw.respond, mw.error)
router.get('/job/:country/:state/:city/:category/:subCategory/:postId', PC.collectToRetrieve, PC.postInformation, mw.respond, mw.error)
router.put('/job/:country/:state/:city/:category/:subCategory/:postId', PC.collectToEdit, PC.editInformation, mw.respond, mw.error)
router.delete('/job/:country/:state/:city/:category/:subCategory/:postId', PC.collectToRetrieve, PC.deletePost, mw.respond, mw.error)

router.all('/*', (req, res, next) => {
  res.status(400).json({
    success: 0,
    error: 1,
    error_msg: 'Unavailable route'
  })
})

export default router
