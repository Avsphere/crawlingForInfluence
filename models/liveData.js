const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const liveDataSchema = mongoose.Schema({
  metaVideo : { type : ObjectId },
  etag : { type : String },
  kind : { type : String },
  langauge : { type : String, default : 'unknown' },
  items : [{
    etag : { type : String },
    kind : { type : String },
    id : { type : String },
    snippet : {
      publishedAt : { type : Date },
      liveChatId : { type : String },
      type : { type : String },
      authorChannelId : { type : String },
      displayMessage : { type : String },
      textMessageDetails : { messageText : { type : String } }
    },
    authorDetails : {
        channelId : { type : String },
        channelUrl : { type : String },
        displayName : { type : String },
        profileImageUrl : { type : String },
        isVerified : { type : Boolean },
        isChatOwner : { type : Boolean },
        isChatSponsor : { type : Boolean },
        isChatModerator : { type : Boolean }
    }
  }]

})


module.exports = mongoose.model('LiveData', liveDataSchema);
