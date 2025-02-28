import { db } from "@/config/db";
import { env } from "@/config/env";
import { account, session, user, verification } from "@/models/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user,
			session,
			verification,
			account,
		},
	}),

	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		/*
		 * We're using Google and Github as our social provider,
		 * make sure you have set your environment variables
		 */
		github: {
			clientId: env.AUTH_GITHUB_ID,
			clientSecret: env.AUTH_GITHUB_SECRET,
		},
		google: {
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET,
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	url: env.BETTER_AUTH_URL,
	trustedOrigins: env.TRUSTED_ORIGINS.split(",") || [],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 30, // Refresh every 30 minutes
		freshAge: 60 * 5, // Refresh every 5 minutes
	},
	rateLimit: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100,
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {},
		}),
	],
});
