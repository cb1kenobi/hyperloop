console.log('bar/cat/index filename=',!!(module.filename==='bar/cat/index.js'));
console.log(module.filename,'parent=>',!!(module.parent.id==='app'));
console.log(module.filename,'loaded=>',!!(module.parent.loaded===false));
