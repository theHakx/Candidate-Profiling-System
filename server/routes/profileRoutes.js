const express =  require('express')

const router = express.Router()

const profileController = require('../controllers/profileController')
const shareController = require ('../controllers/shareController')
const {protect} = require('../middleware/auth')
const upload = require('../middleware/upload');

router.post('/create',protect,profileController.createProfile)
router.get('/me',protect,profileController.getProfile)
router.patch('/update',protect,profileController.updateProfile)
router.delete('/delete',protect,profileController.deleteProfile)
router.post('/picture', protect, upload.single('profilePicture'), profileController.uploadProfilePicture);
router.delete('/picture', protect, profileController.deleteProfilePicture);

//sharing routes
// router.post('/share/:targetId',protect,shareController.generateShareLink)



module.exports = router