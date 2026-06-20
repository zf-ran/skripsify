window.PagedConfig = {
	auto: false
};

window.MathJax = {
	loader: {
		load: [
			'output/chtml',
			'[tex]/mathtools'
		]
	},
	tex: {
		inlineMath: [['$', '$'], ['\\(', '\\)']],
		displayMath: [['$$','$$'], ['\\[','\\]']],
		packages: {
			'[+]': ['mathtools']
		},
		processEscapes: true,
		processEnvironments: true
	},
	output: {
		displayOverflow: 'linebreak',
		linebreaks: {
			inline: false
		}
	},
	chtml: {
		font: 'mathjax-stix2'
	},
	svg: {
		font: 'mathjax-stix2'
	}
};