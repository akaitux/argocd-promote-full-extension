const path = require('path');
const webpack = require('webpack');


const groupKind = 'argoproj.io/ApplicationSet';

const config = {
  entry: {
    extension: './src/index.tsx',
  },
  mode: 'production',
  output: {
    filename: 'extensions.js',
    path: __dirname + `/dist/resources/${groupKind}/ui`,
    libraryTarget: 'window',
    library: ['extensions', 'resources', groupKind],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.ttf', '.scss'],
  },
  externals: {
    react: 'React',
  },
  ignoreWarnings: [{
        module: new RegExp('/node_modules/.*')
  }],
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
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        options: {
            loader: 'tsx',
            target: 'es2015',
            tsconfigRaw: require('./src/tsconfig.json')
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
};

module.exports = config;
