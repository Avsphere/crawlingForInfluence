const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const opn = require('opn');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile')
const getToken = require('./helpers/getToken')

const KEYPATH = path.join(__dirname, 'config/clientSecret.json')

const getKey = async() => fs.existsSync(KEYPATH) ? await jsonfile.readFile(KEYPATH) : new Error("Key does not exist")

const authorize = async() => {
  try {
    const key = await getKey()
    const { client_secret, client_id, redirectUrl } = key.web
    const oauthClient = new google.auth.OAuth2(client_id, client_secret, redirectUrl);

    oauthClient.credentials = await getToken();
    return oauthClient;
  } catch (e) {
    console.error("Something went wrong during authorization", e)
  }
}

const testApi = async (oauthclient) => {
  const test_getVideoById = async() => {
    const videosById = require('./api/getVideosById')(oauthclient)
    const randVideos = await videosById(['PFDcYi6bzC0', '9eWewdTkghM'])
    return `Should be 0 < videos as of 12/11/18 ${randVideos.length}`
  }
  const test_getPlaylist = async() => {
    const getPlaylist = require('./api/getPlaylist')(oauthclient)
    const randPlaylist = await getPlaylist('RDeEyOCavt4y4')
    console.log(randPlaylist)
  }
  const test_getLiveVideoIds = async() => {
    const getLiveVideoIds = require('./api/getLiveVideoIds')(oauthclient)
    const randVideos = await getLiveVideoIds({ maxResults : 3})
    console.log(randVideos)
  }
  // await test_getPlaylist()
  await test_getLiveVideoIds()

  return true;
}




const test = async() => {
  const client = await authorize();
  const api = await testApi(client)
}





test()
