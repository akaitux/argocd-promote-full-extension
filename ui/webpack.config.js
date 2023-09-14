const path = require('path');

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
        // prevent overriding global page styles
        test: path.resolve(__dirname, 'node_modules/argo-ui/src/components/page/page.scss'),
        use: 'null-loader',
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
