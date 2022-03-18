const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

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
            options: {
              transpileOnly: false
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
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "./dist/esm"), path.resolve(__dirname, "./dist/cjs")],
    }),
    // new HtmlWebpackPlugin({
    //   title: "bageldb-js",
    // }),
  ],
};

const esmConfig = {
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
        type: "commonjs-static",
        export: "default",
      },
    },
    spread: {
      import: "./src/spread.ts",
      library: {
        // umdNamedDefine: true,
        type: "commonjs-static",
      },
    },
  },
  target: "node",
  externals: [nodeExternals()],
  output: {
    globalObject: "this",
    path: path.join(__dirname, "./dist"),
    filename: "[name].js",
  },
};
const cjsConfig = {
  entry: {
    index: {
      import: "./src/index.ts",
      library: {
        umdNamedDefine: true,
        type: "commonjs-static",
        export: "default",
      },
    },
    spread: {
      import: "./src/spread.ts",
      library: {
        // umdNamedDefine: true,
        type: "commonjs-static",
      },
    },
  },
  target: "node",
  externals: [nodeExternals()],
  output: {
    globalObject: "this",
    path: path.join(__dirname, "./dist"),
    filename: "[name].cjs",
  },
};

const browserConfig = {
  entry: "./src/index.ts",
  target: "web",
  output: {
    // publicPath: '/',
    path: path.resolve(__dirname, "./dist"),
    filename: "index.js",
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

  Object.assign(esmConfig, generalConfig);
  Object.assign(cjsConfig, generalConfig);
  Object.assign(browserConfig, generalConfig);

  return [esmConfig, cjsConfig, browserConfig];
};
