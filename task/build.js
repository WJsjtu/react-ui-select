var path = require('path');
var webpack = require('webpack');

var config = {
	entry: './src/select',
	externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
	output: {
		path: path.join(__dirname, '../build'),
		filename: 'react-select.js'
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	],
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel',
			query: {
				presets: ['es2015', 'react']
			},
			include: path.join(__dirname, '../src'),
			exclude: ['node_modules']
		},{
			test: /\.less$/, loader: "style-loader!css-loader!less-loader",
			include: path.join(__dirname, '../src'),
			exclude: ['node_modules']
		}]
	}
};

webpack(config, function(err, stats) {
    console.log(err, stats);
});