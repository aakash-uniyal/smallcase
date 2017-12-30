const mh = require('../handlers/mongo')

const schema = mh.Schema({
    ticker: String,
    quantity: Number,
    price: Number,
    date: String,
    type: String,
    portfolio: String
})

module.exports = mh.model('Trade', schema)