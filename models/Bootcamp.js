const mongoose = require('mongoose')
const slugify = require('slugify')
const geoCoder = require('../utils/geocoder')

const BootcampScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'The name must be less than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please enter a descriptiom'],
      maxlength: [500, 'The name cannot be more than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please enter a valid URL with HTTP or HTTPS method',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'please enter a valid E-mail',
      ],
    },
    address: {
      type: String,
      required: [true, 'please write the address'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: [true, 'Please add a carrear'],
      enum: [
        'Mobile Development',
        'Web Development',
        'Data Science',
        'Business',
        'UI/UX',
        'Others',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rate must be at least 1'],
      max: [10, 'Rate must be less than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

//create bootcamp slug from the name
BootcampScheme.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

//geocoder and create location field
BootcampScheme.pre('save', async function (next) {
  const loc = await geoCoder.geocode(this.address)
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].state,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  }
  //DO not put the address in the DB because isn´t needed
  this.address = undefined
  next()
})
//cascade delete courses when a bootcamp is deleted
//prevent the remove and execute the function
BootcampScheme.pre('remove', async function (next) {
  //search for the courses that has the same id as the bootcamp so it belongs
  await this.model('Course').deleteMany({ bootcamp: this._id })
  next()
})

//Reverse populate with Virtuals
BootcampScheme.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
})

module.exports = mongoose.model('Bootcamp', BootcampScheme)
