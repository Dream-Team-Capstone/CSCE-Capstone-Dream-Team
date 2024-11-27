const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Base config that applies to either development or production mode.
const config = {
  entry: './src/index.js',
  output: {
    // Compile the source files into a bundle.
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory for static assets
    clean: true,
  },
  // Enable webpack-dev-server to get hot refresh of the app.
  devServer: {
    static: [
      // Serve static assets from Webpack's output directory
      { directory: path.join(__dirname, 'dist'), publicPath: '/' },
      // Other directories to serve static files from
      { directory: path.join(__dirname, 'src', 'blocks'), publicPath: '/blocks' },
      { directory: path.join(__dirname, 'src', 'generators'), publicPath: '/generators' },
      { directory: path.join(__dirname, 'node_modules'), publicPath: '/node_modules' },
    ],
    port: 4000,
    hot: true, // Enable hot module replacement (HMR) for faster updates
    historyApiFallback: true, // Handle client-side routing
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
      template: 'src/Views/index.ejs', // Ensure this path is correct
      filename: 'index.html',  // Output as 'index.html' (Webpack will process this)
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
