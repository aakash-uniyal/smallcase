const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

mongoose.connect('mongodb://localhost/smallcase')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', () => {
    console.log('Connection established with MongoDB')
})

module.exports = mongoose