const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: path.join(__dirname, 'src/client/index.tsx')
    },
    // devtool: 'source-map',
    output: {
        // filename: 'bundle.js',
        path: `${__dirname}/dist`
        // publicPath: '/public'
    },
    externals: {
        lodash: '_'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: '/node_modules/'
            },
            {
                // 命中 less 文件
                test: /\.less$/,
                // 从右到左依次使用 less-loader、css-loader、style-loader
                use: ['style-loader', 'css-loader', 'less-loader'],
                // 排除 node_modules 下面的 less 文件
                exclude: '/node_modules/'
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new HtmlPlugin({
            template: path.join(__dirname, 'src/client/index.html')
        })
    ],
    devServer: {
        hot: true,
        port: '3000'
    }
}
