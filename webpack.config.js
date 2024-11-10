const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Base config that applies to either development or production mode.
const config = {
  entry: './src/index.js',
  output: {
    // Compile the source files into a bundle.
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Change this to your desired output directory
    clean: true,
  },
  // Enable webpack-dev-server to get hot refresh of the app.
  devServer: {
    static: path.join(__dirname, 'src'), // Serve static files from the correct directory
    port: 4000, // Change this to avoid conflict with your main server port if needed
  },
  module: {
    rules: [
      {
        // Load CSS files. They can be imported into JS files.
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // Generate the HTML index page based on our template.
    new HtmlWebpackPlugin({
      template: 'src/Views/index.ejs',
      filename: 'index.ejs',
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    // Enable source maps for easier debugging in development mode
    config.devtool = 'eval-cheap-module-source-map';

    // Override output path for development builds
    config.output.path = path.resolve(__dirname, 'build');

    config.module.rules.push({
      test: /(blockly\/.*\.js)$/,
      use: [require.resolve('source-map-loader')],
      enforce: 'pre',
    });

    config.ignoreWarnings = [/Failed to parse source map/];
  } else if (argv.mode === 'production') {
    // Disable source maps in production mode to reduce bundle size
    config.devtool = false;
  }
  
  return config;
};