# Όbelisk λ

A powerful request router for "monolithic" Lambdas.

Obelisk is powered by [`find-my-way`](https://github.com/delvedor/find-my-way) - used by Fastify and Restify. Obelisk adopts route-matching from `find-my-way` and provides a more Lambda-like interface for handlers.

## Install

Make sure you actually want a "fat function", then:

```
npm i obelisk-lambda
```

Requires Node.js v18+ (v16 works, but isn't recommended).

## Usage

lambda.js:
```js
import { ObeliskRouter } from "obelisk-lambda";

const router = new ObeliskRouter();

router.on(
  "GET",
  "/things/near/:lat-:lng/radius/:r",
  async ({ params, store, searchParams }) => {
    const { lat, long, r } = params

    // use coordinates and r (radius) to find the thing

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ params, store, searchParams }),
    };
  },
);

export const handler = router.mount();
```

A more elaborate router can be found in `./example/src/http/any-catchall/router.mjs`

## Deployment

The deploy target is an AWS Lambda behind a v2 HTTP API Gateway<sup>1</sup>.

These sort of HTTP Lambdas can easily deployed with [Architect](https://arc.codes) -- see `./example` for a sample Arc project<sup>2</sup>.

<sup>1</sup> v1 REST API Gateways are ***not*** supported. [Read about API Gateway v2 Lambda integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html).

<sup>2</sup> Obelisk is not currently compatible with Arc's Node.js helper library: `@architect/functions`. Specifically the `http()` and `http.async()` methods.

## API

### Constructor

Create a new Obelisk router.

#### `defaultRoute` is optional

Similar to `find-my-way`, you can specify a default handler that will be invoked when no route is matched or a matched route does not return.

```js
function defaultRoute ({ event, context, params, searchParams, store }) {
  // event and context are always available
  // params, searchParams, and store are only available if a route was matched
  console.log("defaultRoute", event.rawPath);

  return {
    statusCode: 404,
    headers: { "content-type": "text/plain; charset=utf8" },
    body: "not found.",
  };
}

const router = new ObeliskRouter({ defaultRoute });
```

### Instance Methods

#### `on(method, path, [options], handler, [store])`

Add a route to a router instance. See `find-my-way`'s [docs on `method` and `path`](https://github.com/delvedor/find-my-way#onmethods-path-opts-handler-store).

Note that handler functions are quite different from `find-my-way`. See [Handlers API](#handlers-api) below.

```js
router.on("GET", "/things/:id", ({ params }) => {
  const { id } = params;

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ thingId: id }),
  };
});
```

`options` are optional.

`on()` tries to maintain `find-my-way`'s method signature.

The optional `store` is not managed in the same way as `find-my-way` and will likely change in the future.

#### `mount()`

Create a Lambda handler function from the Obelisk router.

#### `prettyPrint()`

Calls the internal router's `prettyPrint` method to return an ASCII diagram of known routes.

### Instance Properties

These are mostly used internally and likely not helpful to developers at runtime. They are exposed for debugging purposes.

#### `defaultRoute`

The original `defaultRoute` passed into the constructor.

#### `handlers`

A `Map` of registered routes keyed by the value returned when registering a route.

#### `router`

The internal `FindMyWay` router instance.  
Note: provided route handlers are not actually registered with `router.router` and are managed in `router.handlers`.

## Handlers API

### Payload

#### `event` API Gateway 2.0 Event

Reference: [Working with AWS Lambda proxy integrations for HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html)

#### `context` Lambda Context

Reference: [AWS Lambda context object in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html)

#### `params` FindMyWay parsed path params

```js
router.on(
  "GET",
  "/things/near/:lat-:lng/radius/:r",
  async ({ params }) => {
    const { lat, lng, r } = params;
    const thing = await things.geoFind({ lat, lng }, r);
    
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ thing }),
    };
  },
);
```

#### `searchParams` FindMyWay's parsed search params

```js
router.on("GET", "/search", async ({ searchParams }) => {
  const { q } = searchParams

  // GET /search?rating=5&sale=true
  // q == { rating: '5', sale: 'true' }

  const results = await things.search({ query: q })

  return {
    statusCode: 200,
    headers: { "content-type": "text/html; charset=utf8" },
    body: renderSearchResults(results),
  };
});
```

#### `store` FindMyWay store

The `store` is currently passed through but not entirely functional as in `find-my-way`.

## FAQ

<details>
<summary>Why not use the typical <code>(req, res) => {}</code> signature?</summary>

1. IMO ordered arguments are a bummer
1. `res` isn't as simple as `return`ing data
1. a payload with many keys means Obelisk can easily attach AWS-provided data

`function (req, res) {}` has, and will continue, to serve long-lived Node processes well, but structured payloads are more ergonomic for evented "cloud functions".

</details>

<details>
<summary>How do I parse a POST body?</summary>

Decode the base64 body on the `event`. Assuming the body was sent as `x-www-form-urlencoded` (HTML forms are):

```js
import { parse } from "node:querystring"; // or your query string parser of choice

router.on("POST", "/form", ({ event }) => {
  // `event` is an APIGatewayProxyEventV2
  const data = Buffer.from(event.body, "base64").toString("utf8");
  const decoded = parse(data);
  // ...
```

</details>

<details>
<summary><code>defaultRoute</code> isn't getting some parameters, what gives?</summary>

If the original request doesn't match a route, `defaultRoute` is invoked with only the `event` and `context` objects.

</details>

<details>
<summary>What's the <code>store</code> for?</summary>

In `find-my-way` it is used to persist data when the route is registered and/or between handlers. This feature is only partially implemented in Obelisk.

</details>
