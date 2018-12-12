const { google } = require('googleapis');
const ytService = google.youtube('v3')

const init_getVideoById = (oauthClient) => async(ids) => {
  try {
    const { data } = await ytService.videos.list({ auth : oauthClient, id : ids.toString(), part : "snippet,contentDetails,statistics,liveStreamingDetails" })
    return data.items
  } catch ( e ) {
    console.error(`Error in getVideoById`, e)
    throw new Error(e);
  }
}


module.exports = init_getVideoById 
