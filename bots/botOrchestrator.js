const { EventEmitter } = require('events')
const orchestrator = new EventEmitter();
const moment = require('moment')


const primeAvailable = async() => {
  console.log('Prime video Available!\n\n\n\n')
}

const workReady = async() => {
  console.log(`Starting sitters`)

}

orchestrator.addListener('workReady', workReady )
orchestrator.addListener('primeAvailable', primeAvailable )




module.exports = orchestrator;
