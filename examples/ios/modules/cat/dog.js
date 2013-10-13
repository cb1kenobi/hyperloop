globals.assert(module.filename==='cat/dog.js',"module.filename should be 'cat/dog.js'",module.filename);
globals.assert(module.parent.id==='app',"module.parent.id should be 'app'",module.parent.id);
globals.assert(module.parent.loaded===false,"module.parent.loaded should be false",module.parent.loaded);



// test exports off module

module.exports.name = 'shelby';
