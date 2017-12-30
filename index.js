const express = require('express'),
      bodyParser = require('body-parser'),
      config = require('config')
     
const app = express(),
      root = config.get("root"),
      port = config.get("port")

const stockRouter = require('./controllers/stockController'),
      portfolioRouter = require('./controllers/portfolioController')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(root + '/stocks', stockRouter)
app.use(root + '/portfolios', portfolioRouter)

app.listen(port)
console.log("Server started on port " + port)