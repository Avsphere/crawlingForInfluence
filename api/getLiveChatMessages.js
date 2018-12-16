//Doc reference https://developers.google.com/youtube/v3/live/docs/liveChatMessages
const { google } = require('googleapis');
const ytService = google.youtube('v3')

const init_getLiveChatMessages = (oauthClient) => async({ liveChatId, maxResults, pageToken, pollMs}) => {
  try {
    const query = {
      auth : oauthClient,
      part : "snippet, authorDetails",
      pollingIntervalMillis : pollMs,
      liveChatId : liveChatId,
      maxResults : maxResults || 2000,
    }
    if ( pageToken ) { query['pageToken'] = pageToken }

    const { data } = await ytService.liveChatMessages.list(query)
    return data;
  } catch ( e ) {
    //fix me into checking if was a live errro
    console.error(`Error in api/getLiveChatMessagestLiveVideos`, e, e.code )

    throw new Error(e);
  }
}


module.exports = init_getLiveChatMessages
