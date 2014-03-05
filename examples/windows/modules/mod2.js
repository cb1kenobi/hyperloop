global.assert(module.filename === 'mod2.js', "module.filename should be 'mod2.js'", module.filename);
global.assert(module.parent.id === 'bar/cat/lion', "module.parent.id should be 'bar/cat/lion'", module.parent.id);
global.assert(module.parent.loaded === false, "module.parent.loaded should be false", module.parent.loaded);
global.assert(module.parent.id === 'bar/cat/lion', "module.parent.id should be 'bar/cat/lion'", module.parent.id);

