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
  const metaVideos = await MetaVideo.find({ language : 'eng' }).populate('liveData').exec()
  console.log(metaVideos.length)
  const flattenedItems = metaVideos
    .reduce( (acc, {liveData}) => acc.concat( liveData.map( ({items}) => items) ), [] )
    .reduce( (acc, itemLists) => acc.concat(itemLists), [] )
  const messageText = flattenedItems.map( ({snippet}) =>  snippet.displayMessage )
  console.log(messageText.length)
  process.exit(0);
}
