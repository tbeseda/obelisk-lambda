export default /*html*/ `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Obelisk Lambda</title>
	<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%23000222;' width='1' height='1'%3E%3C/rect%3E%3C/svg%3E">
	<link rel="stylesheet" href="//unpkg.com/@highlightjs/cdn-assets@11.7.0/styles/github-dark.min.css">
	<script src="//unpkg.com/@highlightjs/cdn-assets@11.7.0/highlight.min.js"></script>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			max-width: 78ch;
			padding: 3rem 1rem;
			margin: auto;
			font-size: 18px;
			line-height: 1.4;
			font-family: Avenir, source-sans-pro, sans-serif;
			background: #00011A;
			color: #CCC;
		}
		a {
			color: gold;
		}
		a:visited {
			color: goldenrod;
		}
		code, pre {
			font-family: ui-monospace, 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
		}
		pre {
			tab-size: 2;
			font-size: 0.8rem;
			line-height: 1.3;
			color: #FFF;
		}
	</style>
</head>
<body>
	<h1><a href="https://github.com/tbeseda/obelisk-lambda" target="_blank">Όbelisk λ</a></h1>

	<p>An HTTP router (powered by <a href="https://github.com/delvedor/find-my-way" target="_blank"><code>find-my-way</code></a> -- used by Fastify and Restify) to route requests in a "monolithic" Lambda<sup>1</sup>.</p>
	<p>This web site's routes are handled in a single Lambda by the Obelisk router. Try the links below.</p>
	<p>You may not want this.<sup>2</sup></p>

	<ul>
		<li><a href="/things/123">/things/123</a> returns some JSON of the param</li>
		<li><a href="/things/near/123-456/radius/789?foo=bar">/things/near/123-456/radius/789?foo=bar</a> returns complex params as JSON<sup>3</sup></li>
		<li><a href="/form">/form</a> a form that POSTs to itself -- been a while since you seen that, eh?</li>
		<li><a href="/router">/router</a> displays the same route map as text/plain</li>
		<li><a href="/silent">/silent</a> a route that fails to respond. the <code>find-my-way</code> router's default route (404) picks up</li>
		<li><a href="/throw">/throw</a> will throw-throw and does not fall back to the router's default route</li>
	</ul>

	<p>This Lambda's <code>router.prettyPrint()</code>:</p>
	<pre>$ROUTER</pre>
	<p><small>A rad feature of <code>find-my-way</code> ☝️</small></p>

	<hr>

	<p>
		<sup>1</sup>
		Specifically, a Lambda behind API Gateway V2. Easily deployed with <a href="https://arc.codes" target="_blank">Architect</a>.
	</p>

	<p>
		<sup>2</sup>
		"Monolithic" Lambdas that handle many routes-per-function are not usually recommended.
		Typically, cloud functions should be plentiful and small.
		However, there are some use cases where a "fat" Lambda can remain focused and quick while handling a wide variety of request paths.
		For that case, Obelisk Lambdas won't be slowed by proxy HTTP servers, slow route lookups, or deep dependency graphs (unless you <code>npm install</code> yourself into a black hole).
		<code>find-my-way</code> is fast and Obelisk uses just what it needs to execute the correct handler.
	</p>

	<p>
		<sup>3</sup> This is the source for the complex route above:
		<pre><code class="language-javascript">import { ObeliskRouter } from "obelisk-lambda";

const router = new ObeliskRouter();

router.on(
	"GET",
	"/things/near/:lat-:lng/radius/:r",
	async ({ params, store, searchParams }) => {
		return {
			statusCode: 200,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ ...params, ...store, ...searchParams }),
		};
	},
);

export const handler = router.mount();</code></pre>
	</p>

	<p>Source: <a href="https://github.com/tbeseda/obelisk-lambda" target="_blank">github.com/tbeseda/obelisk-lambda</a></p>

	<script>hljs.highlightAll();</script>
</body>
</html>
`;
