const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
// const webpack = require('webpack');

module.exports = {

    entry: { index: path.resolve(__dirname, "./src/client/ui", "index.ts") },
    devtool: 'inline-source-map',
    output: {
        filename: 'poker.js',
        path: path.resolve(__dirname, "dist/client")
    },

    module: {
        rules: [

            /*
                        {
                            test: /\.vue$/,
                            loader: 'vue-loader',
                            options: {
                                loaders: {
                                    // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                                    // the "scss" and "sass" values for the lang attribute to the right configs here.
                                    // other preprocessors should work out of the box, no loader config like this necessary.
                                    'scss': 'vue-style-loader!css-loader!sass-loader',
                                    'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
                                }
                                // other vue-loader options go here
                            }
                        },
                        {
                            test: /\.css$/,
                            use: ["vue-style-loader", "css-loader"]
                        },
                        {
                            test: /\.(png|jpg|gif|svg)$/,
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]?[hash]'
                            }
                        },
            */
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", 'sass-loader']
            },
            {
                test: /\.tsx?$/,
                use: ["ts-loader"],
                exclude: /node_modules/
            }

        ]
    },

    optimization: {
        splitChunks: { chunks: "all" }
    },

    plugins: [

        new HtmlWebpackPlugin({ template: path.resolve(__dirname, "src/client/ui", "index.html") })

    ],

    resolve: {
        // extensions: ['.ts', '.js', '.vue', '.json'],
        extensions: ['.ts'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    }


};