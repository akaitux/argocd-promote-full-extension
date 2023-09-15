const path = require('path');

const groupKind = 'argoproj.io/ApplicationSet';

const config = {
  entry: {
    extension: './src/index.tsx',
  },
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
