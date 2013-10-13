globals.assert(module.filename==='mod2.js',"module.filename should be 'mod2.js'",module.filename);
globals.assert(module.parent.id==='foo/bar',"module.parent.id should be 'foo/bar'",module.parent.id);
globals.assert(module.parent.loaded===false,"module.parent.loaded should be false",module.parent.loaded);
globals.assert(module.parent.id==='foo/bar',"module.parent.id should be 'foo/bar'",module.parent.id);

