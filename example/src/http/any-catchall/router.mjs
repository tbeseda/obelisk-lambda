import { Buffer } from "node:buffer";
import { parse } from "node:querystring";
import { ObeliskRouter } from "obelisk-lambda";
import someHtml from "./some-html.mjs";

const router = new ObeliskRouter({
	defaultRoute: () => {
		return {
			statusCode: 404,
			headers: { "content-type": "text/plain; charset=utf8" },
			body: "not found. this is a custom handler",
		};
	},
});

router.on("GET", "/", () => {
	return {
		statusCode: 200,
		headers: { "content-type": "text/html; charset=utf8" },
		body: someHtml.replace("$ROUTER", router.prettyPrint()),
	};
});

router.on("GET", "/async", async () => {
	//sleep for 1 second
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return {
		statusCode: 200,
		headers: { "content-type": "text/plain; charset=utf8" },
		body: "waited 1 second",
	};
});

router.on("GET", "/router", () => {
	return {
		statusCode: 200,
		headers: { "content-type": "text/plain; charset=utf8" },
		body: router.prettyPrint(),
	};
});

router.on("GET", "/silent", () => {
	// this will trigger defaultRoute
	console.log("shhhh");
});

const theForm = /*html*/ `
<form method="POST">
	<input type="text" name="foo" />
	<input type="submit" />
</form>
<p><a href="/">home</a></p>
`;

router.on("GET", "/form", () => {
	return {
		statusCode: 200,
		headers: { "content-type": "text/html; charset=utf8" },
		body: theForm,
	};
});

router.on("POST", "/form", ({ event }) => {
	// `event` is an APIGatewayProxyEventV2
	const formData = Buffer.from(event.body, "base64").toString("utf8");
	const decoded = parse(formData);
	return {
		statusCode: 200,
		headers: { "content-type": "text/html; charset=utf8" },
		body: /*html*/ `
<p>
	Posted:
	<code>${JSON.stringify(decoded, null, 2)}</code>
</p>
${theForm}`,
	};
});

router.on("GET", "/throw", () => {
	// this will not trigger defaultRoute
	throw new Error("doh");
});

router.on("GET", "/things/:id", ({ params }) => {
	return {
		statusCode: 200,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(params),
	};
});

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

export default router;