import express from 'express'
import auth from './routes/auth.js'
import poker from './routes/poker.js'

export default (table) => {
  const app = express()

  app.use('/login', express.static('.www/app/login'))

  app.use(auth())

  app.use('/', express.static('.www/app/table'))

  app.use('/api/v1', poker(table))

  app.use(({ stack, message, code = 500 }, req, res, next) => {
    console.error(stack)
    res
      .status(code)
      .set('Content-Type', 'text/plain')
      .send(message)
  })

  return app
}
