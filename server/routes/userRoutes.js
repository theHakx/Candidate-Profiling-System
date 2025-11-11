const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const {protect} = require('../middleware/auth')



router.post('/signup', userController.signUp)
router.post('/login',userController.login)

module.exports = router