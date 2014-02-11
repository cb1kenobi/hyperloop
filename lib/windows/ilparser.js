/**
 * Windows 8 WinMD IL parser
 */

var fs = require('fs'),
	path = require('path'),
	log = require('../log'),
	_ = require('underscore');

exports.parseFile = parseFile;
exports.parseBuffer = parseBuffer;

function parseFile(fn, callback) {
	var byline = require('byline'),
		output = fs.createReadStream(fn),
		stream = byline(output);
	parse(stream, output, callback);
}

function parseBuffer(buf, callback) {
	var byline = require('byline'),
		streamBuffers = require("stream-buffers"),
		output = new streamBuffers.ReadableStreamBuffer();
	output.pause();
	output.put(buf);
	var stream = byline(output);
	output.resume();
	parse(stream, output, callback);
}

var classAttributesRegex = /^(private|public|auto|ansi|windowsruntime|sealed|abstract|interface)$/,
	methodAttributesRegex = /^(final|rtspecialname|family|private|public|hidebysig|newslot|specialname|abstract|virtual|instance|runtime|managed|cil|native|static)$/,
	propertySignatureRegex = /\.property\s(\w+)?\s?(.*)\s(.*)\(\)$/,
	methodSignatureRegex = /(\[(in|out)\])?\s?(.*)\s+[']?(\w+)[']?/,
	customSignatureRegex = /\.custom (\w+) (\w+) (.*)::(\.\w+)\((.*)\) = \((.*)\)$/,
	getSetSignatureRegex = /\.[g|s]et (\w+)?(?:\s(\w+))? (.*)::(\w+)\((.*)\)$/,
	fieldAttributesRegex = /^(public|static|literal|private|specialname|rtspecialname)$/,
	fieldSignatureRegex = /^\.field (.*)\s(\w+)(\s=\s(\w+)\((.*)\))?$/;

function parseGetOrSetToken(prop, node) {
	var m = getSetSignatureRegex.exec(node.line.trim());
	if (!m) {
		log.error(prop+" regex failed");
		log.fatal(node.line);
	}
	node.type = m[1];
	node.returnType = m[2];
	node.className = m[3];
	node.name = m[4];
	node.args = [];
	m[5] && m[5].split(', ').forEach(function(n){
		node.args.push(n.trim());
	});
	node.parent[prop] = node;
}

function parseAssemblyToken(node) {
}
function parseGetToken(node) {
	parseGetOrSetToken('getter',node);
}
function parseSetToken(node) {
	parseGetOrSetToken('setter',node);
}
function parseOverrideToken(node) {
	var i = node.line.indexOf(' '),
		type = node.line.substring(i+1),
		tok = type.split('::');

	node.parent.overrides = {
		type: tok[0],
		name: tok[1]
	};
}
function parseFieldToken(node) {
	var m = fieldSignatureRegex.exec(node.line);
	if (!m) {
		log.error("couldn't parse field token");
		log.fatal(node.line);
	}
	var obj = {};
	obj.attributes = [];
	var attrs = m[1].split(' ');
	for (var c=0;c<attrs.length;c++) {
		var attr = attrs[c];
 		if (fieldAttributesRegex.test(attr)) {
			obj.attributes.push(attr);
		}
		else {
			obj.type = attrs.slice(c).join(' ');
			break;
		}
	}
	obj.name = m[2];
	obj.assignType = m[4];
	obj.assignValue = m[5];
	!node.parent.fields && (node.parent.fields={});
	node.parent.fields[obj.name] = obj;
	return true;
}
function parseInterfaceimplToken(node) {
}
function parseEventToken(node) {
}
function parsePublickeytokenToken(node) {
}
function parseVerToken(node) {
}
function parseHashToken(node) {
}
function parseModuleToken(node) {
}
function parseImagebaseToken(node) {
}
function parseFileToken(node) {
}
function parseStackreserveToken(node) {
}
function parseSubsystemToken(node) {
}
function parseCorflagsToken(node) {
}
function parseParamToken(node) {
}
function parseRemoveonToken(node) {
}
function parseAddonToken(node) {
}
function parseCustomToken(node) {
	node.line = cleanupAdjacentSpacing(node.line).replace(/[ ]{2,}/g,' ').trim();
	var m = customSignatureRegex.exec(node.line);
	node.type = m[1];
	node.returnType = m[2];
	node.className = m[3];
	node.name = m[4];
	node.args = [];
	m[5] && m[5].split(', ').forEach(function(n){
		node.args.push(n.trim());
	});
}
function parseOverridemethodToken(node) {
}
function parsePropertyToken(node) {
	var m = propertySignatureRegex.exec(node.line);
	if (!m) {
		log.fatal(node.line);
	}
	node.type = m[1];
	node.returnType = m[2];
	node.name = m[3];
	!node.parent.properties && (node.parent.properties={});
	node.parent.properties[node.name] = node;
	node.children = null;
}
function parseMethodToken(node) {
	var tok = node.line.split(' '),
		obj = {
			attributes:[]
		};
	var sigline = '',
		subtoks = [];
	for (var c=1;c<tok.length;c++) {
		var token = tok[c];
		if (!token) continue;
		if (methodAttributesRegex.test(token)) {
			obj.attributes.push(token);
		}
		else {
			sigline+=token+' ';
			subtoks.push(token);
		}
	}
	sigline = sigline.trim();
	// need to parse backwards since return types can have spaces in them
	var lastParen = sigline.lastIndexOf('('),
		prevSpace = sigline.lastIndexOf(' ',lastParen),
		functionName = sigline.substring(prevSpace+1,lastParen),
		returnType = sigline.substring(0,prevSpace),
		args = sigline.substring(lastParen+1,sigline.length-1).trim().split(', ');
	obj.returnType = returnType.trim();
	obj.name = functionName.trim();
	obj.args = [];
	args.forEach(function(arg) {
		if (arg) {
			if (!methodSignatureRegex.test(arg)) {
				//NOTE: this should only happen if we found an error in the regular expression
				log.error('line=',line);
				log.error('sigline=',sigline);
				log.error('tok=',tok);
				log.error('arg=',arg);
				log.error('functionName=',functionName);
				log.error('returnType=',returnType);
				log.error('attributes=',obj.attributes);
				log.error('subtoks=',subtoks);
				for (var c=1;c<tok.length;c++) {
					var token = tok[c];
					log.error('token['+c+']=',token);
				}
				log.fatal('subtoks=',subtoks);
			}
			else {
				var m = methodSignatureRegex.exec(arg);
				obj.args.push({
					inout: m[2],
					type: m[3],
					name: m[4]
				});
			}
		}
	});
	obj.overrides = node.overrides;
	!node.parent.methods && (node.parent.methods=[]);
	node.parent.methods.push(obj);
	node.children = null;
	return true;
}

function parseClassToken(node) {
	var tok = node.line.split(' ').slice(1); // trim off command

	for (var c=0;c<tok.length;c++) {
		var token = tok[c];
		if (classAttributesRegex.test(token)) {
			!node.attributes && (node.attributes = []);
			node.attributes.push(token);
		}
		else if (token==='extends') {
			node.extends = tok[c+1].trim();
			c++;
		}
		else if (token==='implements') {
			var buffer = '';
			for (var x=c+1;x<tok.length;x++) {
				var t = tok[x];
				buffer+=t+' ';
			}
			var ctoks = buffer.split(', ');
			node.implements = ctoks.map(function(e){return e.trim();});
			c = tok.length;
		}
		else {
			var className = token.trim();
			if (className) {
				node.name = className;
			}
		}
	}
}

function parseToplevelToken(node) {
	// nothing to do at top level
}

function parseNode(node,indent) {
	var fnName = 'parse'+node.metatype.charAt(0).toUpperCase()+node.metatype.substring(1)+'Token',
		fn = eval(fnName);
	// process children first, in case they need to work against the parent
	if (node.children) {
		var removal = [];
		node.children.forEach(function(child){
			if (parseNode(child,indent+'\t')) {
				removal.push(child);
			}
		});
		removal.forEach(function(r){
			var i = node.children.indexOf(r);
			node.children.splice(i,1);
		});
	}
	// now process this node
	return fn(node);
}

function Node(metatype,line,parent) {
	this.metatype = metatype;
	this.line = line;
	this.parent = parent;
	return this;
}

var KEY_BLACKLIST = ['parent','children','line','toJSON','metatype'];

Node.prototype.toJSON = function() {
	if (this.metatype==='toplevel') {
		var json = {classes:{},types:{}};
		this.children.forEach(function(child){
			if (child.metatype==='class') {
				json.classes[child.name]=_.omit(child,KEY_BLACKLIST);
				var tok = child.name.split('.'),
					name = tok[tok.length-1];
				json.types[name] = child.name;
			}
		});
		return json;
	}
	return _.omit(this, KEY_BLACKLIST);
}

var commandRegex = /^\.([\w]+) /,
	embeddedCommentsRegex = /(.*)\/\/\s+(.*)/;

function cleanupAdjacentSpacing(line) {
	return line.replace(/[\r\n\t]/g,' ');
}

function removeComments(line) {
	if (embeddedCommentsRegex.test(line)) {
		return embeddedCommentsRegex.exec(line)[1];
	}
	return line;
}

function parseLineBuffers(buffers, parent) {

	var nodes = [],
		node,
		body,
		blockStarted,
		firstI = -1;

	for (var c=0;c<buffers.length;c++) {
		var line = buffers[c],
			isComment = line.charAt(0)==='/' && line.charAt(1)==='/',
			index = !isComment && line.indexOf('.');
		if (isComment) {
			continue;
		}
		if (firstI < 0) {
			firstI = index;
		}
		line = line.substring(firstI);
		var i = line.charAt(0),
			isCommandStart = i==='.',
			isBlockStart = !isCommandStart && i==='{',
			isBlockEnd = !isBlockStart && i==='}',
			isComment = i==='/' && line.charAt(1)==='/';
		if (isCommandStart) {
			var name = commandRegex.exec(line)[1];
			node = new Node(name,cleanupAdjacentSpacing(removeComments(line)),parent);
			nodes.push(node);
			body = [];
			blockStarted = false;
		}
		else if (isBlockStart) {
			blockStarted = true;
		}
		else if (isBlockEnd) {
			node.children = parseLineBuffers(body,node);
		}
		else {
			// body of multiline
			if (blockStarted) {
				body.push(cleanupAdjacentSpacing(removeComments(line)));
			}
			else if (node) {
				node.line+=' '+cleanupAdjacentSpacing(removeComments(line));
			}
			else {
				log.error("parser error. should haven't gotten here. not sure what to do with this line:");
				log.fatal(line);
			}
		}
	}

	return nodes;
}

function parse(stream, pipe, callback) {

	var buffers = [],
		done = null;

	stream.on('data',function(line){
		line = String(line);
		buffers.push(line);
	});

	function finish() {
		if (!done) {
			done=true;
			var toplevel = new Node('toplevel');
			toplevel.children = parseLineBuffers(buffers);
			parseNode(toplevel,'');
			buffers = null;
			callback(null,toplevel);
		}
	}

	pipe.on('close',finish);
	stream.on('end',finish);
}

if (module.id === ".") {
	var fn = process.argv[2];
	if (!fn) {
		log.error("specify a file to the output of ILDASM.exe");
	}
	parseFile(fn, function(err, ast, json) {
		log.log(JSON.stringify(ast.toJSON(),null,3));
	});
}
