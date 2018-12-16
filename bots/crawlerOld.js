process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV  : "dev"
const config = require('config');
const authorize = require('../helpers/authorize')
const MetaVideo = require('../models/metaVideo')
const mongoose = require('mongoose');
const botOrchestrator = require('./botOrchestrator.js')
const delay = require('../helpers/delay')
const moment = require('moment')
const { minConcurrentViewers, maxConcurrentViewers, maxDateDiff } = require('../helpers/liveVideoStats')


const allIds = []
let maxDate_min = 0;

const crawler = async(crawlsLeft=100, crawlDelay=1000*60*60*2, jobsLeft=10) => {
  console.log('Starting up a crawler')
  const pullLiveVideos = async(n=20, publishedBefore, publishedAfter, pageToken='') => {
    const oauthClient = await authorize()
    const getLiveVideoIds = require('../api/getLiveVideoIds')(oauthClient)
    const getVideosById = require('../api/getVideosById')(oauthClient)
    const { ids, nextPageToken } = await getLiveVideoIds({
       maxResults : n, pageToken : pageToken,
       publishedAfter : publishedAfter, publishedBefore : publishedBefore
     })
    const liveVideos = await getVideosById(ids)
    return { liveVideos : liveVideos, nextPageToken : nextPageToken }
  }
  const doCrawl = async(pullSize=50) => {
    while (crawlsLeft > 0 ) {
      let publishedAfter = moment().subtract(10, 'minutes'), publishedBefore = moment();
      let multiplier = 4, windowSize = 0, totalVideos = 0; //zipfs dist.
      const previousVideos = await MetaVideo.find({}).select('id').exec()
      const previousVideoIds = previousVideos.map( v => v.id )
      // console.log(previousVideoIds)


      while( jobsLeft > 0 && windowSize < 100000 ) {
        const { liveVideos, nextPageToken } = await pullLiveVideos(pullSize, publishedBefore, publishedAfter)
        totalVideos += liveVideos.length
        windowSize = Math.floor( Math.pow(2, multiplier) )
        publishedBefore = moment(publishedAfter)
        publishedAfter = publishedAfter.subtract(windowSize, 'minutes')


        const fitVideos = liveVideos
          .filter( v => v.liveStreamingDetails.hasOwnProperty('concurrentViewers') && v.liveStreamingDetails.hasOwnProperty('activeLiveChatId')
            && v.liveStreamingDetails.concurrentViewers > 200 &&  v.liveStreamingDetails.concurrentViewers < 10000 && !previousVideoIds.includes(v.id) )



         if ( fitVideos.length < pullSize / 2 ) {  multiplier += .5 }

         fitVideos.forEach( v => allIds.push(v.id) )
         jobsLeft -= fitVideos.length

        console.log(allIds.length, Array.from( new Set(allIds) ).length )
        console.log(`Current multiplier: ${multiplier}`)
        console.log( 'windowSize: ',  windowSize )
        console.log(`Published Before ${publishedBefore.format('dd, h:mm:ss a') } Published After ${publishedAfter.format('dd, h:mm:ss a') }`)
        console.log("MIN VIEWERS: ", minConcurrentViewers(fitVideos) )
        console.log("MAX VIEWERS: ", maxConcurrentViewers(fitVideos) )
        console.log('FIT LENGTH:', fitVideos.length)
        console.log('\n\n\n')
        await Promise.all( fitVideos.map( v => MetaVideo(v).save() ) )
        await delay(500)
      }

      console.log(`Crawler is taking a break, videos searched : ${totalVideos} jobsLeft : ${jobsLeft}`)
      botOrchestrator.emit('workReady')
      crawlsLeft--;
      await delay(crawlDelay)
    }
  }
  try {
    await mongoose.connect(config.db.connectionString, { useNewUrlParser : true })
    await doCrawl()
  } catch (e) {
    console.error("Crawler error", e)
  }


}


module.exports = crawler;
