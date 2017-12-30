const redis = require('redis')
const client = redis.createClient()

client.on('connect', () => {
    console.log("Connection established with Redis")
})

module.exports = client