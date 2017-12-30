const express = require('express'),
      bodyParser = require('body-parser')
     
const app = express(),
      root = '/api/v1'

const stockRouter = require('./controllers/stockController'),
      portfolioRouter = require('./controllers/portfolioController')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(root + '/stocks', stockRouter)
app.use(root + '/portfolios', portfolioRouter)

app.listen(3000)
console.log("Server started on port 3000")