const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
// const webpack  = require("webpack");

const generalConfig = {
  devtool: "inline-source-map",
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
                    }
          }
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
    extensions: [".tsx", ".ts", ".js"],
  },
   plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "./dist")],
    }),

      // new NodePolyfillPlugin(),
    // new HtmlWebpackPlugin({
    //   title: "bageldb-js",
    // }),
  ],
};

const esmConfig = {
  entry: {
    index: {
      import: "./src/server/index.ts",
      library: {
        umdNamedDefine: true,
        type: "umd",
        export: "default",
      },
    },
  },
  target: "node",
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
   plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "./dist")],
    }),
    new NodePolyfillPlugin(),
  ],
  output: {
    globalObject: "this",
    path: path.join(__dirname, "./dist"),
    filename: "[name].cjs",
  },
};
const nodeConfig = {
  // optimization: {
  //   splitChunks: {
  //     // include all types of chunks
  //     chunks: "all",
  //     name: "shared",
  //   },
  // },
  entry: {
    index: {
      import: "./src/index.ts",
      library: {
        umdNamedDefine: true,
        type: "umd",
        export: "default",
      },
    },
    spread: {
      import: "./src/spread.ts",
      library: {
        // umdNamedDefine: true,
        type: "umd",
      },
    },
  },
  target: "node",
  // resolve: {
  //   extensions: ['', '.js','.ts'],
  //   alias: {
  //     'utils': './src/checks'  // <-- When you build or restart dev-server, you'll get an error if the path to your utils.js file is incorrect.
  //   }
  // },
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
   plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "./dist")],
    }),
    new NodePolyfillPlugin(),
  ],
  output: {
    globalObject: "this",
    path: path.join(__dirname, "./dist"),
    filename: "[name].js",
  },
};

const browserConfig = {
  resolve: {
  },
  entry: "./src/index.ts",
  target: "web",
  externalsPresets: { node: true },
  // externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, "./dist"),
    filename: "bageldb.js",
    globalObject: "this",
    scriptType: "module",
    library: {
      umdNamedDefine: true,
      name: "Bagel",
      type: "umd",
      export: "default",
    },
  },
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    generalConfig.devtool = "cheap-module-source-map";
    // eslint-disable-next-line no-empty
  } else if (argv.mode === "production") {
  } else {
    throw new Error("Specify env");
  }

  Object.assign(browserConfig, generalConfig);
  Object.assign(nodeConfig, generalConfig);
  Object.assign(esmConfig, generalConfig);

  return [
    browserConfig,
    nodeConfig,
     esmConfig
    ];
};