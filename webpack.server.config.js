const path = require('path');
const fs = require('fs');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const SRC_PATH = path.join(process.cwd(), 'src');
const DIST_PATH = path.join(process.cwd(), 'dist');
const PUBLIC_PATH = path.join(DIST_PATH, 'browser');

module.exports = function (env = {}) {
  const SSR_ENABLED = !!env.ssr;
  const NG_PROXY = !!env.ngProxy;
  const NG_PORT = typeof env.ngPort === 'number' ? env.ngPort : 4200;

  return {
    entry: {
      server: path.join(SRC_PATH, 'server/server.ts'),
      // todo: enable prerender
      // prerender: './prerender.ts'
    },
    target: 'node',
    resolve: {
      extensions: ['.ts', '.js']
    },
    // Make sure we include all node_modules etc
    externals: [/(node_modules|main\..*\.js)/,],
    output: {
      path: DIST_PATH,
      filename: '[name].js'
    },
    module: {
      rules: [
        { test: /\.ts$/, loader: 'ts-loader' }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        SSR_ENABLED,
        NG_PROXY,
        NG_PORT,
        SCRIPTS: NG_PROXY
          ? JSON.stringify(['inline.bundle.js', 'polyfills.bundle.js', 'styles.bundle.js', 'vendor.bundle.js', 'main.bundle.js'])
          : getProdAssets('js', ['inline', 'polyfills', 'vendor', 'main']),
        STYLES: NG_PROXY
          ? JSON.stringify([])
          : getProdAssets('css', ['styles'])
      }),
      new webpack.ContextReplacementPlugin(
        // fixes WARNING Critical dependency: the request of a dependency is an expression
        /(.+)?angular(\\|\/)core(.+)?/,
        SRC_PATH, // location of your src
        {} // a map of your routes
      ),
      new webpack.ContextReplacementPlugin(
        // fixes WARNING Critical dependency: the request of a dependency is an expression
        /(.+)?express(\\|\/)(.+)?/,
        SRC_PATH,
        {}
      ),
      new CopyWebpackPlugin([
        { from: path.join(SRC_PATH, 'server/views'), to: 'views' }
      ])
    ]
  };

  function getProdAssets(ext, names) {
    if (!fs.existsSync(PUBLIC_PATH)) {
      const command = SSR_ENABLED ? `build:client-and-server-bundles` : 'build';
      throw new Error(`Assets not found! Execute 'npm run ${command}' before building the server!`);
    }
  
    const matchers = glob.sync(`${PUBLIC_PATH}/*.${ext}`);
    const assets = names
      .map(name => new RegExp(name))
      .map(name => matchers.find(fileName => name.test(fileName)))
      .filter(fileName => !!fileName)
      .map(fileName => path.basename(fileName));
  
    return JSON.stringify(assets);
  }
}
