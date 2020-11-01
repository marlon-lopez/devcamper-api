const NodeGeocoder = require('node-geocoder')
const options = {
  provider: process.env.GEOCODER_API,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
}
const geoCoder = NodeGeocoder(options)

module.exports = geoCoder
