export function escapeHTML(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#039;'
	};

	return text.replace(/[&<>"']/g, m => map[m]);
}

export function toSlug(text) {
	return text.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "");
}

export function parseArgString(argString) {
	/** This matches the arguments: `argNum1=1` or more. */
	const rule = /[A-Za-z0-9]+?=(?:"[^"]*"|'[^']*'|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
	const args = {};

	if (argString) {
		const pairs = argString.match(rule) || [];

		for (const pair of pairs) {
			let [key, value] = pair.split('=');

			value = JSON.parse(value);

			args[key] = value;
		}
	}

	return args;
}