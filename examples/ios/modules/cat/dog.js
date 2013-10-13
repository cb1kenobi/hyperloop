console.log('cat/dog filename=',!!(module.filename==='cat/dog.js'));
console.log(module.filename,'parent=>',!!(module.parent.id==='app'));
console.log(module.filename,'loaded=>',!!(module.parent.loaded===false));


// test exports off module

module.exports.name = 'shelby';
