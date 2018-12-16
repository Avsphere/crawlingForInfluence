const moment = require('moment')

const averageViewers = (liveVideos) => {
  return liveVideos.reduce( (acc, item) => {

    console.log( typeof acc, item.liveStreamingDetails.hasOwnProperty('concurrentViewers') )
    if ( !item.liveStreamingDetails.hasOwnProperty('concurrentViewers') ) {
      item.liveStreamingDetails.concurrentViewers = 0
    }
    if ( typeof(acc) == 'number' ) {
      return  acc + Number.parseInt(item.liveStreamingDetails.concurrentViewers)
    }
    return ( Number.parseInt(acc.liveStreamingDetails.concurrentViewers) +  Number.parseInt(item.liveStreamingDetails.concurrentViewers) )

  })
}


const minConcurrentViewers = (liveVideos) => liveVideos.length > 0
? Math.min( ...liveVideos
  .filter( v => v.liveStreamingDetails.hasOwnProperty('concurrentViewers')  )
  .map( v => v.liveStreamingDetails.concurrentViewers) )
: 0

const maxConcurrentViewers = (liveVideos) => liveVideos.length > 0
? Math.max( ...liveVideos
  .filter( v => v.liveStreamingDetails.hasOwnProperty('concurrentViewers')  )
  .map( v => v.liveStreamingDetails.concurrentViewers) )
: 0

const avgConcurrentViewers = (liveVideos) => {
  if ( liveVideos.length < 1 ) { return 0 }
  return liveVideos
  .filter( v => v.liveStreamingDetails.hasOwnProperty('concurrentViewers')  )
  .reduce( (acc, item) => acc + item.liveStreamingDetails.concurrentViewers , 0)
}


const maxDateDiff = (liveVideos, metric='minutes') => liveVideos.length > 0
? Math.max( ...liveVideos.map( v =>  moment().diff(v.snippet.publishedAt, metric) ) )
: 0
module.exports = {
  minConcurrentViewers : minConcurrentViewers,
  maxConcurrentViewers : maxConcurrentViewers,
  avgConcurrentViewers : avgConcurrentViewers,
  maxDateDiff : maxDateDiff
}
