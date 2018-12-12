const { google } = require('googleapis');
const ytService = google.youtube('v3')

const init_getPlaylist = (oauthClient) => async(playlistId) => {
  try {
    const { data } = await ytService.playlistItems.list({ auth : oauthClient, playlistId : playlistId.toString(), part : "snippet,contentDetails" })
    return data
  } catch ( e ) {
    console.error(`Error in getPlaylist`, e)
    throw new Error(e);
  }
}


module.exports = init_getPlaylist
