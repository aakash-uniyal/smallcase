const rh = require('../handlers/redis')

module.exports = {
    GETALL: (keys, callback) => {
        let p = []
        keys.forEach((key, idx) => {
            p.push(new Promise((resolve, reject) => {
                rh.get("stock:"+key, (err, result) => {
                    if (err) reject(err)
                    resolve({ k: key, v: result})
                })
            }))
        })

        Promise.all(p).then(val => callback(null, val)).catch(err => callback(err, null))
    }
}