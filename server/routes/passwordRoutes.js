const express = require('express')
const router = express.Router()

const {protect} = require('../middleware/auth')
const passwordController = require('../controllers/passwordController')

router.post('/forgotPassword',passwordController.forgotPassword)
router.patch('/resetPassword/:resetToken',passwordController.resetPassword)

module.exports = router