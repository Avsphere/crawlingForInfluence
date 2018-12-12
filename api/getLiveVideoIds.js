//Doc reference https://developers.google.com/youtube/v3/docs/search/list#examples
const { google } = require('googleapis');
const ytService = google.youtube('v3')

const init_getLiveVideoIds = (oauthClient) => async({ maxResults, order}) => {
  try {
    const { data } = await ytService.search.list({
      auth : oauthClient,
      part : "snippet",
      maxResults : maxResults || 5,
      order : order || 'viewCount',
      relevanceLanguage : 'en',
      type : 'video',
      eventType : 'live'
    })
    return { nextPageToken : data.nextPageToken, ids : data.items.map( ({ id }) => id.videoId ) }
  } catch ( e ) {
    console.error(`Error in getLiveVideos`, e)
    throw new Error(e);
  }
}


module.exports = init_getLiveVideoIds
