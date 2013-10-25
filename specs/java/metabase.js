/**
 * metabase test case
 */
var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    metabase = require(path.join(__dirname,'..','..','lib','java','metabase.js')),
    androidPath;


describe("java metabase", function() {

	before(function(done){
		var p = process.env.PATH.split(path.delimiter),
			versions = [ '8', '17' ];

		// try and find android
		for (var c = 0; c < p.length; c++) {
			var f = p[c];
			for (var d = 0, dL = versions.length; d < dL; d++) {
				var ad = path.join(f, '..', 'platforms', 'android-' + versions[d], 'android.jar');
				if (fs.existsSync(ad)) {
					should.exist(androidPath = ad);
					return done();
				}
			}
		}

		// android was not found
		should.exist(null, 'Android SDK with version ' + (versions.join(' or ')) + ' not found in PATH.');
		done();
	});

	it("should load",function(done) {
		should.exist(metabase);
		done();
	});

	it("should parse into buffer",function(done) {

		metabase.generate(androidPath, function(err,buf){
			should.not.exist(err);
			should.exist(buf);
			done();
		});

	});

	it("should parse into JSON",function(done) {

		metabase.generateJSON(androidPath, function(err,json){
			should.not.exist(err);
			should.exist(json);
			json.should.be.a('object');
			json.classes.should.be.a('object');
			should.exist(json.classes['android.app.Activity']);
			json.classes['android.app.Activity'].properties.should.be.a('object');
			json.classes['android.app.Activity'].methods.should.be.a('object');
			json.classes['android.app.Activity'].superClass.should.eql('android.view.ContextThemeWrapper');
			json.classes['android.app.Activity'].metatype.should.eql('class');
			json.classes['android.app.Activity'].package.should.eql('android.app');
			done();
		});

	});

	it("should parse into file",function(done) {

		var f = path.join(process.env.TMPDIR || process.env.TEMP || '/tmp','metabase.out');
		if (fs.existsSync(f)){
			fs.unlinkSync(f);
		}

		metabase.generateFile(androidPath, f, function(err,f){
			should.not.exist(err);
			should.exist(f);
			should.exist(fs.existsSync(f));
			var json = JSON.parse(fs.readFileSync(f).toString());
			json.should.be.a('object');
			json.classes.should.be.a('object');
			should.exist(json.classes['android.app.Activity']);
			fs.unlinkSync(f);
			done();
		});

	});

});