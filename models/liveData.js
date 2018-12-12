const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const liveDataSchema = mongoose.Schema({

  id : { type : String },

})

liveDataSchema.pre('save', function(next)
{
    this.last_modified = new Date();;
    next();
});




module.exports = mongoose.model('LiveData', liveDataSchema);
