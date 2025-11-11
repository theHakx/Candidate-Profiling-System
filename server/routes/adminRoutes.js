const express = require('express')
const router = express.Router()

const {protect} = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')
const adminController = require('../controllers/adminControllers')

router.get('/getAllUsers',protect,isAdmin,adminController.getAllUsers)
router.get('/user/:id',protect,isAdmin,adminController.getUser)
router.post('/userCreate',protect,isAdmin,adminController.createUser)
router.patch('/userUpdate/:id',protect,isAdmin,adminController.updateUser)
router.delete('/userDelete/:id',protect,isAdmin,adminController.deleteUser)

// Admin routes for managing individual user profiles
router.get('/userProfiles', protect, isAdmin, adminController.getAllUserProfiles); // Get all profiles
router.get('/userProfiles/:id', protect, isAdmin, adminController.getProfileById); // Get single profile
router.patch('/userProfiles/:id', protect, isAdmin, adminController.updateProfileById); // Update single profile
router.delete('/userProfiles/:id', protect, isAdmin, adminController.deleteProfileById); // Delete single profile

module.exports = router