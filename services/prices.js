const Promise = require('bluebird'),
      rp = require('request-promise'),
      config = require('config')
const eh = require('../handlers/errors')

module.exports = {
    getPrice: (ticker) => {
        const qs = {
            function: 'TIME_SERIES_INTRADAY',
            symbol: ticker,
            apikey: config.get("vendor.apikey"),
            interval: '1min'
        }

        return new Promise((resolve, reject) => {
            rp({
                method: 'GET',
                uri: config.get("vendor.uri"),
                qs: qs,
                json: true
            }).then(response => {
                if (!response["Error Message"]) {
                    if (!response['Time Series (1min)'][response['Meta Data']['3. Last Refreshed']]['4. close'])
                        reject(eh('BAD_REQUEST', 'Invalid ticker or data does not exist'))

                    resolve(response['Time Series (1min)'][response['Meta Data']['3. Last Refreshed']]['4. close'])
                } else {
                    reject(eh('BAD_REQUEST', response['Error Message']))
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
}