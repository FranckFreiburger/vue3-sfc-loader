// polyfill only stable `core-js` features - ES and web standards:
import "core-js/stable";

// 1/
//
// add sticky flag support
//
// src: https://github.com/paulmillr/es6-shim/issues/376#issue-118172552

if ( !('sticky' in global.RegExp.prototype) ) {
  
  const OriginalRegExp = global.RegExp;

  const originalExec = OriginalRegExp.prototype.exec;
  OriginalRegExp.prototype.exec = function (string) {

    const lastIndex = this.lastIndex;
    const result = originalExec.call(this, string);

    if ( this._sticky && result != null && this.lastIndex - result[0].length !== lastIndex ) {

      this.lastIndex = 0;
      return null;
    }

    return result;
  };

  OriginalRegExp.prototype.test = function(string) {
    
    return !!this.exec(string);
  }
  
  function PolyfilledRegExp(pattern, flags) {

    const i = flags != undefined ? flags.indexOf('y') : -1;
    const x = new OriginalRegExp(pattern, i === -1 ? flags : flags.slice(0, i) + flags.slice(i + 1) + (flags.indexOf('g') === -1 ? 'g' : ''));
    x._sticky = i !== -1;
    
    return x;
  };

  PolyfilledRegExp.prototype = OriginalRegExp.prototype; // handle instanceof: new RegExp('.*') instanceof RegExp
  
  global.RegExp = PolyfilledRegExp;
}


// 2/
//
// because :
// - IE11 has typed array
// - IE11 has no toStringTag symbol on typed array
// - polyfills is "usage-pure" (no global scope pollution)
// -> fix missing Symbol.toStringTag on typed array prototype (used by util > is-typed-array)
//      var arr = new global[typedArray]();
//      if (!(Symbol.toStringTag in arr)) {
//        ...
//

for ( let name of [
	'Int8Array',
	'Uint8Array',
	'Uint8ClampedArray',
	'Int16Array',
	'Uint16Array',
	'Int32Array',
	'Uint32Array',
	'Float32Array',
	'Float64Array',
	'BigInt64Array',
	'BigUint64Array'
] ) {

  if ( global[name] && !(Symbol.toStringTag in global[name].prototype) )
    Object.defineProperty(global[name].prototype, Symbol.toStringTag, { value: name });

}


