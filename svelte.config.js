const sveltePreprocess = require('svelte-preprocess');
const development = process.env.NODE_ENV === 'development';

module.exports = {
    preprocess: sveltePreprocess({
        babel: {
            presets: [
                ['@babel/preset-env', {
                        loose: true,
                        // No need for babel to resolve modules
                        modules: false,
                        targets: {
                        // ! Very important. Target es6+
                        esmodules: true,
                        },
                    },
                ],
            ],
        },
    }),
    css: css => {
        css.write('bundle.css');
    },
    dev: development,
};