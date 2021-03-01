const path = require("path");
const fs = require("fs");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const buildPath = process.env.BUILD_PATH || "build";
const moduleFileExtensions = [
  "web.mjs",
  "mjs",
  "web.js",
  "js",
  "web.ts",
  "ts",
  "web.tsx",
  "tsx",
  "json",
  "web.jsx",
  "jsx",
];

const paths = {
  appPath: resolveApp("."),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp("public"),
  appSrc: resolveApp("src"),
  appHtml: resolveApp("public/index.html"),
  appEntry: resolveApp("src/index"),
};

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const fileRegex = /\.(png|jpe?g|gif|svg|webp)$/i;
const outputFilePath = "assets/media/[name].[ext]";

const config = (_, props) => {
  const isProduction = props.mode === "production";

  const plugins = [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.appPublic,
          globOptions: {
            ignore: [paths.appHtml],
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      minify: false,
    }),
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new ESLintWebpackPlugin({
      extensions: ["js", "jsx", "ts", "tsx"],
    }),
    isProduction && new CleanWebpackPlugin(),
  ].filter((plugin) => plugin);

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      "style-loader",
      {
        loader: "css-loader",
        options: cssOptions,
      },
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            ident: "postcss",
            plugins: [
              "postcss-preset-env",
              {
                autoprefixer: { grid: true },
              },
            ],
          },
          sourceMap: !isProduction,
        },
      },
    ];

    if (preProcessor) {
      loaders.push(
        {
          loader: "resolve-url-loader",
          options: {
            sourceMap: !isProduction,
            root: paths.appSrc,
          },
        },
        {
          loader: preProcessor,
          options: {
            sourceMap: !isProduction,
          },
        }
      );
    }

    return loaders;
  };

  const devTools = isProduction
    ? {}
    : {
        devtool: "inline-source-map",
        devServer: {
          contentBase: paths.appPublic,
          historyApiFallback: true,
          port: 4000,
          open: true,
          hot: true,
        },
      };

  return {
    target: "web",
    mode: isProduction ? "production" : "development",
    entry: paths.appEntry,
    output: {
      path: isProduction ? paths.appBuild : undefined,
      publicPath: isProduction ? "./" : "/",
      filename: "bundle.js",
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-env",
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                ],
              },
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: !isProduction,
              }),
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: !isProduction,
                modules: true,
              }),
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: !isProduction,
                },
                "sass-loader"
              ),
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: !isProduction,
                  modules: true,
                },
                "sass-loader"
              ),
            },
            {
              test: fileRegex,
              use: [
                {
                  loader: "file-loader",
                  options: {
                    name: outputFilePath,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: moduleFileExtensions.map((ext) => `.${ext}`),
    },
    plugins,
    ...devTools,
  };
};

module.exports = config;
