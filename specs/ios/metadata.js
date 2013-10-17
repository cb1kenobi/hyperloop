var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    metabase = require(path.join(__dirname,'..','..','lib','ios','metabase.js')),
    buildlib = require(path.join(__dirname,'..','..','lib','ios','buildlib.js')),
    clangparser = require(path.join(__dirname,'..','..','lib','ios','clangparser.js')),
    metadata;

exports.getMetadata = function(done) {
	if (metadata) return done(null,metadata);
	var TMPDIR = process.env.TMPDIR || '/tmp/',
		headerfile = path.join(__dirname,'src','header.h'),
		minversion = '7.0',
		nativeargs = null,
		arc = false,
		cached = path.join(TMPDIR,'clangout_'+arc+'.txt'),
		cachedAST = path.join(TMPDIR,'clangout_'+arc+'.ast');

	console.log('executing clang, this will take a minute. if you get a timeout error, re-run with --timeout 60s');
	console.log('writing ast out to ',cached);

	metabase.clang(headerfile, {
			minVersion: minversion,
			nativeArgs: nativeargs,
			arc: arc
		},
		function(err,result){
			if (err) return done(err);
			should.not.exist(err);
			should.exist(result);

			if (!fs.existsSync(cached)) {
				fs.writeFileSync(cached,result);
			}

			if (fs.existsSync(cachedAST)) {
				var buf = fs.readFileSync(cachedAST);
				metadata = JSON.parse(buf.toString());
				should.exist(metadata);
				done(null,metadata);
			}
			else {
				clangparser.parseBuffer(result,function(err,ast){
					if (err) return done(err);
					should.not.exist(err);
					should.exist(ast);
					metadata = ast.toJSON();
					fs.writeFile(cachedAST,JSON.stringify(ast,null,'  '),function(err){
						done(err,metadata);
					});
				});
			}
		}
	);
}