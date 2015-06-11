/**
 * Created by hunterhodnett on 5/11/15.
 */

var webpack = require("webpack");
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: './src/app.module.js',
    output: {
        path: __dirname + '/dist',
        filename: 'memesubmission.min.js',
        publicPath: "../../../dist/" // Load static assets (e.g. images) from the distribution folder
    },
    /*plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new ngAnnotatePlugin({
            add: true
        })
    ],*/
    module: {
        loaders: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            },
            /*{
                test: /\.html$/, loader: "ngtemplate!html-loader"
            },*/
            {
                test: /\.css$/, loader: "style-loader!css-loader"
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader"
            }
        ]
    }
};