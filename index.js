#!/usr/bin/env node
const express = require('express');
const app = express();

const { marked } = require('marked');
const {
	markedRenderer, containers,
	blockCommands, inlineCommands
} = require('./config/marked.mjs');

marked.use({
	extensions: [
		containers,
		blockCommands, inlineCommands
	],
	renderer: markedRenderer
});

const matter = require('gray-matter');

const fs = require('fs/promises')
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.resolve(process.cwd(), 'assets')));

app.get('/paper/:page', async (req, res) => {
	const file = await fs.readFile(`contents/${req.params.page}.md`, 'utf8');
	const { data, content } = matter(file);

	const html = marked.parse(content);

	data.title = marked.parseInline(data.title);

	res.render('index', {
		...data,
		content: html
	});
});

const DEFAULT_PORT = 4129;
const DEFAULT_HOST = '127.0.0.1';

const PORT = process.env.SKRIPSIFY_PORT || process.env.PORT || DEFAULT_PORT;
const HOST = process.env.SKRIPSIFY_HOST || process.env.HOST || DEFAULT_HOST;

app.listen(PORT, HOST, async () => {
	console.log('Server is ready! Listening on', HOST + ':' + PORT);
});