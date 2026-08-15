const { logger } = require('./logger');

const fs = require('fs');
const os = require('os');
const path = require('path');

const envPaths = require('env-paths');
const YAML = require('yaml');

const { default: untildify } = require('untildify');

const configDirectory = envPaths('skripsify', { suffix: '' }).config;
const configFilePath = path.join(configDirectory, 'config.yaml');

const defaultConfigPath = path.join(__dirname, 'default-config.yaml');

function parseConfig() {
	logger.debug('Loading configuration file ...');

	let configFile;

	if (fs.existsSync(configFilePath)) {
		configFile = fs.readFileSync(configFilePath, 'utf8');
		logger.debug(`Configuration file found at ${configFilePath}`);
	} else {
		const defaultConfigFile = fs.readFileSync(defaultConfigPath, 'utf8');

		fs.mkdirSync(configDirectory, { recursive: true });
		fs.writeFileSync(configFilePath, defaultConfigFile, 'utf8');

		logger.debug(`Configuration file not found, created configuration file at ${configFilePath}`);

		configFile = defaultConfigFile;
	}

	try {
		return YAML.parse(configFile);
	} catch (error) {
		logger.error('Corrupted user configuration file:', error.message);
		logger.debug('Fallback to default configuration');

		const defaultConfigFile = fs.readFileSync(defaultConfigPath, 'utf8');
		return YAML.parse(defaultConfigFile);
	}
}

function loadConfig() {
	const config = parseConfig();
	logger.level = config.logLevel;

	config.contentDirectory = untildify(config.contentDirectory);
	config.assetDirectory = untildify(config.assetDirectory);

	return config;
}

module.exports = {
	parseConfig,
	loadConfig
};