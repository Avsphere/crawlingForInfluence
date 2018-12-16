process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV  : "dev"
const config = require('config')
const authorize = require('../helpers/authorize')
const delay = require('../helpers/delay')
const MetaVideo = require('../models/metaVideo')
const LiveData = require('../models/liveData')
const mongoose = require('mongoose')
const franc = require('franc')



//The sitter pulls down the newest metaVideos with processed = false
//processed is set to true
//Each meta video is passed to sitAndListen(metaVideo)
//This pulls all of the chat messages, and appends them to the live data blob every 10 minutes until the video is over


const initCheckLanguage = (metaVideo) => {
  const videoId = metaVideo.id, totalMessages = []
  let enoughChecks = false, lastCheck = '';
  return (liveChatData) => {
    totalMessages.push( ...liveChatData.items.map( ({snippet}) => snippet.displayMessage) );
    if ( enoughChecks === true ) { return lastCheck }
    else if ( totalMessages.length > 500) {
      enoughChecks = true
      return lastCheck;
    }
    else if ( totalMessages.length > 50 ) {
      const lang = franc(totalMessages.join(' ') )
      lastCheck = lang;
      return lang
    }
    else {
      return 'unknown'
    }
  }
}

const initChatRate = () => {
  const chatLengths = [];
  let pullCount = 0, rate = 0;
  return (liveChatData) => {
    if ( liveChatData == 'justRate' ) {
      console.log('No liveChatData.', liveChatData, chatLengths)
      if ( chatLengths.length === 0 ) { return 0; }
      return chatLengths.reduce( (acc, item) => acc + item, 0) / chatLengths.length
    }
    pullCount++;
    if ( pullCount > 1 && liveChatData.items.length) {
      chatLengths.push(liveChatData.items.length)
      rate = chatLengths.reduce( (acc, item) => acc + item) / chatLengths.length
    }
    return { rate : rate, pullCount : pullCount }
  }
}




const sitter = async() => {
  try {
    const oauthClient = await authorize()
    const getLiveChatMessages = require('../api/getLiveChatMessages')(oauthClient)
    await mongoose.connect(config.db.connectionString, { useNewUrlParser : true })
    let sitsInProgress=0

    const sitAndListen = async(metaVideo, pollMs=1000*60) => {
      let nextPageToken, getChatRate = initChatRate(), checkLanguage = initCheckLanguage(metaVideo), totalMessages=0
      let videoIsLive = true, strongChatRate = true; //while loop conditions. strongChatRate is the amount of chats per cycle i.e. 10 messages per cycle
      const pullLiveChats = async(liveChatId, pageToken) => {
        try {
          return await getLiveChatMessages({liveChatId : liveChatId, maxResults : 200, pollMs : pollMs, pageToken : pageToken})
        } catch (e) {
          console.error(`pullLiveChats termination `, e.error)
          return false
        }
      }

      metaVideo.processed = true;
      metaVideo.sitting = true;
      await metaVideo.save();

      while (videoIsLive && strongChatRate) {
        const liveChatData = await pullLiveChats(metaVideo.liveStreamingDetails.activeLiveChatId, nextPageToken)
        const language = checkLanguage(liveChatData)
        const isEnglish = language === 'unknown' || language === 'eng' ? true : false

        if ( liveChatData !== false && isEnglish ) {
          nextPageToken = liveChatData.nextPageToken;
          metaVideo.language = language;
          const liveDoc = new LiveData({...liveChatData, language : language, metaVideo : metaVideo })
          metaVideo.liveData.push(liveDoc._id);

          totalMessages += liveChatData.items.length

          const { rate, pullCount } = getChatRate(liveChatData)
          pullCount > 5 && rate > 10 && rate < 120 ? metaVideo.prime = true : metaVideo.prime = false
          // pullCount < 5 || pullCount > 5 && rate > 10 ? strongChatRate = true : strongChatRate = false
          // console.log(`videoIsLive : ${videoIsLive}. strongChatRate ${strongChatRate}, pullcount : ${pullCount}`)
          console.log(`${metaVideo.snippet.title.substr(0, 15)} totalMessages : ${totalMessages}, chatrate : ${rate} lang : ${language}`)

          await liveDoc.save()
          await metaVideo.save();
          await delay(pollMs)
        } else {
          videoIsLive = false;
        }
      }
      metaVideo.sitting = false;
      await metaVideo.save();
      console.log(`\n Done sitting ${metaVideo.snippet.title.substr(0, 15)}, total messages : ${totalMessages}. docId : ${metaVideo._id} videoIsLive ${videoIsLive}`, 'Chat rate', getChatRate('justRate'), '\n\n' )
      console.log(`Sits in progress : ${sitsInProgress} `)
      sitsInProgress--;
      return metaVideo;
    }

    const metaVideos = await MetaVideo.find({ processed : false, sitting : false }).exec();
    sitsInProgress = metaVideos.length
    console.log(`Sitting on ${metaVideos.length} rooms`);
    await Promise.all( metaVideos.map( async(v) => sitAndListen(v) ) )
  } catch (e) {
    console.error("Sitter error", e)
  }


}

module.exports = sitter;
