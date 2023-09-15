const path = require('path');

const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const extName = "Rollout";

const config = {
  entry: {
    extension: './src/index.tsx',
  },
  output: {
    filename: `extensions-${extName}.js`,
    path: __dirname + `/dist/resources/extension-${extName}.js`,
    libraryTarget: "window",
    library: ["tmp", "extensions"],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.ttf'],
  },
  externals: {
    react: 'React',
  },
  module: {
    rules: [
       {
          test: /\.tsx?$/,
          loader: 'esbuild-loader',
          options: {
              loader: 'tsx',
              target: 'es2015',
          }
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'raw-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'raw-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.NODE_ONLINE_ENV': JSON.stringify(process.env.NODE_ONLINE_ENV || 'offline'),
        'process.env.HOST_ARCH': JSON.stringify(process.env.HOST_ARCH || 'amd64'),
        'process.platform': JSON.stringify('browser'),
        'SYSTEM_INFO': JSON.stringify({
            version: process.env.ARGO_VERSION || 'latest'
        })
    }),
    new HtmlWebpackPlugin({ template: 'src/app/index.html' }),
    new CopyWebpackPlugin({
        patterns: [{
                from: 'src/assets',
                to: 'assets'
            },
            {
                from: 'node_modules/argo-ui/src/assets',
                to: 'assets'
            },
            {
                from: 'node_modules/@fortawesome/fontawesome-free/webfonts',
                to: 'assets/fonts'
            },
            {
                from: 'node_modules/redoc/bundles/redoc.standalone.js',
                to: 'assets/scripts/redoc.standalone.js'
            },
            {
                from: 'node_modules/monaco-editor/min/vs/base/browser/ui/codicons/codicon',
                to: 'assets/fonts'
            }
        ]
    }),
    new MonacoWebpackPlugin({
        // https://github.com/microsoft/monaco-editor-webpack-plugin#options
        languages: ['yaml']
    })
  ]
};

module.exports = config;
