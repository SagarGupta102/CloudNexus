const { v2: cloudinary } = require('cloudinary')

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

function configureCloudinary() {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  })

  return cloudinary
}

function uploadBuffer(buffer, options) {
  const client = configureCloudinary()
  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
    stream.end(buffer)
  })
}

module.exports = { isConfigured, uploadBuffer }
