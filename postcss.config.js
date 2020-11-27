const tailwind = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');

const plugins = process.env.NODE_ENV === 'production'
	? [tailwind, autoprefixer, cssnano, postcssPresetEnv]
	: [tailwind, autoprefixer, postcssPresetEnv];

module.exports = { plugins };