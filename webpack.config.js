let webpack = require('webpack'),
	path = require('path')


module.exports = {
	entry: './spa/main.js',

	output: {
		path: path.resolve(__dirname, './public'),
		filename: 'bundle.js',
		publicPath: '/'
	},

	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						'scss': 'vue-style-loader!css-loader!sass-loader',
						'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		],
	},

	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},

	performance: {
		hints: false
	},

	devtool: '#eval-source-map'	
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}