const mh = require('../handlers/mongo')

const schema = mh.Schema({
    ticker: String,
    name: String
})
const stock = mh.model('Stock', schema)

module.exports = stock
