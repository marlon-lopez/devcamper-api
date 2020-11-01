//middlewares
// @desc    log request to console
const logger = (req, res, next) => {
  console.log(
    `method:${req.method}, url:${req.protocol}://${req.get('host')}${
      req.originalUrl
    }`,
  )
  next()
}

module.exports = logger
