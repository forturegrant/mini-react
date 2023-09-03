const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'node',
    entry: path.join(__dirname, 'src/client/ServerApp'),
    output: {
        filename: 'ServerApp.js',
        path: `${__dirname}/dist`,
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
}
