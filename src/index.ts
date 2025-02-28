import { Elysia } from "elysia";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import swagger from "@elysiajs/swagger";
import { betterAuthView } from "./utils/auth-view";

// ─── HELPER: Validate allowed origins ───────────────────────────────
const allowedOrigins = (env.TRUSTED_ORIGINS || "").split(",");
const validateOrigin = (request: Request) => {
	// Skip origin check for favicon and other browser requests
	const path = new URL(request.url).pathname;
	if (
		path === "/favicon.ico" ||
		path.startsWith("/swagger") || // This will cover /swagger and /swagger/json
		path === "/swagger.json" // Some setups use this path instead
	) {
		return true;
	}

	const origin = request.headers.get("origin");
	if (!origin) {
		logger.warn({
			message: "Request without origin header",
			ip: request.headers.get("x-forwarded-for") || "unknown",
			path,
		});
		return false;
	}

	if (!allowedOrigins.includes(origin)) {
		logger.warn({
			message: "Invalid origin attempted access",
			origin,
			ip: request.headers.get("x-forwarded-for") || "unknown",
			path,
		});
		return false;
	}

	return true;
};
// ─── Initialize app ─────────────────────────────────────────────────
const app = new Elysia()
	.onBeforeHandle(({ request }) => {
		if (!validateOrigin(request)) {
			return new Response("Unauthorized", { status: 401 });
		}
	})
	.use(swagger())
	.get("/", () => "Hello e-shop api", {
		detail: {
			tags: ["App"],
			responses: {
				200: {
					description: "Hello response",
					content: {
						"text/plain": {
							example: "Hello e-shop api",
						},
					},
				},
			},
		},
	})
	.all("/api/auth/*", betterAuthView);

// ─── Error handling for uncaught exceptions ─────────────────────────
process.on("uncaughtException", (error: Error) => {
	logger.error({
		message: "Uncaught Exception",
		error: error.message,
		stack: error.stack,
	});
	process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
	const error = reason instanceof Error ? reason : new Error(String(reason));
	logger.error({
		message: "Unhandled Rejection",
		error: error.message,
		stack: error.stack,
	});
	process.exit(1);
});

// ─── Start the server ───────────────────────────────────────────────
app.listen(env.BACKEND_PORT, () => {
	logger.info({
		message: "Server started",
		port: env.BACKEND_PORT,
		environment: env.NODE_ENV,
	});
	console.log(
		`View documentation at "${app.server?.url}swagger" in your browser`,
	);
});
