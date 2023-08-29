# Όbelisk λ

A request router (powered by [`find-my-way`](https://github.com/delvedor/find-my-way) - used by Fastify and Restify) for "monolithic" Lambdas.

Make sure you actually want a "fat function", then:

```
npm i obelisk-lambda
```

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

Easily deployed with [Architect](https://arc.codes).
