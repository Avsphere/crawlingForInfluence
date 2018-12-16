//Doc reference https://developers.google.com/youtube/v3/docs/search/list#examples
const { google } = require('googleapis');
const ytService = google.youtube('v3')

const init_getLiveVideoIds = (oauthClient) => async({ maxResults, order, pageToken, publishedBefore, publishedAfter}) => {
  try {
    const query = {
      auth : oauthClient,
      part : "snippet",
      maxResults : maxResults || 5,
      // order : order || 'date',
      type : 'video',
      regionCode : 'US',
      relevanceLanguage : 'en',
      eventType : 'live'
    }
    if ( pageToken && pageToken.length > 1 ) { query['pageToken'] = pageToken }
    if ( publishedBefore ) { query['publishedBefore'] = publishedBefore.format() }
    if ( publishedAfter ) { query['publishedAfter'] = publishedAfter.format() }

    const { data } = await ytService.search.list(query)
    return { nextPageToken : data.nextPageToken, ids : data.items.map( ({ id }) => id.videoId ) }
  } catch ( e ) {
    console.error(`Error in getLiveVideos`, e)
    throw new Error(e);
  }
}


module.exports = init_getLiveVideoIds
