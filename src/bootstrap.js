// 1/

// add sticky flag support
const original_RegExp = global.RegExp;

class PolyfilledRegExp extends global.RegExp {
  constructor(regex, flags = '') {
    if (flags.indexOf("y") === -1) {
      return new original_RegExp(regex, flags);
    }
    super(regex, flags.replace("y", "g"));
    Object.defineProperty(this, "sticky", { value: true, readonly: true });
  }

  test(str) {
    return !!this.exec(str);
  }

  exec(str) {
    const lastIndex = this.lastIndex;
    const result = super.exec(str);
    if (!result || result.index !== lastIndex) {
      this.lastIndex = 0;
      return null;
    }
    return result;
  }
}

//RegExp = PolyfilledRegExp;
global.RegExp = function(regex, flags = '') {

  return new PolyfilledRegExp(regex, flags);
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

  if ( global[name] )
    global[name].prototype[Symbol.toStringTag] = name;
}


