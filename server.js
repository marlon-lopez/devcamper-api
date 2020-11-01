const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv').config({ path: './config/.env' })
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const morgan = require('morgan')
const connecDB = require('./config/db')
const errorHandler = require('./middlewares/error')
//Connect to database
connecDB()

//route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')
//initialize express
const app = express()

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
//add sanitize to prevent SQL injection sanitize data
app.use(mongoSanitize())

//set security headers
app.use(helmet())

//prevent XSS attacts
app.use(xss())

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 mins
  max: 100,
})

app.use(limiter)

//prevent htpp params pollution
app.use(hpp())

//enable CORS
app.use(cors())

//enable the fileuploading
app.use(fileUpload())

app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

//error handlerz
app.use(errorHandler)

//set static folder for photos
app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Server is in ${process.env.NODE_ENV} mode at ${PORT}`)
})

// handle unhandle promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`errro:${err.message}`)
  //close the server
  server.close(() => process.exit(1))
})
