import * as z from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "staging", "production"])
		.default("development"),
	DATABASE_URL: z
		.string()
		.url()
		.refine(
			(str) => !str.includes("YOUR_DATABASE_URL_HERE"),
			"You forgot to change the default URL",
		),
	// SOCIAL PROVIDERS
	AUTH_GOOGLE_ID: z.string().min(1),
	AUTH_GOOGLE_SECRET: z.string().min(1),
	AUTH_GITHUB_ID: z.string().min(1),
	AUTH_GITHUB_SECRET: z.string().min(1),

	// PORT
	BACKEND_PORT: z.coerce.number().min(1),

	// BETTER AUTH
	BETTER_AUTH_SECRET: z.string().min(1),
	BETTER_AUTH_URL: z.string().min(1),
	TRUSTED_ORIGINS: z.string().min(1),
});

export const env = envSchema.parse(process.env);
