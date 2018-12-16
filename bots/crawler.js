process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV  : "dev"
const config = require('config');
const authorize = require('../helpers/authorize')
const MetaVideo = require('../models/metaVideo')
const mongoose = require('mongoose');
const delay = require('../helpers/delay')
const moment = require('moment')
const { minConcurrentViewers, maxConcurrentViewers, maxDateDiff } = require('../helpers/liveVideoStats')


const initPullLiveVideos = async() => {
  const oauthClient = await authorize()
  const getLiveVideoIds = require('../api/getLiveVideoIds')(oauthClient)
  const getVideosById = require('../api/getVideosById')(oauthClient)
  const initPullFn = (getLiveVideoIds, getVideosById) => async({
    maxResults, publishedBefore, publishedAfter, pageToken
  }) => {
    const { ids, nextPageToken } = await getLiveVideoIds({
       maxResults : maxResults, pageToken : pageToken,
       publishedAfter : publishedAfter, publishedBefore : publishedBefore
     })
    const liveVideos = await getVideosById(ids)
    return { liveVideos : liveVideos, nextPageToken : nextPageToken }
  }
  const pullLiveVideos = initPullFn(getLiveVideoIds, getVideosById)
  return pullLiveVideos
}

const printState = ({multiplier, windowSize, fitVideos, publishedBefore, publishedAfter, allVideoIds}) => {
  const duplicates = allVideoIds.length - Array.from( new Set(allVideoIds) ).length
  console.log(`Duplicate videos ${duplicates}`)
  console.log(`Multiplier: ${multiplier}  WindowSize : ${windowSize}`)
  console.log(`Published Before ${publishedBefore.format('dd, h:mm:ss a') } Published After ${publishedAfter.format('dd, h:mm:ss a') }`)
  console.log(`Min Viewers:  ${minConcurrentViewers(fitVideos)} Max Viewers : ${maxConcurrentViewers(fitVideos)}`)
  console.log(`Fit length ${fitVideos.length}`)
  console.log('\n\n\n')
}


const crawler = async({
  eventEmitter, totalCrawls, crawlDelay,
  totalJobs, maxResults,
  minViewersThreshold, maxViewersThreshold
}) => {
  try {
    console.log("starting crawler", eventEmitter, totalCrawls, crawlDelay, totalJobs)
    await mongoose.connect(config.db.connectionString, { useNewUrlParser : true })
    const mainState = {
      crawlsLeft : totalCrawls,
      jobsLeft : totalJobs,
      allVideoIds : [],
    }
    const pullLiveVideos = await initPullLiveVideos();

    const runCrawler = async() => {
      while ( mainState.crawlsLeft > 0 ) {
        let publishedAfter = moment().subtract(10, 'minutes'), publishedBefore = moment();
        const subState = {
          publishedAfter : moment().subtract(10, 'minutes'), publishedBefore : moment(),
          multiplier : 4, windowSize : 0, //follows zipfs pretty well
          totalVideos : 0,
          maxResults : maxResults,
          pageToken : ''
        }
        const previousVideoIds = await MetaVideo.find({}).select('id').exec().then( docs => docs.map( v => v.id ) )

        while ( mainState.jobsLeft > 0 && subState.windowSize < 100000 ) {
          const { liveVideos, nextPageToken } = await pullLiveVideos(subState)
          subState.totalVideos += liveVideos.length;
          subState.windowSize = Math.floor( Math.pow(2, subState.multiplier) );
          subState.publishedBefore = moment(subState.publishedAfter)
          subState.publishedAfter = subState.publishedAfter.subtract(subState.windowSize, 'minutes')

          const fitVideos = liveVideos
            .filter( v => v.liveStreamingDetails.hasOwnProperty('concurrentViewers') && v.liveStreamingDetails.hasOwnProperty('activeLiveChatId')
              && v.liveStreamingDetails.concurrentViewers > minViewersThreshold &&  v.liveStreamingDetails.concurrentViewers < maxViewersThreshold
              && !previousVideoIds.includes(v.id) );

          if ( fitVideos.length < maxResults / 2 ) {  subState.multiplier += .5 }
          fitVideos.forEach( v => mainState.allVideoIds.push(v.id) )
          mainState.jobsLeft -= fitVideos.length

          printState({ ...mainState, ...subState, fitVideos : fitVideos })
          await Promise.all( fitVideos.map( v => MetaVideo(v).save() ) )
          await delay(500)
        }

        if ( eventEmitter ) {
          console.log("Emitting event")
        }
        console.log(`Crawler is taking a break, videos searched : ${subState.totalVideos} jobsLeft : ${mainState.jobsLeft}`)
        mainState.crawlsLeft--;
        await delay(crawlDelay)
      }
    }

    return runCrawler
  } catch (e) {
    console.error('Crawler error!', e)
  }
}

crawler({
  eventEmitter : {},
  totalCrawls : 2,
  crawlDelay : 1000*60*60*2,
  totalJobs : 10,
  maxViewersThreshold : 10000,
  minViewersThreshold : 200,
  maxResults : 5
})

module.exports = crawler;
