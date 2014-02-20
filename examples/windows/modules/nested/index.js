try {
	var m = require('module');
	global.assert(m.a === 3, "nested/index require node_modules/module.3 === 3", m.a);
}
catch (err) {
	assert(false, "raised exception when requiring node_modules/module from nested/index", err.message || err);
}

exports.count = 1;

// test global
global.foobar = 123;