import FindMyWay from "find-my-way";

export class ObeliskRouter {
	#defaultRoute;
	router;
	handlers = new Map();

	constructor({ defaultRoute }) {
		this.#defaultRoute = defaultRoute;
		this.router = FindMyWay({
			ignoreTrailingSlash: true,
			caseSensitive: false,
		});
	}

	prettyPrint() {
		return this.router.prettyPrint();
	}

	// handle find-my-way ordered args
	on(method, path, callbackOrOptions, callback, store) {
		let handler = callback;
		let options = callbackOrOptions;

		if (!callback) {
			handler = callbackOrOptions;
			options = {};
		}

		// add pointer method to internal find-my-way router
		const routeKey = { method, path, options };
		this.handlers.set(routeKey, handler);
		this.router.on(method, path, options, () => routeKey, store);
	}

	/**
	 * @description Mounts the router to a Lambda handler
	 * @returns {import("aws-lambda").Handler}
	 */
	mount() {
		/**
		 * @description The mounted Lambda handler
		 * @param {import("aws-lambda").APIGatewayProxyEventV2} event
		 * @param {import("aws-lambda").Context} context
		 */
		return async (event, context) => {
			const {
				rawPath,
				rawQueryString,
				queryStringParameters,
				requestContext: { http: reqHttp },
			} = event;

			const method = /** @type {FindMyWay.HTTPMethod} */ (reqHttp.method);

			let payload = { event, context };

			let originalPath = rawPath;
			if (queryStringParameters) originalPath += `?${rawQueryString}`;

			// look for matching route without invoking it
			const found = this.router.find(method, originalPath /* constraints */);

			if (found?.handler) {
				// @ts-ignore handler isn't "real" handler, just a pointer
				const routeKey = found.handler();
				const handler = this.handlers.get(routeKey);
				const { params, searchParams, store } = found;
				payload = {
					...payload,
					params,
					searchParams,
					store,
				};

				const returnResult = await handler(payload);

				if (returnResult) {
					return returnResult;
				} else {
					return this.#defaultRoute(payload);
				}
			} else {
				return this.#defaultRoute(payload);
			}
		};
	}
}
