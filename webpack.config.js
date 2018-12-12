const path = require('path');
const webpack = require('webpack')
module.exports = {
  entry: {
    path: path.join(__dirname, 'src/js/main.js'),
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'main.js',
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      Popper: ['popper.js', 'default']
    })
  ]
}
