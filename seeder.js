const fs = require('fs')
const mongoose = require('mongoose')
//require dotenv and also load it
const dotenv = require('dotenv').config({ path: './config/.env' })

//load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

//connect to DB

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})

//Read the JSON files
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8'),
)
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8'),
)
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'),
)
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8'),
)

//Impor data to DB

const importData = async () => {
  try {
    await User.create(users)
    await Bootcamp.create(bootcamps)
    await Course.create(courses)
    await Review.create(reviews)
    //await Bootcamp.create(bootcamps)
    console.log('data imported...')
    process.exit()
  } catch (err) {
    console.log(err.message)
  }
}

//Delete data

const deleteData = async () => {
  try {
    await Course.deleteMany()
    await User.deleteMany()
    await Bootcamp.deleteMany()
    await Review.deleteMany()
    console.log('data has been destroyed')
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}
