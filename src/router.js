import FindMyWay from "find-my-way";

export class ObeliskRouter {
	#router;
	#defaultRoute;

	constructor({ defaultRoute }) {
		this.#defaultRoute = defaultRoute;
		this.#router = FindMyWay({
			ignoreTrailingSlash: true,
			// defaultRoute,
		});
	}

	prettyPrint() {
		return this.#router.prettyPrint();
	}

	on(method, path, handler) {
		// add route to internal find-my-way router
		this.#router.on(method, path, handler);
	}

	mount() {
		/**
		 * @description Mount the router as a Lambda handler
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
			const found = this.#router.find(method, originalPath);

			if (found?.handler) {
				const { handler, params, searchParams, store } = found;
				payload = {
					...payload,
					params,
					searchParams,
					store,
				};

				// @ts-ignore send Obelisk payload instead of FindMyWay's ordered args
				const returnResult = await handler(payload);

				if (returnResult) {
					return returnResult;
				} else {
					return await this.#defaultRoute(payload);
				}
			} else {
				return await this.#defaultRoute(payload);
			}
		};
	}
}
