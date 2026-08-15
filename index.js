#!/usr/bin/env node
const { logger } = require('./logger');

const express = require('express');
const app = express();

const { marked } = require('marked');
const {
	math, markedRenderer, containers,
	blockCommands, inlineCommands
} = require('./config/marked.mjs');

marked.use({
	extensions: [
		math, containers,
		blockCommands, inlineCommands
	],
	renderer: markedRenderer
});

const matter = require('gray-matter');
const envPaths = require('env-paths');

const fs = require('fs/promises')
const path = require('path');

const { loadConfig } = require('./config.js');
const CONFIG = loadConfig();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(CONFIG.assetDirectory));

app.get('/paper/*page', async (req, res) => {
	const relativeFilePath = req.params.page.join('/');
	logger.debug(`Client requested '${relativeFilePath}'`);

	const fileName = req.params.page.pop();

	try {
		const filePath = path.join(CONFIG.contentDirectory, ...req.params.page, `${fileName}.md`);
		const file = await fs.readFile(filePath, 'utf8');

		// Frontmatter
		const { data: frontmatter, content } = matter(file);

		frontmatter.title = marked.parseInline(frontmatter.title);

		// Content
		const html = marked.parse(content);

		logger.debug(`Responding '${relativeFilePath}'`);

		res.render('index', {
			...frontmatter,
			content: html
		});
	} catch (error) {
		if (error.code === 'ENOENT') {
			logger.debug(`Page '${relativeFilePath}' not found`);
			res.status(400).send(`Page <code>${fileName}</code> not found`);
		} else {
			logger.error(`Error reading page '${fileName}': ${error.message}`);
			res.status(500).send('Internal server error, see log for more information');
		}
	}
});

const PORT = CONFIG.port;
const HOST = CONFIG.host;

const server = app.listen(PORT, HOST, async () => {
	logger.info(`Skripsify is ready! Running on ${HOST}:${PORT}`);
});

server.on('error', error => {
	if (error.code === 'EADDRINUSE') {
		logger.error(`Port ${PORT} already in use`);
		process.exit(1);
	}
});