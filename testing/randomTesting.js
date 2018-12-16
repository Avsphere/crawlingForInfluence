process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'

const mongoose = require('mongoose')
const config = require('config')
const MetaVideo = require('../models/metaVideo')
const LiveData = require('../models/liveData')

mongoose.connect(config.db.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database!"); run() },
  err => { console.log("ERROR - Database connection failed")}
)


const run = async() => {
  const d = await MetaVideo.find()
    .populate('liveData').limit(3).exec()
    .then( docs => docs.map(v => v.id) )
  console.log(d)
}
