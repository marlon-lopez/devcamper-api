const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middlewares/advancedResults')

//Include other resource routeer
const courseRouter = require('./courses')
const reviewsRouter = require('./reviews')

const router = express.Router()

//require the protection by token
const { protect, authorize } = require('../middlewares/auth')

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewsRouter)

// set all the routes
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

//get the distance
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

//upload a photo for the bootcamp
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router
