/* const express = require('express')
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')
const { route } = require('./bootcamps')

const Course = require('../models/Course')
const advancedResult = require('../middlewares/advancedResults')

const router = express.Router({ mergeParams: true })

const { protect, authorize } = require('../middlewares/auth')

router
  .route('/')
  .get(
    advancedResult(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses,
  )
  .post(protect, authorize('publisher', 'admin'), createCourse)
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router
 */

const express = require('express')
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')

const Course = require('../models/Course')

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middlewares/advancedResults')
const { protect, authorize } = require('../middlewares/auth')

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses,
  )
  .post(protect, authorize('publisher', 'admin'), addCourse)

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router
