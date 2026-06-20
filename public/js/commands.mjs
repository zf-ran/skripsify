import ElementBuilder from '/js/element-builder.mjs';

const commands = {
	block: new Map(),
	inline: new Map()
}

const COMMAND_TYPES = Object.keys(commands);

//* BLOCK COMMANDS
//- Table of Contents
commands.block.set('toc', (element, { maxDepth }) => {
	if (typeof maxDepth === 'undefined')
		maxDepth = 6;

	const tableOfContent = new ElementBuilder('ul')
		.classes(['toc'])
		.appendTo(element);

	const headingElements = document.getElementsByClassName('heading');

	for (const headingElement of headingElements) {
		const className = headingElement.classList.contains('numbered') ? 'numbered' : 'not-numbered';
		const depth = parseInt(headingElement.tagName[1]);

		if (depth > maxDepth)
			continue;

		const containingSection = headingElement.parentElement.dataset.sectionType;

		const row = new ElementBuilder('li')
			.classes([className])
			.attributes({
				'data-depth': depth,
				'data-section': containingSection
			})
			.appendTo(tableOfContent);

		new ElementBuilder('a')
			.classes(['redirect'])
			.attributes({
				href: `#${headingElement.id}`
			})
			.innerHTML(headingElement.innerHTML)
			.appendTo(row);

		new ElementBuilder('span')
			.classes(['page-number'])
			.attributes({
				'data-href': `#${headingElement.id}`
			})
			.appendTo(row);
	}
});

commands.block.set('signatureField', (element, { city, date, signer }) => {
	if (typeof date === 'undefined') {
		const today = new Date();

		date = new Intl.DateTimeFormat('id', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(today);
	}

	const signatureField = new ElementBuilder('section')
		.classes(['signature-field'])
		.appendTo(element);

	new ElementBuilder('div')
		.classes(['place-date'])
		.text(`${city}, ${date}`)
		.appendTo(signatureField);

	new ElementBuilder('div')
		.classes(['signature-area'])
		.appendTo(signatureField);

	new ElementBuilder('div')
		.classes(['signer'])
		.text(signer)
		.appendTo(signatureField);
});

//* INLINE COMMANDS
commands.inline.set('pageReference', (element, { id }) => {
	new ElementBuilder('a')
		.classes(['page-reference'])
		.attributes({
			href: `#${id}`
		})
		.appendTo(element);
});

/**
 * @param {"block"|"inline"} type
 * @param {string} name
 * @param {function} handler
 */
export function registerCommand(type, name, handler) {
	if (!COMMAND_TYPES.includes(type))
		throw new TypeError(`Unknown command type: "${type}". Must be one of ${COMMAND_TYPES.join(', ')}`);

	commands[type].set(name, handler);
}

export function resolveCommands(constants) {
	const commandElements = document.getElementsByClassName('command');

	/** This matches the arguments: `argNum1=1` or more. */
	const rule = /[A-Za-z0-9]+?=(?:"[^"]*"|'[^']*'|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

	for (const element of commandElements) {
		const name = element.dataset.commandName;
		const type = element.dataset.commandType;
		const argString = element.dataset.commandArguments;

		const args = {};

		if (argString) {
			const pairs = argString.match(rule) || [];

			for (const pair of pairs) {
				let [key, value] = pair.split('=');

				value = JSON.parse(value);

				args[key] = value;
			}
		}

		const handler = commands[type]?.get(name);

		if (handler) {
			handler(element, { ...constants, ...args });
		} else {
			element.classList.add('command-error');
			element.innerHTML = `Unknown command: <code>${name}</code>`;
		}
	}
}