const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      popup: "./src/index.js", // React app entry point
      background: "./src/background/background.js", // Background script entry point
      content: "./src/content/content.js", // Content script entry point
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js", // Generates popup.bundle.js and background.bundle.js
    },
    // Add devtool configuration based on environment
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '',
            // Only copy if the file is changed
            noErrorOnMissing: true, // Optional, avoids errors if no files match
            info: {
              minimized: true, // Display fewer logs in Webpack output
            },
          },
          { from: 'public/icons', to: 'dist/icons' },
        ],
        options: {
          concurrency: 100, // Speeds up copying with parallel processing
        },
      }),
      // DefinePlugin for NODE_ENV
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(argv.mode || "development"),
      }),
    ],
    resolve: {
      extensions: [".js", ".jsx"],
    },
    mode: argv.mode || "production", // Dynamically set mode based on build argument
  }
};
