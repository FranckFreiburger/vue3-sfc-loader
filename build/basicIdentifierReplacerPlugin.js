module.exports = function basicIdentifierReplacerPlugin({ types: t }) {

	function IdentifierVisitor(path, { opts }) {

		if ( Object.prototype.hasOwnProperty.call(opts, path.node.name) ) {
			
			const replacement = opts[path.node.name];

			if (
				   path.parent.type === 'UnaryExpression'
				&& path.parent.operator === 'typeof'
				&& path.parentPath.parent.type === 'BinaryExpression'
				//&& path.parentPath.parent.operator === '!=='
				&& path.parentPath.parent.right.type === 'StringLiteral'
				&& path.parentPath.parent.right.value === 'undefined'
			) {

				//require('inspector').url() || require('inspector').open(null, null, true); debugger;

				// typeof undefined === 'undefined'
				if ( replacement === 'undefined' && path.parentPath.parent.operator === '===' )
					return void path.parentPath.parentPath.replaceWithSourceString('true');

				// typeof undefined !== 'undefined'
				if ( replacement === 'undefined' && path.parentPath.parent.operator === '!==' )
					return void path.parentPath.parentPath.replaceWithSourceString('false');

				// match: typeof XXX !== 'undefined'
				if ( path.parentPath.parent.operator === '!==' )
					return void path.parentPath.parentPath.replaceWithSourceString('true');
					
				// match: typeof XXX === 'undefined'
				if ( path.parentPath.parent.operator === '===' )
					return void path.parentPath.parentPath.replaceWithSourceString('false');

				throw new Error('case not yet handled');
			}

			// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#replacing-a-node-with-a-source-string

			//require('inspector').url() || require('inspector').open(null, null, true); debugger;
			path.replaceWithSourceString(replacement);
		}
	}

	return {
		visitor: {
			Program: {
				enter(path, state) {

					path.traverse({
						Identifier: IdentifierVisitor
					}, state);
				},
			},
		}
	};

}

