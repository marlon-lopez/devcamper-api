const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middlewares/async')
const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const geoCoder = require('../utils/geocoder')

// @desc    Get all the bootcamps
// @route   GET /api/v1/bootcamps
// @acces   public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  console.log(req.headers)
  //make a copy of req.query
  res.status(200).json(res.advancedResults)
})

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @acces   public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const data = await Bootcamp.findById(req.params.id)

  //if there is not a object in DB with the id
  if (!data)
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404),
    )
  //if it success
  res.status(200).json({ success: true, data: data })
})

// @desc    Create single bootcamp
// @route   POST /api/v1/bootcamps
// @acces   private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //add user ID to the body
  req.body.user = req.user.id

  //check for published boootcamps
  const publishedBootcamps = await Bootcamp.findOne({ user: req.user.id })

  //if the user is not an admin he cannot add more than one bootcamp

  if (publishedBootcamps && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already published a bootcamp`,
        400,
      ),
    )
  }

  const data = await Bootcamp.create(req.body)
  res.status(200).json({ success: true, data: data })
})

// @desc    update single bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @acces   private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let data = await Bootcamp.findById(req.params.id)

  //if there is not a object in DB with the id
  if (!data)
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404),
    )

  //make sure is bootcamp owner
  if (data.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401,
      ),
    )
  }

  data = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  //if it success
  res.status(201).json({ success: true, data: data })
})

// @desc    Delete single bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @acces   private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const data = await Bootcamp.findById(req.params.id)
  if (!data)
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404),
    )

  if (data.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401,
      ),
    )
  }

  data.remove()
  res.status(201).json({ success: true, data: data })
})

// @desc    GET bootcamps within a radius
// @route   DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @acces   private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params

  //Get latitud and longitud from geocoder
  const loc = await geoCoder.geocode(zipcode)
  const lat = loc[0].latitude
  const long = loc[0].longitude

  //calc the radius using radians
  //divide the distance by the earth radius
  //earth raidus = 6,378 km

  const radius = distance / 6378

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  })
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
})

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @acces   private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp)
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404),
    )
  if (data.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401,
      ),
    )
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400))
  }
  //check if its a photo
  const file = req.files.file
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload a image file`, 400))
  }

  //check the size is less than 1mb
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a image less than ${process.env.MAX_FILE_UPLOAD}`,
        400,
      ),
    )
  }

  //create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  //upload the photo
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse(`Problems with the file upload`, 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
    res.status(200).json({ success: true, data: file.name })
  })
})
