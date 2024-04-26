import test from 'tape'
import router from '../example/src/http/any-catchall/router.mjs'
import { ObeliskRouter } from '../index.js'
import { context, rootRequest } from './mocks.js'

test('ObeliskRouter', async (t) => {
  t.ok(router instanceof ObeliskRouter, 'router is an instance of ObeliskRouter')

  const lambdaHandler = router.mount()

  t.ok(typeof lambdaHandler === 'function', 'router.mount() returns a function')

  const result = await lambdaHandler(rootRequest, context)

  t.ok(result.statusCode === 200, 'result.statusCode is 200')
  t.ok(
    result.headers['content-type'] === 'text/html; charset=utf8',
    "result.headers['content-type'] is text/html; charset=utf8",
  )
  t.ok(
    result.body.includes('<title>Obelisk Lambda</title>'),
    'result.body includes <title>Obelisk Lambda</title>',
  )

  t.end()
})
