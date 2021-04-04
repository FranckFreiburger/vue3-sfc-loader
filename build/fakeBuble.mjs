import {
	parse,
} from '@babel/parser';

import {
	traverse,
	transformFromAstSync,
	types as t,
} from '@babel/core';



export function transform(source, opts) {

	/*
	opts:
		objectAssign: "Object.assign"
		transforms:
			modules: false
			stripWith: true
			stripWithFunctional: false
	*/


	// links :
	//   used by vue-template-es2015-compiler: https://github.com/vuejs/vue-template-es2015-compiler
	//   babel types: https://babeljs.io/docs/en/babel-types
	//   doc: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-inserting-a-sibling-node
	//   astexplorer: https://astexplorer.net/

	const srcAst = parse(source);

	// TBD: add import() ?

	const names = 'Infinity,undefined,NaN,isFinite,isNaN,' +
	  'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
	  'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
	  'require,' + // for webpack
	  'arguments,' + // parsed as identifier but is a special keyword...
	  '_h,_c' // cached to save property access (_c for ^2.1.5)

	const hash = Object.create(null)
	names.split(',').forEach(name => {
	  hash[name] = true
	})


	// all buble types : https://github.com/yyx990803/buble/blob/f5996c9cdb2e61cb7dddf0f6c6f25d0f3f600055/src/program/types/index.js

	// ClassDeclaration,
	// ExportNamedDeclaration,
	// ExportDefaultDeclaration,
	// FunctionDeclaration,
	// ImportDeclaration,
	// VariableDeclaration,

	const isDeclaration = type => /Declaration$/.test(type); // match babel types


	// ArrowFunctionExpression,
	// FunctionDeclaration,
	// FunctionExpression,

	const isFunction = type => /Function(Expression|Declaration)$/.test(type); // match babel types

	// see yyx990803/buble prependVm.js : https://github.com/yyx990803/buble/blob/master/src/utils/prependVm.js

	// see vue3 : https://github.com/vuejs/vue-next/blob/55d99d729e147fae515c12148590f0100508c49d/packages/compiler-core/src/transforms/transformExpression.ts#L382-L443
	function shouldPrependVm(identifier) {

		if (

			// not id of a Declaration
			!(isDeclaration(identifier.parent.type) && identifier.parent.id === identifier.node) &&

			// not a params of a function
			!(isFunction(identifier.parent.type) && identifier.parent.params.indexOf(identifier.node) > -1) &&

			// not a key of Property
			!(identifier.parent.type === 'ObjectProperty' && identifier.parent.key === identifier.node && !identifier.parent.computed) &&

			// not a property of a MemberExpression
			!( (identifier.parent.type === 'MemberExpression' || identifier.parent.type === 'OptionalMemberExpression') && identifier.parent.property === identifier.node && !identifier.parent.computed) &&

			// not in an Array destructure pattern
			!(identifier.parent.type === 'ArrayPattern') &&

			// not in an Object destructure pattern
			!(identifier.parentPath.parent.type === 'ObjectPattern') &&

			// skip globals + commonly used shorthands
			!hash[identifier.node.name] &&

			// not already in scope
			!identifier.scope.hasBinding(identifier.node.name, false /* noGlobals */) // noGlobals false mean include globals (Array, Date, ...) and contextVariables (arguments, ...)

		) {

			return true;
		}
	}


	// TBD: check https://github.com/yyx990803/buble/commit/af5d322e6925d65ee6cc7fcaadbe25a4151bfcdd

	const withStatementVisitor = {
		Identifier(path) {

			if ( shouldPrependVm(path) ) {

				// don't know how to handle re-rentancy
				//path.replaceWith(t.MemberExpression(t.identifier('_vm'), t.identifier(path.node.name)));
				// then use:
				path.node.name = '_vm.' + path.node.name;
			}
		},
		WithStatement(path) {

			// let handle this by the parent traverse
			path.skip();
		},
	};

	traverse(srcAst, {

		// babel withstatement https://babeljs.io/docs/en/babel-types#withstatement
		// see yyx990803/buble WithStatement.js : https://github.com/yyx990803/buble/blob/master/src/program/types/WithStatement.js

		WithStatement: {
			enter(path) {

				path.traverse(withStatementVisitor);
			},
			exit(path) {

				const parentWithStatement = path.findParent(e => e.isWithStatement());
				if ( parentWithStatement === null ) {

					const left = parse('var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h');
					path.replaceWithMultiple([ ...left.program.body, ...path.node.body.body ]);
				} else {

					// just remove with statement
					path.replaceWithMultiple(path.node.body.body);
				}
			}
		}

	});

	const { code, map, ast } = transformFromAstSync(srcAst, source);


	return {
		code,
	}
}
