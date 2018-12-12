process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'

const mongoose = require('mongoose')
const config = require('config')
const MetaVideo = require('../models/metaVideo')

mongoose.connect(config.db.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database!"); clearDb() },
  err => { console.log("ERROR - Database connection failed")}
)

const clearCollection = (Model) => {
  return new Promise( (resolve, reject) => {
    Model.deleteMany({}, err => {
      if ( err ) { console.error(err); }
      else { console.log(Model.modelName, "Collection cleared!"); resolve(true); }
    })
  })
}
const dropIndexes = (Model) => {
  return new Promise( (resolve, reject) => {
    Model.collection.dropIndexes(err => {
      if ( err ) { console.error(err); }
      else { console.log(Model.modelName, "Dropped indexes!"); resolve(true); }
    })
  })
}


const clearDb = async() => {
  console.log("Clearing Db")
  await clearCollection(MetaVideo)
  await dropIndexes(MetaVideo)
  console.log("Db cleared")
  process.exit(0);

}
