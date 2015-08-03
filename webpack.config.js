// webpack.config.js

var webpack = require("webpack");

var plugins, loaders;

if(GLOBAL.__MODE__){

	//for develop BUILD_DEV=1 BUILD_PRERELEASE=1 webpack
	var definePlugin = new webpack.DefinePlugin({
		__DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || "true")),
		__BUNDLE__: GLOBAL.__BUNDLE__
	});

	plugins = [definePlugin];

	loaders = [
		{
			test: /\.jsx$/,
			exclude: /node_modules/,
			loader: "babel-loader"
		},
		{ test: /\.css$/, loader: "style!css" }
	];

} else {

	var definePlugin = new webpack.DefinePlugin({
		__DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || "false")),
		__BUNDLE__: GLOBAL.__BUNDLE__
	});

	var uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
		compress: {
	        warnings: false
	    }
	});

	plugins = [definePlugin, uglifyPlugin];

	loaders = [
		{
			test: /\.jsx$/,
			exclude: /node_modules/,
			loader: "babel-loader",
			query: {
				blacklist: ["strict"]
			}
		},
		{ test: /\.css$/, loader: "style!css" }
	];
}

module.exports = {
	entry: "./src/Select.jsx",
 	output: {
		filename: "./build/" + (GLOBAL.__MODE__ ? 
							(GLOBAL.__BUNDLE__ ? "react-select.bundle" : "react-select") : 
							(GLOBAL.__BUNDLE__ ? "react-select.bundle.min" : "react-select.min")
				) + ".js"
	},
	module: {
		loaders: loaders
	},
	plugins: plugins
};