const path = require("path");

module.exports = {
  entry: {
    popup: "./src/index.js", // React app entry point
    background: "./src/background.js", // Background script entry point
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
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  mode: "production",
};
