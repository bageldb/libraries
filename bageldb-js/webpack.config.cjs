const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// const webpack  = require("webpack");
/**
 * @type {import("webpack").Configuration}
 */
const generalConfig = {
	devtool: 'inline-source-map',
	watchOptions: {
		aggregateTimeout: 600,
		ignored: /node_modules/,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						// loader: 'esbuild-loader',

						options: {
							transpileOnly: false,

							// loader: 'ts',  // Or 'ts' if you don't need tsx
							// target: 'es2015',
							// sourcemap: true
							// tsconfigRaw: require('./tsconfig.json')
						},
					},
				],
				exclude: /node_modules/,
			},
			// {
			//   test: path.resolve(__dirname, "./dist/index.js"),
			//   loader: "exports-loader",
			//   options: {
			//     exports:"default Bagel"
			//   },
			// },
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
			cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')],
		}),

		// new NodePolyfillPlugin(),
		// new HtmlWebpackPlugin({
		//   title: "bageldb-js",
		// }),
	],
};
/**
 * @type {import("webpack").Configuration}
 */
const optimizeConfig = {
	optimization: {
		splitChunks: {
			// include all types of chunks
			chunks: 'all',
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			},
		},
	},
};
/**
 * @type {import("webpack").Configuration}
 */
const nodeConfig = {
	entry: {
		index: {
			import: './src/server.ts',
			library: {
				umdNamedDefine: true,
				type: 'umd',
				export: 'default',
			},
		},
		serverSpread: {
			import: './src/serverSpread.ts',
			library: {
				umdNamedDefine: true,
				type: 'umd',
				export: 'default',
			},
		},
	},
	target: 'node',
	externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
	externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
			cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')],
		}),
		new NodePolyfillPlugin(),
	],
	output: {
		globalObject: 'this',
		path: path.join(__dirname, './dist'),
		filename: '[name].cjs',
	},
};

/**
 * @type {import("webpack").Configuration}
 */
const webpack4Config = {
	entry: {
		index: {
			import: './src/index.ts',
			library: {
				umdNamedDefine: true,
				type: 'umd',
				// export: "default",
			},
		},
	},

	externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.

	output: {
		path: path.join(__dirname, './dist'),
		filename: '[name].js',
		publicPath: '',
	},
};

/**
 * @type {import("webpack").Configuration}
 */
const esmConfig = {
	// https://webpack.js.org/configuration/output/#outputmodule
	experiments: {
		outputModule: true,
	},
	entry: {
		index: {
			import: './src/index.ts',
			library: {
				// https://webpack.js.org/configuration/output/#outputmodule
				type: 'module',
			},
		},
	},
	externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.

	output: {
		path: path.join(__dirname, './dist'),
		filename: '[name].mjs',
		publicPath: '',
		// https://webpack.js.org/configuration/output/#outputmodule
		module: true,
	},
};

const browserConfig = {
	resolve: {},
	entry: './src/index.ts',
	target: 'web',
	externalsPresets: { node: true },
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'bageldb.js',
		globalObject: 'this',
		library: {
			umdNamedDefine: true,
			name: 'Bagel',
			type: 'umd',
			export: 'default',
		},
	},
};

module.exports = (env, argv) => {
	if (argv.mode === 'development') {
		generalConfig.devtool = 'cheap-module-source-map';
	} else if (argv.mode === 'production') {
		//
	} else {
		throw new Error('Specify env');
	}

	Object.assign(browserConfig, generalConfig);
	Object.assign(nodeConfig, generalConfig, nodeConfig);
	Object.assign(webpack4Config, generalConfig);
	Object.assign(esmConfig, generalConfig);

	return [
		nodeConfig,
		esmConfig,
		webpack4Config,
		browserConfig,
	];
};
