module.exports = function(targetsBrowsersString) {
  
  const browserslist = require('browserslist')
  const pluginsCompatData = require('@babel/preset-env/lib/plugins-compat-data');
  const filterItems = require('@babel/helper-compilation-targets').filterItems
  const helperCompilationTargets = require('@babel/helper-compilation-targets').default
  
  const browsers = browserslist(targetsBrowsersString);

  // see @babel/preset-env/lib/index.js:307
  return [...filterItems(pluginsCompatData.plugins, new Set(), new Set(), helperCompilationTargets({ browsers }), []) ];
}
