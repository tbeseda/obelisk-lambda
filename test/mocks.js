/** @typedef {import("aws-lambda").Context} Context */
/** @typedef {import("aws-lambda").APIGatewayProxyEventV2} Event */

// create mock API Gateway event and Context to invoke lambdaHandler

/** @type {Context} */
const context = {
	awsRequestId: "mock-aws-request-id",
	functionName: "mock-function-name",
	functionVersion: "mock-function-version",
	invokedFunctionArn: "mock-invoked-function-arn",
	logGroupName: "mock-log-group-name",
	logStreamName: "mock-log-stream-name",
	memoryLimitInMB: "128",
	callbackWaitsForEmptyEventLoop: true,
	getRemainingTimeInMillis: () => 1000,
	done: () => {},
	fail: () => {},
	succeed: () => {},
};

/** @type {Event} */
const rootRequest = {
	version: "2.0",
	rawPath: "/",
	rawQueryString: "",
	queryStringParameters: {},
	requestContext: {
		// @ts-ignore
		http: {
			method: "GET",
		},
	},
};

/** @type {Event} */
const event = {
	version: "2.0",
	rawPath: "/my/path",
	rawQueryString: "parameter1=value1&parameter1=value2&parameter2=value",
	queryStringParameters: {
		parameter1: "value1,value2",
		parameter2: "value",
	},
	requestContext: {
		// @ts-ignore
		http: {
			method: "GET",
		},
	},
};

export { event, rootRequest, context };
