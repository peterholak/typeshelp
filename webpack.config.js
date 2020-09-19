const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const config = {
    mode: 'development',
    entry: {
        'app': './src/index.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'assets/[name].[chunkhash].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        modules: [path.resolve(__dirname, "src"), "node_modules"]
    },
    module: {
        rules: [
            {test: /\.tsx?$/, use: 'ts-loader'}
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/types.css', to: 'static/types.css' },
                { from: 'node_modules/highlight.js/styles/github-gist.css', to: 'static/highlightjs-github-gist.css' },
                { from: 'node_modules/highlight.js/styles/gruvbox-dark.css', to: 'static/highlightjs-gruvbox-dark.css' }
            ]
        }),
        new WebpackCleanupPlugin({ exclude: ['static/*'] }),
    ],
    devtool: 'source-map',

    devServer: {
        historyApiFallback: {
            disableDotRule: true
        }
    },

    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    }
}

module.exports = config