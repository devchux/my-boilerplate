const webpack = require("webpack");
const path = require("path");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const IS_DEVELOPMENT = process.env.NODE_ENV === "dev";

const dirApp = path.join(__dirname, "app");
const dirStyles = path.join(__dirname, "styles");
const dirShared = path.join(__dirname, "shared");
const dirNode = "node_modules";

module.exports = {
  entry: [path.join(dirApp, "index.js"), path.join(dirStyles, "index.scss")],
  // Configure how modules are resolved
  resolve: {
    // Tell webpack what directories should be searched when resolving modules.
    modules: [dirApp, dirShared, dirStyles, dirNode],
  },
  plugins: [
    // Allow global constants configured at compile time
    new webpack.DefinePlugin({ IS_DEVELOPMENT }),
    // Copies individual files or entire directories to the build directory
    new CopyWebpackPlugin({ patterns: [{ from: "./shared", to: "" }] }),
    // creates a CSS file per JS file which requires CSS
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      { test: /\.css$/, use: "css-loader" },
      { test: /\.ts$/, use: "ts-loader" },
      { test: /\.js$/, use: { loader: "babel-loader" } },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "",
            },
          },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          { loader: "sass-loader" },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg|webp|woff2|fnt)$/i,
        loader: "file-loader",
        options: {
          name(file) {
            return "[hash].[ext]";
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                options: {
                  severityError: "warning",
                  minimizerOptions: {
                    plugins: ["gifsicle"],
                  },
                },
              },
            },
          },
        ],
      },

      // Shaders and WebGL
      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_modules/
      },
    ],
  },
  optimization: {
    minimize: true,
    // Minimize images
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 8 }],
            ],
          },
        },
      }),
      // Minimize js files
      new TerserPlugin(),
    ],
  },
};
