import { ServerResponse } from "node:http";
import FindMyWay from "find-my-way";

export class ObeliskRouter {
	#router;
	#routes;
	#defaultRoute;

	constructor({ defaultRoute }) {
		this.#routes = [];
		// TODO re-map default route from (req, res) pattern to (options)
		this.#defaultRoute = defaultRoute;
		this.#router = FindMyWay({
			ignoreTrailingSlash: true,
			// defaultRoute,
		});
	}

	get routes() {
		return this.#routes;
	}

	get defaultRoute() {
		return this.#defaultRoute;
	}

	prettyPrint() {
		return this.#router.prettyPrint();
	}

	on(method, path, handler) {
		this.#router.on(
			method,
			path,
			async (req, _res, params, store, searchParams) => {
				return handler({
					event: req,
					params,
					store,
					searchParams,
					_res, // ? remove to avoid confusion
				});
			},
		);
		this.#routes.push({ method, path, handler });
	}

	mount() {
		/** @type {import("aws-lambda").Handler} */
		return async (event, context) => {
			const {
				rawPath,
				queryStringParameters,
				rawQueryString,
				requestContext: { http: reqHttp },
			} = event;

			let originalPath = rawPath;
			originalPath += queryStringParameters ? `?${rawQueryString}` : "";

			const found = this.#router.find(reqHttp.method, originalPath);

			if (found?.handler) {
				const { handler, params, store, searchParams } = found;
				const returnResult = await handler(
					event, // an API Gateway event, not a Node.js IncomingMessage
					new ServerResponse(event), // shim - will no-op
					params,
					store,
					searchParams,
				);

				if (returnResult) {
					return returnResult;
				} else {
					return await this.#defaultRoute({
						event,
						params,
						store,
						searchParams,
					});
				}
			} else {
				return await this.#defaultRoute({ event });
			}
		};
	}
}
