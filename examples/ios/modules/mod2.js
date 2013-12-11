global.assert(module.filename==='mod2.js',"module.filename should be 'mod2.js'",module.filename);
global.assert(module.parent.id==='foo/bar',"module.parent.id should be 'foo/bar'",module.parent.id);
global.assert(module.parent.loaded===false,"module.parent.loaded should be false",module.parent.loaded);
global.assert(module.parent.id==='foo/bar',"module.parent.id should be 'foo/bar'",module.parent.id);

