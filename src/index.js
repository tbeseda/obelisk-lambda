import { ObeliskResponse } from "./response.js";
import { tryDefaultRoute } from "./util.js";
export { ObeliskRouter } from "./router.js";

// TODO: remove in v0.1.0
// This adapter is deprecated and untested.
/** @deprecated */
export function adapter({ router }) {
	if (!router || router.routes.length === 0) throw new Error("Invalid router");

	router.ignoreDuplicateSlashes = true; // symmetry with API Gateway

	/**
	 * @type {import("aws-lambda").Handler}
	 * @param {import("aws-lambda").APIGatewayProxyEventV2} event
	 */
	return async (event, context, callback) => {
		const {
			rawPath,
			queryStringParameters,
			rawQueryString,
			requestContext: { http: reqHttp },
		} = event;

		let originalPath = rawPath;
		originalPath += queryStringParameters ? `?${rawQueryString}` : "";

		const found = router.find(reqHttp.method, originalPath);

		if (found?.handler) {
			/** @type {ObeliskResponse} */
			let result;
			await found.handler(
				event,
				new ObeliskResponse(event, (res) => {
					result = res;
				}),
				found.params,
				found.store,
				found.searchParams,
			);

			// @ts-ignore
			if (result) {
				return {
					statusCode: result.statusCode,
					headers: result.getHeaders(),
					body: result.body,
				};
			} else {
				return tryDefaultRoute(router, event);
			}
		} else {
			return tryDefaultRoute(router, event);
		}
	};
}
