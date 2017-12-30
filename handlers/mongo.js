const mongoose = require('mongoose'),
      config = require('config')

mongoose.Promise = require('bluebird')
murl = config.get("mongo.url")
mdb = config.get("mongo.db")

mongoose.connect(murl + mdb)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', () => {
    console.log('Connection established with MongoDB')
})

module.exports = mongoose