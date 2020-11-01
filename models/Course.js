const mongoose = require('mongoose')
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a brief description'],
    maxlength: [300, 'The description must be less than 200'],
  },
  weeks: {
    type: String,
    required: [true, 'Please specify the weeks it takes'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimun skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  scholarShipAvaliable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
})

//static method to get avg cost of courses tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log(`calculating avergaeCost`)
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ])
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    })
  } catch (err) {
    console.error(err)
  }
}

//Call get averageCost  after save
CourseSchema.post('save', async function () {
  await this.constructor.getAverageCost(this.bootcamp)
})

//Call get averageCost before remove
CourseSchema.pre('remove', async function () {
  await this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model('Course', CourseSchema)
