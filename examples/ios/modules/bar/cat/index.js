console.log('bar/cat/index filename=',!!(module.filename==='bar/cat/index.js'));
console.log(module.filename,'parent=>',!!(module.parent.id==='app'));
console.log(module.filename,'loaded=>',!!(module.parent.loaded===false));

var Lion = module.require('./lion');

var lion = new Lion();
console.log('should be "roar!" = ', !!(lion.sound()==='roar!'));

