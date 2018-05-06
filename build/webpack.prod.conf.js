var path = require('path')
var webpack = require('webpack')
var config = require('config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var workboxPlugin = require('workbox-webpack-plugin')
var SwRegisterWebpackPlugin = require('sw-register-webpack-plugin')
var utils = require('./utils')

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.productionSourceMap,
      extract: true
    })
  },
  devtool: config.productionSourceMap ? '#source-map' : false,
  output: {
    filename: utils.assetsPath('js/[name]_[chunkhash:7].js'),
    chunkFilename: utils.assetsPath('js/[id]_[chunkhash:7].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': config.env
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin([config.assetsRoot], { root: path.join(__dirname, '..') }),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name]_[contenthash:7].css')
    }),
    new webpack.HashedModuleIdsPlugin(),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: utils.resolve(config.index),
      template: 'src/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        minifyCSS: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: utils.assetsPath('js/vendor_[chunkhash:7].js'),
      minChunks: Infinity
    }),
    // copy custom static assets to static dir
    new CopyWebpackPlugin([
      {
        from: utils.resolve('static'),
        to: config.assetStaticDirectory
      }
    ]),
    new SwRegisterWebpackPlugin({
      filePath: utils.resolve('src/sw-register.js'),
      prefix: '/'
    }),
    new workboxPlugin({
      globDirectory: utils.resolve(config.assetsRoot),
      globPatterns: ['**\/*.{html,js,css}'],
      globIgnores: ['sw-register.js'],
      skipWaiting: true,
      swDest: path.join(utils.resolve(config.assetsRoot), 'service-worker.js')
    })
  ]
})

if (process.env.npm_config_report) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
