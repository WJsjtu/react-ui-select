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
	if(err){
		console.log(err);
	} else {
		console.log('JS build success!');
	}
});

var fs = require('fs');
var less = require('less');

less.render('@import "default.less";', {
	paths: [path.join(__dirname, '../src/less')],  // Specify search paths for @import directives
	filename: 'style.less', // Specify a filename, for better error messages
	compress: true          // Minify CSS output
}, function (e, output) {
	if(e){
		console.log(e.message);
	} else {
		fs.writeFile(path.join(__dirname, '../build/style.css'), output.css, {flag: 'w+'}, function (err) {
			if (err) throw err;
			console.log('CSS build success!');
		});
	}
});