import winston from "winston";
import "winston-daily-rotate-file";

const errorTransport = new winston.transports.DailyRotateFile({
	filename: "logs/error-%DATE%.log", // Log files are saved as error-YYYY-MM-DD.log
	datePattern: "YYYY-MM-DD", // Rotates daily
	maxSize: "20m", // Maximum file size (e.g., 20 megabytes)
	maxFiles: "3d", // Keep logs for 3 days
	level: "error", // Only log errors
});

const combinedTransport = new winston.transports.DailyRotateFile({
	filename: "logs/combined-%DATE%.log", // Log files are saved as combined-YYYY-MM-DD.log
	datePattern: "YYYY-MM-DD", // Rotates daily
	maxSize: "20m", // Maximum file size
	maxFiles: "3d", // Keep logs for 3 days
});

export const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json(),
	),
	transports: [
		errorTransport,
		combinedTransport,
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),
	],
});
