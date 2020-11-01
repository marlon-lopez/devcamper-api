const asyncHandler = require('../middlewares/async')
const ErrorResponse = require('../utils/errorResponse')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @acces   public

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId })

    res.status(200).json({
      succes: true,
      count: reviews.length,
      data: reviews,
    })
  } else {
    res.status(200).json(res.advancedResults)
  }
})

// @desc    Get Single Review
// @route   GET /api/v1/reviews/:id
// @acces   public

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  })
  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404),
    )
  }
  res.status(200).json({
    succes: true,
    data: review,
  })
})

// @desc    Add Review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @acces   Private

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with the id of ${req.params.bootcampId}`,
        404,
      ),
    )
  }

  const review = await Review.create(req.body)

  res.status(201).json({
    succes: true,
    data: review,
  })
})

// @desc    Update Review
// @route   PUT /api/v1/reviews/:id
// @acces   Private

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id)

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 401),
    )
  }

  //make sure the review belong to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`No authorize to update review`, 401))
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  res.status(201).json({
    succes: true,
    data: review,
  })
})

// @desc    Delete Review
// @route   DELETE /api/v1/reviews/:id
// @acces   Private

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 401),
    )
  }

  //make sure the review belong to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`No authorize to update review`, 401))
  }

  await review.remove()

  res.status(201).json({
    succes: true,
    data: {},
  })
})
