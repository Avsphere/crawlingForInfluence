process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV  : "dev"
const config = require('config');
const MetaVideo = require('../models/metaVideo')
const delay = require('../helpers/delay')


const globalScope = (doThrow) => {
  try {
    if ( doThrow ) {
      throw new Error('throwing error from within global scope')
    } else {
      return 0;
    }
  } catch( e ) {
    console.log('Caught in error in global scope')
    throw new Error('Handing error back to bigRunner')
  }

}


const bigRunner = () => {
  const throwError = () => { throw new Error('throwing Error') }
  try {
    // const basicThrow = globalScope(true)
    // console.log(`basicThrow ${basicThrow}`)
    throwError()
  } catch ( e ) {
    console.log('Big runner error', e);
  }
}


bigRunner()
