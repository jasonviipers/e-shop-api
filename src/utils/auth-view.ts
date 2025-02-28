import { Context } from "elysia";
import { auth } from "./auth";

export const betterAuthView = (c: Context) => {
	const allowedMethods = ["POST", "GET"];
	if (!allowedMethods.includes(c.request.method)) {
		return c.error(405);
	}
	// Delegate the request processing to Better Auth’s handler.
	// console.log("auth.handler(c.request)", (c.request));
	return auth.handler(c.request);
};
