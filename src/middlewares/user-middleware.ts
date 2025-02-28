import type { Elysia } from "elysia";
import { Session, User } from "better-auth/types";
import { auth } from "@/utils/auth";

export const userMiddleware = (app: Elysia) =>
	app.derive(async (c) => {
		const session = await auth.api.getSession({ headers: c.request.headers });

		if (!session) {
			c.set.status = 401;
			throw new Error("Unauthorized Access: Token is missing");
		}

		return {
			user: session.user,
			session: session.session,
		};
	});

export const userInfo = (user: User | null, session: Session | null) => {
	return {
		user: user,
		session: session,
	};
};
