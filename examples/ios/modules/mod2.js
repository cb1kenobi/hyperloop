console.log('mod2 filename=',!!(module.filename==='mod2.js'));
console.log(module.filename,'parent=>',module.parent.id);
console.log(module.filename,'parent=>',!!(module.parent.id==='foo/bar'));
console.log(module.filename,'loaded=>',!!(module.parent.loaded===false));
