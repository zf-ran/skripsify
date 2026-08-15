import { escapeHTML, toSlug, parseArgString } from './util.mjs';
import { Marked, marked } from 'marked';

export const containers = {
	name: 'container',
	level: 'block',

	start(src) {
		return src.indexOf(':::');
	},
	tokenizer(src) {
		/** Matches `:::container-name` */
		const startRule = /^:::([A-Za-z0-9]+)(?::\s*((?:[A-Za-z0-9]+?=(?:"[^"]*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?);?[^\S\n]*)+?))?\n/;
		const startMatch = startRule.exec(src);

		if (!startMatch)
			return;

		const lines = src.split('\n');

		let depth = 0;
		let closingLineIndex = -1;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			if (/^:::([A-Za-z0-9]+)/.test(line))
				depth++;
			else if (line === ':::')
				depth--;

			if (depth === 0 && i > 0) {
				closingLineIndex = i;
				break;
			}
		}

		if (closingLineIndex === -1)
			return;

		const raw = lines.slice(0, closingLineIndex + 1).join('\n');
		const body = lines.slice(1, closingLineIndex).join('\n');

		const token = {
			type: 'container',
			raw,
			containerName: startMatch[1],
			arguments: startMatch[2] || '',
			text: body,
			tokens: []
		};

		this.lexer.blockTokens(token.text, token.tokens);

		return token;
	},
	renderer(token) {
		const containerName = token.containerName;
		const args = parseArgString(token.arguments);

		const innerHTML = this.parser.parse(token.tokens);

		switch (containerName) {
		case 'section':
			const pageCounterReset = '<div class="counter-reset"></div>';
			return (
				`<section class="container"`
				+ ` data-container-name="${containerName}"`
				+ ` data-args="${token.arguments.replace(/"/g, '&quot;')}"`
				+ ` data-section-type=${args.type}`
				+ `>`
				+ `${pageCounterReset}${innerHTML}`
				+ `</section>`
			);
		case 'figure':
			return (
				`<figure class="container"`
				+ ` data-container-name=${containerName}`
				+ ` data-args="${token.arguments.replace(/"/g, '&quot;')}"`
				+ ` data-figure-type="${args.type}"`
				+ `>`
				+ `${innerHTML}`
				+ `<figcaption><span class="figcaption-content">${marked.parseInline(args.caption)}</span></figcaption>`
				+ `</figure>`
			);
		default:
			return (
				`<div class="container"`
				+ ` data-container-name=${containerName}`
				+ ` data-args="${token.arguments.replace(/"/g, '&quot;')}"`
				+ `>${innerHTML}</div>`
			)
		}
	}
};

export const blockCommands = {
	name: 'blockCommand',
	level: 'block',

	start(src) {
		return src.indexOf('{{');
	},
	tokenizer(src) {
		/** Matches `{{commandName}}` or `{{commandName: argNum1=10; argStr2="hello"}}` */
		const rule = /^{{([A-Za-z0-9]+)(?::\s*((?:[A-Za-z0-9]+?=(?:"[^"]*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?);?\s*)+?))?}}/;
		const match = rule.exec(src);

		if (!match)
			return;

		return {
			type: 'blockCommand',
			raw: match[0],
			commandType: 'inline',
			commandName: match[1],
			arguments: match[2] || ''
		};
	},
	renderer(token) {
		return (
			`<div class="command block-command"`
			+ ` data-command-type="block"`
			+ ` data-command-name="${token.commandName}"`
			+ ` data-command-arguments="${token.arguments.replace(/"/g, '&quot;')}"`
			+ `></div>`
		);
	}
};

export const inlineCommands = {
	name: 'inlineCommand',
	level: 'inline',

	start(src) {
		return src.indexOf('[[');
	},
	tokenizer(src) {
		/** Matches `[[commandName]]` or `[[commandName: argNum1=10; argStr2="hello"]]` */
		const rule = /^\[\[([A-Za-z0-9]+)(?::\s*((?:[A-Za-z0-9]+?=(?:"[^"]*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?);?\s*)+?))?\]\]/;
		const match = rule.exec(src);

		if (!match)
			return;

		return {
			type: 'inlineCommand',
			raw: match[0],
			commandType: 'inline',
			commandName: match[1],
			arguments: match[2] || ''
		};
	},
	renderer(token) {
		return (
			'<span class="command inline-command"'
			+ ` data-command-type="inline"`
			+ ` data-command-name="${token.commandName}"`
			+ ` data-command-arguments="${token.arguments.replace(/"/g, '&quot;')}"`
			+ `></span>`
		);
	}
};

export const math = {
	name: 'math',
	level: 'inline',
	start(src) {
		return src.indexOf('$');
	},
	tokenizer(src, tokens) {
		// Match block math: $$math$$
		const blockRule = /^\$\$\n?([\s\S]+?)\n?\$\$/;
		const blockMatch = blockRule.exec(src);

		if (blockMatch) {
			return {
				type: 'text',
				raw: blockMatch[0],
				text: blockMatch[0]
			};
		}

		// Match inline math: $math$
		const inlineRule = /^\$([^\$\n]+?)\$/;
		const inlineMatch = inlineRule.exec(src);

		if (inlineMatch) {
			return {
				type: 'text',
				raw: inlineMatch[0],
				text: inlineMatch[0]
			};
		}
	}
};

export const markedRenderer = {
	code({ text, lang, raw }) {
		text = text.replaceAll('\t', '    ');
		if (lang) return `<pre><code class="language-${lang}">${escapeHTML(text)}</code></pre>`;
		return `<pre><code>${escapeHTML(text)}</code></pre>`;
	},
	codespan({ text }) {
		return `<code>${escapeHTML(text)}</code>`;
	},
	heading({ text, depth }) {
		const isNumbered = !text.trim().endsWith('~');
		const cleanText = !isNumbered ? text.trim().slice(0, -1).trim() : text.trim();

		const headingClass = isNumbered ? 'numbered' : 'not-numbered';
		const headingId = toSlug(cleanText);

		const innerHTML = marked.parseInline(cleanText);

		return `<h${depth} id="${headingId}" class="heading ${headingClass}">${innerHTML}</h${depth}>\n`;
	}
};