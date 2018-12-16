process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV  : "dev"
const config = require('config')
const authorize = require('../helpers/authorize')
const MetaVideo = require('../models/metaVideo')
const mongoose = require('mongoose')

mongoose.connect(config.db.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database!"); resetProcessed(); },
  err => { console.log("ERROR - Database connection failed")}
)


const resetProcessed = async() => {
  try {
    const metaVideos = await MetaVideo.find({}).exec()
    await Promise.all( metaVideos.map( m => { m.processed = false; return m.save() }) )

    console.log('All done!')
    process.exit(0)
  } catch (e) {
    console.error("Reset processed error ", e)
    process.exit(0)
  }

}
