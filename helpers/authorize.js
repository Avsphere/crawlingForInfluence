const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const opn = require('opn');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile')
const getToken = require('./getToken')

const KEYPATH = path.join(__dirname, '../config/clientSecret.json')

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


module.exports = authorize;
