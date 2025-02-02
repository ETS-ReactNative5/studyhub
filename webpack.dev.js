const merge = require('webpack-merge')
const common = require('./webpack.common.js')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  // output: {
  //   publicPath: '/static/js/bundles/'
  // },
  plugins: [
    new BundleTracker({filename: './webpack-stats.json'})
  ]

})
