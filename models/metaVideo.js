const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const metaVideoSchema = mongoose.Schema({
  etag : { type : String },
  kind : { type : String },
  id : { type : String },
  processed : { type : Boolean, default : false },
  liveData : { type : ObjectId },
  snippet : {
    publishedAt : { type : Date },
    channelId : { type : String },
    title : { type : String },
    description : { type : String },
    channelTitle : { type : String },
    tags : [{ type : String }],
    categoryId : { type : String },
    liveBroadcastContent : { type : String },
    localized : {
      title : { type : String },
      description : { type : String }
    }
  },
  contentDetails : {
    duration : { type : String },
    dimension : { type : String },
    defintion : { type : String },
    caption : { type : String }
  },
  statistics : {
    viewCount : { type : Number },
    likeCount : { type : Number },
    dislikeCount : { type : Number },
    favoriteCount : { type : Number },
    commentCount : { type : Number }
  },
  liveStreamingDetails : {
    actualStartTime : { type : Date },
    concurrentViewers : { type : Number },
    activeLiveChatId : { type : String }
  }
})

metaVideoSchema.pre('save', function(next)
{
    this.last_modified = new Date();;
    next();
});




module.exports = mongoose.model('MetaVideo', metaVideoSchema);
