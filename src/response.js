// yup, it's just a shim for ServerResponse
export class ObeliskResponse {
	#callback;
	constructor(event, callback) {
		this.event = event;
		this.#callback = callback;
		this.headers = {};
		this.statusCode = 200;
		this.body = "";
	}

	getHeaders() {
		return this.headers;
	}

	setHeader(name, value) {
		this.headers[name] = value;
	}

	writeHead(statusCode, headers) {
		this.statusCode = statusCode;
		this.headers = headers;
	}

	write(chunk) {
		this.body += chunk;
	}

	end(chunk) {
		if (chunk) {
			this.body += chunk;
		}
		this.#callback(this);
	}
}
