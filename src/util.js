import { ObeliskResponse } from "./response.js";

export const DED = { statusCode: 500 };

/** @deprecated */
export async function tryDefaultRoute(router, event) {
	if (router.defaultRoute) {
		/** @type {ObeliskResponse} */
		let result;
		await router.defaultRoute(
			event,
			new ObeliskResponse(event, (res) => {
				result = res;
			}),
		);

		// @ts-ignore
		if (result) {
			return {
				statusCode: result.statusCode,
				headers: result.getHeaders(),
				body: result.body,
			};
		} else {
			return DED;
		}
	} else {
		return DED;
	}
}
