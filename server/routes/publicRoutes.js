const express = require ('express')
const router = express.Router();
const publicController = require('../controllers/publicController')


router.get('/profile/:id',publicController.getPublicProfile)

router.get('/bucket/:shareToken', publicController.getPublicBucketByToken);

module.exports = router