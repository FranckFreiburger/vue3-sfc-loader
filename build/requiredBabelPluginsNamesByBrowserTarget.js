const path = require('path');

const webpack = require('webpack');
const MemoryFileSystem = require('memory-fs')

/**
 * here we extract plugin module names from @babel/preset-env/lib/available-plugins.js
 * example:
 *   getPluginModuleName('bugfix/transform-v8-static-class-fields-redefine-readonly') -> '@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly'
 * 
 * if you find a better way to convert plugin name? to plugin module name
 *  -> https://github.com/FranckFreiburger/vue3-sfc-loader/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title=better+than+getPluginModuleName
 */
const initGetPluginModuleName = new Promise((resolve, reject) => {

  const compiler = webpack({
    entry: path.join(__dirname, '../node_modules/@babel/preset-env/lib/available-plugins.js'),
    output: {
      path: '/',
      filename: 'bundle.js',
      library: {
          type: 'commonjs', // doc: https://webpack.js.org/configuration/output/#type-commonjs
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'require': '__require',
      }),
    ]
  });
  
  compiler.outputFileSystem = new MemoryFileSystem();
  compiler.run(err => {

    if (err)
        return reject(err)

    const script = compiler.outputFileSystem.readFileSync(`${compiler.options.output.path}/${compiler.options.output.filename}`).toString();
    const data = Function('__require', 'exports = {};' +script + '; return exports.default')(id => ({ default: id }));
    function getPluginModuleName(id) {

        const tmp = data[id]();
        return tmp.default ?? data[id]();
    }
    resolve(getPluginModuleName);
  });

})


module.exports = async function(targetsBrowsersString) {
  
  const browserslist = require('browserslist')
  const pluginsCompatData = require('@babel/preset-env/lib/plugins-compat-data');
  const filterItems = require('@babel/helper-compilation-targets').filterItems
  const helperCompilationTargets = require('@babel/helper-compilation-targets').default
  
  const browsers = browserslist(targetsBrowsersString);

  const getPluginModuleName = await initGetPluginModuleName;

  // see @babel/preset-env/lib/index.js:307
  return [...filterItems(pluginsCompatData.plugins, new Set(), new Set(), helperCompilationTargets({ browsers }), []) ].map(getPluginModuleName);
}
