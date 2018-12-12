const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const opn = require('opn');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile')


const KEYPATH = path.join(__dirname, '../config/clientSecret.json')
const TOKENPATH = path.join(__dirname, '../config/token.json')
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

const getKey = async () => fs.existsSync(KEYPATH) ? await jsonfile.readFile(KEYPATH) : new Error("Key does not exist")

const initEndpoint = async () => {
  return new Promise( (resolve, reject) => {
    const server = http.createServer( (req, res) => {
      if ( req.url.includes('oauthCallback') ) {
        const qs = new url.URL(req.url, 'http://localhost:5555').searchParams;
        res.end(`Grabbed code!`)
        server.close()
        resolve( qs.get('code') )
      }
    }).listen(5555)
  })
}


const getToken = async() => {
  const key = await getKey()
  const { client_secret, client_id, redirectUrl } = key.web
  const oauthClient = new google.auth.OAuth2(client_id, client_secret, redirectUrl);
  const getNewToken = async() => {
    const authUrl = oauthClient.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log("Token was not found. Grab new: ", authUrl)
    const code = await initEndpoint()
    const { tokens } = await oauthClient.getToken(code)
    await jsonfile.writeFile(TOKENPATH, tokens)
    return tokens;
  }
  let token = {}
  if ( fs.existsSync(TOKENPATH) ) {
    token = await jsonfile.readFile(TOKENPATH)
  } else {
    token = await getNewToken(oauthClient)
  }
  return token;
}



module.exports = getToken;
