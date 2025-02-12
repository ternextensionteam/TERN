const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: "./src/index.js", // React app entry point
    background: "./src/background/background.js", // Background script entry point
    content: "./src/content/content.js", // Content script entry point
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js", // Generates popup.bundle.js and background.bundle.js
  },
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
      ],
      options: {
        concurrency: 100, // Speeds up copying with parallel processing
      },
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  mode: "production",
};
