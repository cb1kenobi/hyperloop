global.assert(module.filename === 'cat/dog.js', "module.filename should be 'cat/dog.js'", module.filename);
global.assert(module.parent.id === 'app', "module.parent.id should be 'app'", module.parent.id);
global.assert(module.parent.loaded === false, "module.parent.loaded should be false", module.parent.loaded);


// test exports off module

module.exports.name = 'shelby';
