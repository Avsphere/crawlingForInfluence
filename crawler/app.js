process.env.NODE_ENV = "dev"
const authorize = require('../helpers/authorize')
const MetaVideo = require('../models/metaVideo')
const mongoose = require('mongoose')
const config = require('config')

mongoose.connect(config.db.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database!") },
  err => { console.log("ERROR - Database connection failed")}
)



const Crawler = async() => {
  try {
    const oauthClient = await authorize()
    const getLiveVideoIds = require('../api/getLiveVideoIds')(oauthClient)
    const getVideosById = require('../api/getVideosById')(oauthClient)
    const { ids, nextPageToken } = await getLiveVideoIds({ maxResults : 50 })
    let liveVideos = await Promise.all( ids.map( id => getVideosById(ids) ) )
    await MetaVideo.insertMany(...liveVideos)
    process.exit(0)
  } catch (e) {
    console.error("Crawer error", e)
  }


}


const c = Crawler()
