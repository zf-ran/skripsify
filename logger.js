const pino = require('pino');

const logger = pino({
	level: 'debug',
	timestamp: pino.stdTimeFunctions.isoTime,
	transport: {
		target: 'pino-pretty',
		options: { colorize: true },
	},
});

module.exports = {
	logger,
};