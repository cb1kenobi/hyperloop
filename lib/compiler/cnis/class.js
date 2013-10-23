var crypto = require('crypto'),
	ugly = require('uglify-js'),
	U = require('../utils');

module.exports = function(node, sourcefile, build_opts, filename) {
	// Make sure we have a valid node
	if (!node || node.args == null) {
		throw new Error('Invalid use of @class. Must have at least 2 arguments. ' + U.nodeInfo(node));
	}

	// Make sure we have a valid className
	var className = (node.args[0] || {}).value;
	if (!className || typeof className !== 'string') {
		throw new Error('Invalid class name for @class. Must be a string. ' + U.nodeInfo(node));
	}

	// Make sure we have a valid extendsName
	var extendsName = (node.args[1] || {}).name;

	var interfaces = node.args[2].elements.map(function(v){return v.value||v.name}),
		methods = [],
		paramBody = [];

	node.args[3].elements.forEach(function(el){
		var method = {};
		el.properties.forEach(function(e){
			switch(e.key) {
				case 'name': {
					method[e.key] = U.toValue(e.value,el);
					break;
				}
				case 'returnType': {
					method.returnType = U.toValue(e.value,el);
					break;
				}
				case 'arguments': {
					method.arguments = [];
					e.value.elements.forEach(function(element){
						var arg = {};
						element.properties.forEach(function(p){
							arg[p.key] = U.toValue(p.value,p);
						});
						method.arguments.push(arg);
					});
					break;
				}
				case 'action': {
					var body = e.value.print_to_string();
					method.action_name = e.value.name && e.value.name.name || method.name;
					// make the name unique hashed on the body contents in case we
					// have multiple method names as the same (such as objective-c)
					method.action_name += '_'+crypto.createHash('md5').update(body).digest('hex').substring(0,4);
					paramBody.push(method.action_name+':'+body);
					break;
				}
				default: {
					log.warn('Unknown property "' + e.key + '" used with @class. Ignoring...');
					break;
				}
			}
		});
		methods.push(method);
	});

	sourcefile.processCustomClass(node,className,extendsName,interfaces,methods,'Make$'+className);

	return ugly.parse('Make$' + className + '({' + paramBody.join(',') + '})', {
		filename: filename
	}).body[0].body;
};