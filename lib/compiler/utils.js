/**
 * turn an AST node array into a JS array
 */
var makeArrayFromArg = exports.makeArrayFromArg = function(arg, node) {
	var array = [];
	if (arg.elements && arg.elements.length) {
		arg.elements.forEach(function(a){
			if (a.value) {
				array.push(a.value);
			}
			else if (a.name) {
				var value = (node && node.scope || node.expression && node.expression.scope) ? (node.scope ? (node.scope) : (node.expression.scope)).find_variable(a.name) : null;
				array.push(value || a.name);
			}
		});
	}
	return array;
}

/**
 * turn an AST node value into a JS value
 */
var toValue = exports.toValue = function(value, node) {
	if (!value) return null;

	if (value.elements) {
		value = makeArrayFromArg(value,node);
	}
	else if (value.properties) {
		value = makeDictionaryFromArg(value,node);
	}
	else if (value.value) {
		value = value.value;
	}
	else if (value.name) {
		// this is a dynamic value look it up
		var v = value.scope.find_variable(value.name);
		if (!v) {
			// variable was not found
			throw new Error("Couldn't find variable named: "+value.name+" at "+value.start.file+" on "+value.start.line+":"+value.start.col);
		}
		value = toValue(v.init,node);
	}
	else if (value.left && value.right && value.operator) {
		// this is an expression
		value = evalExpression(node,value);
	}
	return value;
}

/**
 * attempt to static evaluate an AST expression into a JS string
 */
var evalExpression = exports.evalExpression = function(node, arg) {
	var scope = {},
		expr = [],
		vars = node.expression.scope ? node.expression.scope.variables._values : node.expression.expression.scope.variables._values,
		fn;
	//expand our scope into function args that we can invoke to resolve the value
	for (var k in vars) {
		var v = vars[k].init.value;
		scope[k.substring(1)] = v;
		expr.push(v);
	}
	try {
		fn = "(function("+Object.keys(scope).join(",")+"){ return " + arg.left.print_to_string() + arg.operator + arg.right.print_to_string() + "; })";
		var expression = eval(fn);
		return expression.apply(scope,expr);
	}
	catch(E){
		var r = /(\w) is not defined/,
			m = r.exec(E.message);
		if (m) {
			throw new Error("can't seem to determine value of '"+m[1]+"' during import at "+node.start.file+' on line '+node.start.line);
		}
		throw E;
	}
}

/**
 * turn a AST node dictionary into a JS dictionary
 */
var makeDictionaryFromArg = exports.makeDictionaryFromArg = function(arg, node) {
	var obj = {};
	arg.properties.forEach(function(p) {
		obj[p.key] = toValue(p.value, node);
	});
	return obj;
}

var nodeIsArray = exports.nodeIsArray = function(node) {
	return node.elements && typeof(node.elements)==='object';
}

var nodeIsObjectLiteral = exports.nodeIsObjectLiteral = function(node) {
	return node.properties && typeof(node.properties)==='object';
}

var nodeInfo = exports.nodeInfo = function(node) {
	if (!node || !node.start) { return '()'; }
	return '(' + node.start.file + ':' + node.start.line + ':' + node.start.col + ')';
};
