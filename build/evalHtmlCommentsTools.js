const regexpReservedChars = '\\.+*?^$|[{()';

const regexpReserved = new RegExp('([' + regexpReservedChars.split('').map(char => '\\'+char).join('') + '])', 'gu');

function regexpQuote(str) {

	return str.replace(regexpReserved, '\\$1');
}

function blockList(wholeContent) {

  return [...wholeContent.matchAll(/<\!--(.*?)--\>/g)].map(e => e[1]);
}

const replaceBlock = (currentContent, tag, content) => {

	const block = [ `<\!--${ tag }--\>`, `<\!--/${ tag }--\>` ];
	const regexp = new RegExp(regexpQuote(block[0]) + '([ \\t]*\\r?\\n?)([^]*?)(\\s*)' + regexpQuote(block[1]), 'g');
	return currentContent.replace(regexp, (all, wsLeft, prevContent, wsRight) => block[0] + wsLeft + (typeof content === 'function' ? content(prevContent) : content) + wsRight + block[1]);
}


module.exports = {
	blockList,
	replaceBlock,
}
