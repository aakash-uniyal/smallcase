const express = require('express'),
      Promise = require('bluebird')
const pm = require('../models/portfolio'),
      eh = require('../handlers/errors')
      th = require('../models/trade'),
      prices = require('../services/prices'),
      rh = require('../handlers/redis'),
      vh = require('../services/validations'),
      utils = require('../services/utils')

const router = express.Router()

router.get('/:id', (req, res) => {
    pm.findById(req.params.id, (err, reply) => {
        if (err) {
            let b = eh('SERVER_ERROR', err)
            res.status(b.code).send(b.message)
            return
        }
        res.send(reply)
    })
})

router.post('/', (req, res) => {
    let p = new pm({return : 0})
    p.save((err, p) => {
        if (err) {
            let b = eh('SERVER_ERROR', err)
            res.status(b.code).send(b.message)
            return
        }
        res.send(p)
    })
})

router.post('/:id/addTrade', (req, res) => {
    let a = vh(req.body, ["ticker", "quantity", "type"])
    if (a.error) {
        let b = eh(a.message, "Missing params: " + a.params.join())
        res.status(b.code).send(b.message)
        return
    }

    rh.get("stock:" + req.body.ticker, (err, price) => {
        if (err) {
            let b = eh('SERVER_ERROR', err)
            res.status(b.code).send(b.message)
            return
        }

        console.log(req.body.ticker, price)
        let t = new th({ ticker: req.body.ticker, price: price, quantity: req.body.quantity, type: req.body.type, date: Date.now(), portfolio: req.params.id })
        t.save((err, t) => {
            if (err) {
                let b = eh('SERVER_ERROR', err)
                res.status(b.code).send(b.message)
                return
            }

            let n = t
            n.success = true
            res.send(n)
        })
    })
})

router.put('/:id/updateTrade/:tid', (req, res) => {
    let a = vh(req.params, ["id", "tid"])
    if (a.error) {
        let b = eh(a.message, "Missing params: " + a.params.join())
        res.status(b.code).send(b.message)
        return
    }

    let n = {}
    for (let i = 0; i < Object.keys(req.body).length; i++)
        n[Object.keys(req.body)[i]] = req.body[Object.keys(req.body)[i]]

    let p = new Promise((resolve, reject) => {
        if ("ticker" in req.body) {
            rh.get("stock:" + req.body.ticker, (err, price) => {
                if (err) reject(err)
                resolve(price)
            })
        } else
            resolve(null)
    })
    
    Promise.all([p]).then(price => {
        if (price)
            n.price = parseFloat((price instanceof Array) ? price[0] : price)
        console.log(n)
        th.findByIdAndUpdate(req.params.tid, n, (err, reply) => {
            if (err) {
                let b = eh('SERVER_ERROR', err)
                res.status(b.code).send(b.message)
                return
            }
    
            res.send({ success: true })
        })
    }).catch(err => {
        let b = eh('SERVER_ERROR', err)
        res.status(b.code).send(b.message)
        return
    })
    
})

router.delete('/:id/removeTrade/:tid', (req, res) => {
    let a = vh(req.params, ["id", "tid"])
    if (a.error) {
        let b = eh(a.message, "Missing params: " + a.params.join())
        res.status(b.code).send(b.message)
        return
    }

    th.findById(req.params.tid).remove((err, reply) => {
        if (err) {
            let b = eh('SERVER_ERROR', err)
            res.status(b.code).send(b.message)
            return
        }
        console.log(err, reply)
        if (reply.n)
            res.send({ success: true })
        else
            res.send({ success: false, message: "Trade does not exist" })
    })
})

router.get('/:id/holdings', (req, res) => {
    const qty = (t, q) => {
        if (t == "BUY") return q
        else return -q
    }

    th.find({ portfolio: req.params.id }, (err, results) => {
        if (err) {
            let b = eh('SERVER_ERROR', err)
            res.status(b.code).send(b.message)
            return
        }
        let o = {}
        for (let i = 0; i < results.length; i++) {
            console.log(results[i].ticker, results[i].ticker in o)
            if (results[i].ticker in o) {
                o[results[i].ticker] = { qty: o[results[i].ticker].qty+ qty(results[i].type, results[i].quantity), price: o[results[i].ticker].price +  results[i].price, len: o[results[i].ticker].len+1 }
            } else {
                o[results[i].ticker] = { qty: qty(results[i].type, results[i].quantity), price: results[i].price, len: 1 }
            }

            console.log(o[results[i].ticker])
        }

        for (let i = 0; i < Object.keys(o).length; i++) {
            o[Object.keys(o)[i]].price = o[Object.keys(o)[i]].price / o[Object.keys(o)[i]].len
            delete o[Object.keys(o)[i]]["len"]
        }
        res.send(o)
    })
})

router.get('/:id/returns', (req, res) => {
    th.find({ portfolio: req.params.id }, (err, results) => {
        if (err) {
            let b = eh('SERVER_ERROR', err)
            res.status(b.code).send(b.message)
            return
        }

        let investment = 0
        let o = {},
            total = {},
            prices = {}
        for (let i = results.length-1; i >= 0 ; i--) {
            if (results[i]) {
                if (o[results[i].ticker] == undefined) o[results[i].ticker] = 0
                if (total[results[i].ticker] == undefined) total[results[i].ticker] = 0
                if (!prices[results[i].ticker])
                    prices[results[i].ticker] = { p: results[i].price, len: 1 }
                else
                    prices[results[i].ticker] = { p: prices[results[i].ticker].p + results[i].price, len: prices[results[i].ticker].len + 1}

                if (results[i].type == "SELL"){
                    o[results[i].ticker] += (-results[i].quantity)
                    total[results[i].ticker] += (-results[i].quantity)
                } else {
                    investment += ((results[i].quantity + (o[results[i].ticker])) * results[i].price)
                    o[results[i].ticker] += results[i].quantity
                    if (o[results[i].ticker] > 0)
                        o[results[i].ticker] = 0
                        
                    total[results[i].ticker] += results[i].quantity
                }
            }
        }
        ret = 0
        counter = 0
        let p = []
        utils.GETALL(Object.keys(total), (err, results) => {
            if (err) {
                let b = eh('SERVER_ERROR', err)
                res.status(b.code).send(b.message)
                return
            }
            
            breakups = []
            for (let i = 0; i < results.length; i++) {
                avg = (prices[results[i].k].p / prices[results[i].k].len)
                ret += total[results[i].k]*parseFloat(results[i].v)
                breakups.push({
                    ticker: results[i].k,
                    roi: (((parseFloat(results[i].v) - avg)) / avg) * 100
                })
            }

            console.log(breakups)

            let actual = ((ret-investment) / investment) * 100
            res.send({ roi: actual, breakups: breakups })
        })


    })
})

module.exports = router