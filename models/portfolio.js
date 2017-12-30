const mh = require('../handlers/mongo')

const schema = mh.Schema({
    return: Number
})

const portfolio = mh.model('Portfolio', schema)

module.exports = portfolio