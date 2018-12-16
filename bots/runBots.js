const sitter = require('./sitter')
const crawler = require('./crawler')
const moment = require('moment')



const runCralwer = async() => {
  const c = await crawler()
}


const startCycle = async() => {
  try {
    console.log('Starting cycle', moment().format() )
    const c = await crawler()
    console.log('Cycle complete', moment().format())
    return true
  } catch ( e ) {
    console.error('Start cycle error', e)
    return false
  }
}


startCycle()
