const express = require('express')
const sh = require('../models/stock'),
      ps = require('../services/prices'),
      vh = require('../services/validations'),
      eh = require('../handlers/errors'),
      rh = require('../handlers/redis')

const router = express.Router()

router.post('/add', (req, res) => {
    let a = vh(req.body, ["ticker", "name"])
    if (a.error) {
        let b = eh(a.message, "Missing params: " + a.params.join())
        res.status(b.code).send(b.message)
        return
    }

    console.log("fetch prices")
    ps.getPrice(req.body.ticker).then(price => {
        console.log(price)
        let s = new sh({ ticker: req.body.ticker, name: req.body.name })
        console.log(s)
        s.save((err, s) => {
            if (err) {
                let b = eh('SERVER_ERROR', err)
                res.status(b.code).send(b.message)
                return
            }
            console.log("added data to mongo")
            rh.set("stock:" + req.body.ticker, price, (err, reply) => {
                if (err) {
                    let b = eh('SERVER_ERROR', err)
                    res.status(b.code).send(b.message)
                    return
                }
                console.log("added data to redis")
                res.send({ success: true })
            })
        })
    }).catch(err => {
        res.status(500).send(err)
    })
})

router.get('/', (req, res) => {
    rh.keys("stock:*", (err, reply) => {
        if (err) {
            let b = eh('SERVER_ERROR', err)
            res.status(b.code).send(b.message)
            return
        }
        r = []
        for (let i = 0; i < reply.length; i++)
            r.push(reply[i].split(':')[1])
        res.send(r)
    })
})

module.exports = router