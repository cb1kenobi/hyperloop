/**
 * winmd test case
 */
var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    ilparser = require('../../lib/windows/ilparser'),
    templates_dir = path.join(__dirname,'winmd');

describe("ilparser", function() {

	it("should parse complex class type", function(done) {

		var template = path.join(templates_dir,'winmd.il');

		ilparser.parseFile(template,function(err,ast){
			if (err) return done(err);
			ast.should.not.be.null;
			ast.should.have.property('metatype','toplevel');
			ast.should.have.property('children');
			ast.children.should.have.length(1);
			var json = ast.toJSON();
			json.should.not.be.null;
			json.should.have.property('classes');
			json.classes.should.have.property('Windows.Foundation.Collections.IPropertySet');
			json.classes['Windows.Foundation.Collections.IPropertySet'].should.have.property('attributes');
			json.classes['Windows.Foundation.Collections.IPropertySet'].should.have.property('name','Windows.Foundation.Collections.IPropertySet');
			json.classes['Windows.Foundation.Collections.IPropertySet'].should.have.property('implements');
			json.classes['Windows.Foundation.Collections.IPropertySet'].attributes.should.include('interface');
			json.classes['Windows.Foundation.Collections.IPropertySet'].attributes.should.include('public');
			json.classes['Windows.Foundation.Collections.IPropertySet'].attributes.should.include('abstract');
			json.classes['Windows.Foundation.Collections.IPropertySet'].attributes.should.include('auto');
			json.classes['Windows.Foundation.Collections.IPropertySet'].attributes.should.include('ansi');
			json.classes['Windows.Foundation.Collections.IPropertySet'].attributes.should.include('windowsruntime');
			json.classes['Windows.Foundation.Collections.IPropertySet'].implements.should.have.length(3);
			json.classes['Windows.Foundation.Collections.IPropertySet'].implements[0].should.be.equal('class Windows.Foundation.Collections.IObservableMap`2<string,object>');
			json.classes['Windows.Foundation.Collections.IPropertySet'].implements[1].should.be.equal('class Windows.Foundation.Collections.IMap`2<string,object>');
			json.classes['Windows.Foundation.Collections.IPropertySet'].implements[2].should.be.equal('class Windows.Foundation.Collections.IIterable`1<class Windows.Foundation.Collections.IKeyValuePair`2<string,object>>');
			done();
		});
	});

	it("should handle embedded comments in directives", function(done){
		var template = path.join(templates_dir,'winmd2.il');

		ilparser.parseFile(template,function(err,ast){
			if (err) return done(err);
			ast.should.not.be.null;
			var json = ast.toJSON();
			json.should.not.be.null;
			json.should.have.property('classes');
			Object.keys(json.classes).should.have.length(0);
			done();
		});

	});

	it("should handle embedded comments in class", function(done){
		var template = path.join(templates_dir,'winmd3.il');

		ilparser.parseFile(template,function(err,ast){
			if (err) return done(err);
			ast.should.not.be.null;
			var json = ast.toJSON();
			json.should.not.be.null;
			json.should.have.property('classes');
			Object.keys(json.classes).should.have.length(1);
			json.classes.should.have.property('Windows.UI.ApplicationSettings.ISettingsCommandFactory');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].should.have.property('attributes');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].should.have.property('name','Windows.UI.ApplicationSettings.ISettingsCommandFactory');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].should.have.property('methods');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].attributes.should.include('interface');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].attributes.should.include('private');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].attributes.should.include('abstract');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].attributes.should.include('auto');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].attributes.should.include('ansi');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].attributes.should.include('windowsruntime');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods.should.have.length(1);
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].should.have.property('attributes');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].should.have.property('args');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].should.have.property('returnType','class Windows.UI.ApplicationSettings.SettingsCommand');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].should.have.property('name','Create');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('public');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('hidebysig');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('newslot');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('abstract');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('virtual');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('instance');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('cil');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].attributes.should.include('managed');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args.should.have.length(3);
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[0].should.have.property('inout','in');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[0].should.have.property('type','object');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[0].should.have.property('name','settingsCommandId');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[1].should.have.property('inout','in');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[1].should.have.property('type','string');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[1].should.have.property('name','label');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[2].should.have.property('inout','in');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[2].should.have.property('type','class Windows.UI.Popups.UICommandInvokedHandler');
			json.classes['Windows.UI.ApplicationSettings.ISettingsCommandFactory'].methods[0].args[2].should.have.property('name','handler');
			done();
		});

	});

	it("should handle class with fields", function(done){
		var template = path.join(templates_dir,'winmd4.il');

		ilparser.parseFile(template,function(err,ast){
			if (err) return done(err);
			ast.should.not.be.null;
			var json = ast.toJSON();
			json.should.not.be.null;
			json.should.have.property('classes');
			Object.keys(json.classes).should.have.length(1);
			json.classes.should.have.property('Windows.UI.ViewManagement.ApplicationViewState');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].should.have.property('attributes');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].should.have.property('name','Windows.UI.ViewManagement.ApplicationViewState');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].should.have.property('extends','[mscorlib]System.Enum');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].should.have.property('fields');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].attributes.should.include('sealed');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].attributes.should.include('auto');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].attributes.should.include('ansi');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].attributes.should.include('windowsruntime');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.should.have.property('value__');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.should.have.property('FullScreenLandscape');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.should.have.property('FullScreenPortrait');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.should.have.property('Filled');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.should.have.property('Snapped');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('name','Snapped');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('attributes');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('assignType','int32');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('assignValue','0x00000002');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('static');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('literal');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.type.should.be.equal('valuetype Windows.UI.ViewManagement.ApplicationViewState');

			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('name','Snapped');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('attributes');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('assignType','int32');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.should.have.property('assignValue','0x00000002');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('static');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('literal');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Snapped.type.should.be.equal('valuetype Windows.UI.ViewManagement.ApplicationViewState');

			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.should.have.property('name','value__');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.should.have.property('attributes');
			should.strictEqual(json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.assignType,undefined);
			should.strictEqual(json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.assignValue,undefined);
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.attributes.should.include('private');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.attributes.should.include('specialname');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.attributes.should.include('rtspecialname');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.value__.type.should.be.equal('int32');

			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.should.have.property('name','FullScreenLandscape');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.should.have.property('attributes');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.should.have.property('assignType','int32');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.should.have.property('assignValue','0x00000000');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.attributes.should.include('static');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.attributes.should.include('literal');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenLandscape.type.should.be.equal('valuetype Windows.UI.ViewManagement.ApplicationViewState');

			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.should.have.property('name','FullScreenPortrait');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.should.have.property('attributes');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.should.have.property('assignType','int32');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.should.have.property('assignValue','0x00000003');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.attributes.should.include('static');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.attributes.should.include('literal');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.FullScreenPortrait.type.should.be.equal('valuetype Windows.UI.ViewManagement.ApplicationViewState');

			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.should.have.property('name','Filled');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.should.have.property('attributes');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.should.have.property('assignType','int32');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.should.have.property('assignValue','0x00000001');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.attributes.should.include('public');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.attributes.should.include('static');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.attributes.should.include('literal');
			json.classes['Windows.UI.ViewManagement.ApplicationViewState'].fields.Filled.type.should.be.equal('valuetype Windows.UI.ViewManagement.ApplicationViewState');

			done();
		});
	});
});
