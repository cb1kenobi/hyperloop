/**
 * Clang AST parser
 */
var path = require('path'),
	fs = require('fs'),
	_ = require('underscore');

const DEBUG_TREE = false,
	  DEQUOTE_BEGIN_REGEX = /^['"]/g,
	  DEQUOTE_END_REGEX = /['"]$/g;
	  COMMENT_REGEX = /Text=\"(.*)\"/,
	  FRAMEWORK_REGEX = /([\w]+)\.framework/;

function dequote (value) {
	return value ? value.replace(DEQUOTE_BEGIN_REGEX,'').replace(DEQUOTE_END_REGEX,'') : '';
}

function formatType(type) {
	type = type.replace('const __strong','');
	type = type.replace('__strong','');
	return type.trim();
}

function parseTypes(type) {
	var tok = type.split(':');
	return {
		subtype: formatType(dequote(tok[0])),
		type: formatType(dequote(tok.length==1 ? tok[0] : tok[1]))
	};
}

function parseFrameworkFromHeader(header){
	var m = FRAMEWORK_REGEX.exec(header);
	if (m && m.length) {
		return m[1];
	}
} 

function splitAtFirstToken(line, token) {

	token = token || ' ';

	// if quoted, we need to find the end quote and use that has one whole string
	if (line.charAt(0)==='"') {
		var i = line.indexOf('"',1),
			first = line.substring(1,i),
			next = line.substring(i+1).trim();
		i = next.indexOf(token);
		if (i!=-1) {
			next = next.substring(i+1);
		}
		return {
			first: first,
			next: next
		}
	}
	
	if (line.charAt(0)==="'") {
		var i = line.indexOf("'",1),
			first = line.substring(1,i),
			next = line.substring(i+1).trim();

		i = next.indexOf(token);
		if (i!=-1) {
			next = next.substring(i+1);
		}

		return {
			first: first,
			next: next
		}
	}

	var i = line.indexOf(token),
		first = i > 0 ? line.substring(0,i).trim() : line,
		next = i > 0 ? line.substring(i+1).trim() : '';

	return {
		first: first,
		next: next
	};
}

function safeTokenize(line, ch) {
	var toks = [],
		result = splitAtFirstToken(line,ch);
	while (result) {
		result.first && toks.push(result.first);
		if (result.next.length > 0) {
			result = splitAtFirstToken(result.next,ch);
			continue;
		}
		break;
	}
	return toks;
}
exports.safeTokenize = safeTokenize; // for unit testing

function rpad() {
	var len = arguments[0],
		line = '';
	for (var c=1;c<arguments.length;c++) {
		line+=arguments[c];
		if (c+1<arguments.length) {
			line+=' ';
		}
	}	
	for (var c=line.length;c<len;c++) {
		line+=' ';
	}
	return line;
}

function emptyLine(node,token) {
	node.token = token;
	node.begin = node.up(function(n) {
		return n.begin;
	})
	node.end = node.up(function(n) {
		return n.end;
	});
	node.header = node.up(function(n) {
		return n.header!='line' && n.header!='line' && n.header;
	});
};

function parseLineColInfo(node, line){

	var tok = line.split(',');

	if (tok.length === 1) {
		var prev = node.up(function(n) {
			return n.header && n.begin && n.end && n;
		});

		node.header = prev && prev.header;
		if (prev && prev.end) {
			node.begin = {line: prev.end.line, col: prev.end.col};
			node.end = {line: prev.end.line, col: prev.end.col};
		}
		else {
			node.begin = {line: 0, col: 0};
			node.end = {line: 0, col: 0};
		}

		var tok2 = line.split(':');
		switch(tok2[0]) {
			case 'col': {
				node.begin.col = node.end.col = tok2[1];
				break;
			}
			case 'line': {
				node.begin.line = node.begin.col = tok2[1];
				node.end = {line: node.begin.line, col: node.begin.col};
				break;
			}
		}
		return;
	}

	if (tok.length>=2) {
		var newtok = [];
		tok.forEach(function(v){
			if (FRAMEWORK_REGEX.test(v)) {
				newtok.push(v);
			}
		});
		if (newtok.length===1) {
			tok = [newtok[0],newtok[0]];
		}
		else if (newtok.length===2) {
			tok = newtok;
		}
	}

	var beginLine = tok[0].split(':'),
		endLine = tok[1].split(':'),
		begin = {line: null, col: null},
		end = {line: null, col: null},
		htok = beginLine[0].split(','),
		header = htok[0];

	if (htok.length) {
		for (var c=0;c<htok.length;c++) {
			if (FRAMEWORK_REGEX.test(htok[c])) {
				header = htok[c];
				break;
			}
		}
	}

	if (!1) {
		console.log(node.token,'header',header)
		console.log(node.token,'line',line);
		console.log(node.token,'beginLine',beginLine)
		console.log(node.token,'endLine',endLine)
	}

	// line means a previous token has already parsed it
	if (header==='line' || header==='col') {
		// go upwards to find the header
		var header = node.up(function(n){
			return n && n.header!='line' && n.header!='line' && n.header;
		});
	}

	begin.line = beginLine[1];
	begin.col = beginLine[2];

	if (/(line|built-in|col)/.test(beginLine[0])) {
		var prev = node.up(function(n){
			return n && n.begin;
		});
		switch(beginLine[0]) {
			case '<built-in>': {
				// use same
				begin.line = prev.line;
				begin.col = prev.col;
				break;
			}
			case 'line': {
				begin.line = beginLine[1];
				begin.col = beginLine[2];
				break;
			}
			case 'col': {
				begin.line = prev.line;
				begin.col = beginLine[1];
				break;
			}
		}
	}

	end.line = endLine[0];
	end.col = endLine[1];

	if (/(line|built-in|col)/.test(endLine[0])) {
		
		switch(endLine[0]) {
			case '<built-in>': {
				// use same
				end.line = begin.line;
				end.col = begin.col;
				break;
			}
			case 'line': {
				end.line = endLine[1];
				end.col = endLine[2];
				break;
			}
			case 'col': {
				end.line = begin.line;
				end.col = endLine[1];
				break;
			}
		}
	}

	node.header = header;
	node.begin = begin;
	node.end = end;
}

function parseTypeLine(line){
	var tok = splitAtFirstToken(line, ' '),
		type = tok.next,
		name = tok.first,
		tok = type.indexOf(':')!==-1 ? splitAtFirstToken(type,':') : null,
		types = (tok ? [tok.first,tok.next] : [type,type]).map(function(v){return dequote(v)});
	return {
		name: name,
		subtype: formatType(types[0]),
		type: formatType(types[1])
	};
}

/**
 * class which represents a single AST node
 */
function Node(index, line, start) {
	this.parent = null;
	this.index = index;
	this.line = line;
	this.start = start;
}

Node.prototype.up = function(iterator) {
	var p = this.sibling;
	while(p) {
		var result = iterator(p,'sibling');
		if (result) {
			return result;
		}
		p = p.sibling;
	}
	p = this.parent;
	while(p) {
		var result = iterator(p,'parent');
		if (result) {
			return result;
		}
		p = p.parent;
	}
};

Node.prototype.down = function(iterator) {
	if (this.children && this.children.length) {
		for (var c=0;c<this.children.length;c++) {
			var child = this.children[c],
				result = iterator(child);
			if (result) {
				return result;
			}
		}
	}
}

Node.prototype.siblingOfSameType = function(){
	var s = this.sibling,
		t = this.token;
	while(s) {
		if (s.token === t) {
			return s;
		}
		s = s.sibling;
	}
	return null;
}

Node.prototype.parseTranslationUnitDecl = function() {
	//root element
};

Node.prototype.parseImportDecl = function() {
};

Node.prototype.parseOverloadableAttr = function() {
};

Node.prototype.parseUnusedAttr = function() {
};

Node.prototype.parseContinueStmt = function() {
};

Node.prototype.parseObjCBoolLiteralExpr = function() {
};

Node.prototype.parseObjCBridgedCastExpr = function() {
};

Node.prototype.parseExprWithCleanups = function() {
};

Node.prototype.parseTypedefDecl = function() {

	var tok = parseTypeLine(this.field);
	this.alias = tok.name;
	this.type = formatType(tok.type);
	this.subtype = formatType(tok.subtype);
	
	if (this.sibling) {
		// this is a case where a nameless union is before a typedef
		if (this.sibling.token === 'RecordDecl' && this.sibling.type=='union' && !this.name) {
			this.metatype = this.sibling.type;
			var obj = {};
			this[this.metatype] = obj;
			this.sibling.children.forEach(function(child){
				obj[child.name] = child.type;
			});
		}
	}
};

Node.prototype.parseArraySubscriptExpr = function() {
};

Node.prototype.parseMemberExpr = function() {
};

Node.prototype.parsesuper = function() {
	this.name = dequote(splitAtFirstToken(this.field).next);
	this.parent.superClass = this.name;
};

Node.prototype.parseUnaryExprOrTypeTraitExpr = function() {
};

Node.prototype.parseObjCProtocol = function() {
	this.name = dequote(this.field);
	this.metatype = 'protocol';
	if (!this.parent.protocols) {
		this.parent.protocols = [];
	}
	this.parent.protocols.push(this.name);
};

Node.prototype.parseObjCInterfaceDecl = function() {
	this.name = dequote(this.field);
	this.metatype = 'interface';
};

Node.prototype.parseObjCCategoryDecl = function() {
	this.name = this.field;
};

Node.prototype.parseObjCCategoryDeclAfterChildren = function() {
	this.interface = this.down(function(node){
		return node.token === 'ObjCInterface' && node.name;
	});
};

Node.prototype.parseObjCInterface = function() {
	this.name = dequote(this.field);
	this.methods = [];
};

Node.prototype.parseObjCMethodDecl = function() {
	this.instance = this.field.charAt(0)==='-';
	var tok = splitAtFirstToken(this.field.substring(2)),
		i = tok.first.indexOf(':'),
		name = i!=-1 ? tok.first.substring(0,i).trim() : tok.first.substring(0);
	this.selector = this.field.charAt(0)+' '+tok.first;
	tok = splitAtFirstToken(tok.next,':');
	this.returnSubtype = dequote(tok.first);
	this.returnType = dequote(tok.next||tok.first);
	this.name = name;
};

Node.prototype.parseObjCMethodDeclAfterChildren = function() {
	var args = [],
		parent = this.parent;
	this.arguments = args;
	if (this.children) {
		this.children.forEach(function(child) {
			if (child.token === 'ParmVarDecl') {
				if (!parent.framework) {
					parent.framework = parseFrameworkFromHeader(child.header);
				}
				var arg = {
					name: child.name,
					type: child.type,
					subtype: child.subtype
				}
				args.push(arg);
			}
		});
	}
	if (!this.parent.methods){
		this.parent.methods = {};
	}
	this.parent.methods[this.name] = {
		name: this.name,
		metatype: 'method',
		instance: this.selector.charAt(0)=='-',
		selector: this.selector,
		returnType: this.returnType,
		returnSubtype: this.returnSubtype,
		args: args,
		availability: this.availability || this.parent.availability
	};
};

Node.prototype.parseEnumDecl = function() {
	this.types = {};
};

Node.prototype.parseEnumConstantDecl = function() {
	var result = splitAtFirstToken(this.field);
	this.name = result.first;
	var types = parseTypes(result.next);
	this.type = types.type;
	this.value = '';
	this.metatype = 'constant';
	this.subtype = types.subtype;
	this.framework = parseFrameworkFromHeader(this.header);
};

Node.prototype.parseEnumConstantDeclAfterChildren = function() {
	// find the parent enum
	var enumNode = this.up(function(n){
			return n.token === 'EnumDecl' && n;
		}),
		value = this.value;

	// enum constants aren't required to specify a value and if not, we need to assign
	if (value==='') {
		var bro = this.siblingOfSameType();
		this.value = value = bro ? bro.value + 1 : 0;
	}
	enumNode.types[this.name] = {type:this.type, subtype:this.subtype, value: value};
};

Node.prototype.parseFieldDecl = function() {
	var tok = parseTypeLine(this.field);
	this.name = tok.name;
	this.type = tok.type;
	this.subtype = tok.subtype;
};

Node.prototype.parseParmVarDecl = function() {
	var tok = parseTypeLine(this.field);
	this.name = tok.name;
	this.type = tok.type;
	this.subtype = tok.subtype;
};

Node.prototype.parseParenExpr = function() {
};

Node.prototype.parseNoThrowAttr = function() {
};

Node.prototype.parseReturnStmt = function() {
};

Node.prototype.parseCallExpr = function() {
};

Node.prototype.parseConstAttr = function() {
};

Node.prototype.parseFunctionDecl = function() {
	var tok = splitAtFirstToken(this.field, ' ');
	this.name = tok.first;
	tok = splitAtFirstToken(tok.next, ' ');
	this.signature = tok.first;
	this.extra = tok.next;
	this.extern = this.extra==='extern';
	this.metatype = 'function';

	var i = this.field.indexOf('('),
		type = dequote(this.field.substring(this.name.length+1,i).trim());
	this.returnType = formatType(type);	//TODO: map this back into typedef to real function?
	this.returnSubtype = this.returnType;
};

Node.prototype.parseFunctionDeclAfterChildren = function() {
	var args = [],
		self = this;
	this.arguments = args;
	if (this.children && this.children.length) {
		this.children.forEach(function(arg){
			if (arg.token === 'ParmVarDecl') {
				if (!self.framework) {
					self.framework = parseFrameworkFromHeader(arg.header);
				}
				var e = {
					name: arg.name,
					type: arg.type,
					subtype: arg.subtype
				};
				args.push(e);
			}
		});
	}
	if (!this.framework) {
		this.framework = parseFrameworkFromHeader(this.header);
		var i = -1;
		// if this looks like a non-framework include, we should add a specific import
		if (!this.framework && (i=this.header.indexOf('/usr/include/'))>0) {
			this.import = this.header.substring(i+13);
		}
	}
}

Node.prototype.parseAlwaysInlineAttr = function() {
};

Node.prototype.parseDeclRefExpr = function() {
};

Node.prototype.parseIntegerLiteral = function() {
	var tok = splitAtFirstToken(this.field, ' '),
		value = tok.next;

	this.type = formatType(dequote(tok.first));

	if (this.parent && this.parent.token === 'UnaryOperator') {
		switch(this.parent.position) {
			case 'postfix': {
				value += this.parent.operator;
				break;
			}
			case 'prefix': {
				value = this.parent.operator + value;
				break;
			}
		}
	}
	if (/(int|short|float|long|double)/.test(this.type)){
		this.value = eval('Number('+value+')');
	}
	var parentNode = this.up(function(n){
		return /(BinaryOperator|EnumConstantDecl|TypedefDecl)/.test(n.token) && n;
	});
	if (parentNode) {
		parentNode.value = this.value;
	}
};

Node.prototype.parseImplicitCastExpr = function() {
};

Node.prototype.parseBinaryOperator = function() {
};

Node.prototype.parseBinaryOperatorAfterChildren = function() {
	var tok = splitAtFirstToken(this.field);
	this.type = formatType(tok.first);
	this.operator = dequote(tok.next);
	var left = this.children[0],
		right = this.children[1],
		expr = (typeof(left.value)!=='undefined' && typeof(right.value)!='undefined' && left.value+this.operator+right.value) || '0'; //FIXME
	try {
		this.value = eval(expr);
		var parentNode = this.up(function(n){
			return /(EnumConstantDecl|TypedefDecl)/.test(n.token) && n;
		});
		if (parentNode) {
			parentNode.value = this.value;
		}
	}
	catch(E){
		console.log('error evaluating expression: ',expr);
		console.error(E.stack);
	}
};

Node.prototype.parseCStyleCastExpr = function() {
};

Node.prototype.parseCompoundStmt = function() {
};

Node.prototype.parseReturnStmt = function() {
};

Node.prototype.parseRecordDecl = function() {
	this.type = formatType(this.field);
	this.metatype = splitAtFirstToken(this.field,' ').first;
};

Node.prototype.parseVarDecl = function() {
	var tok = splitAtFirstToken(this.field, ' ');
	this.name = tok.first;
	tok = splitAtFirstToken(tok.next, ' ');
	this.type = formatType(tok.first);
	this.extra = tok.next;
	this.extern = this.extra==='extern';
	this.framework = parseFrameworkFromHeader(this.header);
	this.metatype = 'variable';
};

Node.prototype.parseDeclStmt = function() {
};

Node.prototype.parseConditionalOperator = function() {
};

Node.prototype.parseNSConsumesSelfAttr = function() {
};

Node.prototype.parseNSReturnsRetainedAttr = function() {
};

Node.prototype.parseCFConsumedAttr = function() {
};

Node.prototype.parseCFAuditedTransferAttr = function() {
};

Node.prototype.parseUnaryOperator = function() {
	var i = this.field.indexOf(':');
	if (i > 0) {
		//'volatile uint16_t':'volatile unsigned short' lvalue prefix '*'
		var left = dequote(this.field.substring(0,i)),
			right = this.field.substring(i+1),
			q = right.indexOf("'",1),
			remainder = right.substring(q+1).trim(),
			right = dequote(right.substring(0,q)),
			tok = remainder.split(' ').map(function(v){return v && dequote(v)});

		if (tok[0]==='lvalue') {
			tok = tok.slice(1);
		}

		this.position = tok[0];
		this.operator = tok[1];
		this.type = formatType(left);
		this.subtype = formatType(right);
	}
	else {
		var tok = splitAtFirstToken(this.field),
			types = parseTypes(tok.first),
			tok = splitAtFirstToken(tok.next);
		if (/(prefix|postfix)/.test(tok.first)) {
			this.position = tok.first;
			this.operator = dequote(tok.next);
		}
		else {
			this.position = 'prefix';
			this.operator = dequote(tok.first);
		}
		this.type = types.type;
		this.subtype = types.subtype;
	}
//	console.log('type=',this.type,'subtype=',this.subtype,'position=',this.position,'operator=',this.operator);
};

Node.prototype.parseMaxFieldAlignmentAttr = function() {
	this.size = parseInt(this.field);
	this.parent.maxFieldAlignment = this.size;
};

Node.prototype.parseFormatAttr = function() {
};

Node.prototype.parseVisibilityAttr = function() {
	this.message = this.field;
	this.parent.visibility = this.message;
};

Node.prototype.parseDeprecatedAttr = function() {
	this.message = this.field;
	this.parent.deprecated = this.message;
};

Node.prototype.parseUnavailableAttr = function() {
	this.message = this.field;
	this.parent.unavailable = this.message;
};

Node.prototype.parseAvailabilityAttr = function() {
	var result = safeTokenize(this.field);
	this.platform = result[0];
	this.introduced = result[1];
	this.deprecated = result[2];
	this.obseleted = result[3];
	this.message = result[4] || '';
	if (this.parent) {
		this.parent.availability = {
			platform: this.platform,
			introduced: this.introduced,
			deprecated: this.deprecated,
			obseleted: this.obseleted,
			message: this.message
		};
	}
};

Node.prototype.parseObjCIvarDecl = function() {
};

Node.prototype.parseObjCProtocolDecl = function() {
	this.name = this.field;
	this.metatype = 'protocol';
};

Node.prototype.parseObjCRootClassAttr = function() {
};

Node.prototype.parseObjCReturnsInnerPointerAttr = function() {
};

Node.prototype.parseCFReturnsRetainedAttr = function() {
};

Node.prototype.parseObjCMessageExpr = function() {
};

Node.prototype.parseCharacterLiteral = function() {
};

Node.prototype.parseIfStmt = function() {
};

Node.prototype.parseForStmt = function() {
};

Node.prototype.parsegetter = function() {
	// swap the addr and the type
	var type = this.addr,
		tok = splitAtFirstToken(this.field,' ');

	this.addr = tok.first;
	this.type = type;
	this.name = dequote(tok.next);	

	if (this.type === 'ObjCMethod' && this.parent.token === 'ObjCPropertyDecl') {
		this.parent.getter = this.name;
	}
};

Node.prototype.parseSentinelAttr = function() {
};

Node.prototype.parseParamVarArg = function() {
};

Node.prototype.parseNull = function() {
};

Node.prototype.parseObjCPropertyDecl = function() {
	// parse afterwards to capture any getter/setter
};

Node.prototype.parseObjCPropertyDeclAfterChildren = function() {
	var tok = splitAtFirstToken(this.field);
	this.name = tok.first;
	var i = tok.next.lastIndexOf("'"),
		types = parseTypes(tok.next.substring(0,i)),
		properties = tok.next.substring(i+1).trim().split(' ');
	this.attributes = properties;
	if (!this.parent.properties) {
		this.parent.properties = {};
	}
	this.parent.properties[this.name] = {
		name: this.name,
		type: types.type,
		subtype: types.subtype,
		attributes: this.attributes,
		getter: this.getter,
		setter: this.setter,
		metatype: 'property',
		availability: this.availability || this.parent.availability
	};
};

Node.prototype.parseFullComment = function() {
};

Node.prototype.parseFullCommentAfterChildren = function() {
	this.parent.comment = this.comment;
}

Node.prototype.parseParagraphComment = function() {
	this.comment = '';
};

Node.prototype.parseParagraphCommentAfterChildren = function() {
	this.parent.comment = '/*'+this.comment+'\n*/';
};

Node.prototype.parseTextComment = function() {
	var r = COMMENT_REGEX.exec(this.field);
	this.text = r.length ? r[1] : this.field;
	if (this.parent.comment) {
		this.parent.comment+='\n';
	}
	this.parent.comment+=this.text;
};

//NOTE: http://llvm.org/devmtg/2012-11/Gribenko_CommentParsing.pdf

Node.prototype.parseVerbatimLineComment = function() {
	//TODO
};

Node.prototype.parseVerbatimBlockComment = function() {
	//TODO:
};

Node.prototype.parseVerbatimBlockLineComment = function() {
	//TODO:
};

Node.prototype.parseInlineCommandComment = function() {
	//TODO:
};

Node.prototype.parseBlockCommandComment = function() {
	//TODO
};

Node.prototype.parseHTMLStartTagComment = function(){
	//TODO:
};

Node.prototype.parseHTMLEndTagComment = function(){
	//TODO:
};

Node.prototype.parseParamCommandComment = function(){
	//TODO:
};

Node.prototype.parseAsmLabelAttr = function() {
};

Node.prototype.parseWeakImportAttr = function() {
};

Node.prototype.parseInitListExpr = function() {
};

Node.prototype.parseFloatingLiteral = function() {
};

Node.prototype.parseObjCStringLiteral = function() {
};

Node.prototype.parseStringLiteral = function() {
};

Node.prototype.parseCompoundLiteralExpr = function() {
};

Node.prototype.parseIndirectFieldDecl = function() {
};

Node.prototype.parseField = function() {
};

Node.prototype.parseAlignedAttr = function() {
};

Node.prototype.parseIBOutletAttr = function() {
};

Node.prototype.parseObjCRequiresPropertyDefsAttr = function() {
	//@requires in Protocol
};

Node.prototype.parseCompoundAssignOperator = function() {
};

Node.prototype.parseNonNullAttr = function() {
};

Node.prototype.parseNoDebugAttr = function() {
};

Node.prototype.parseGCCAsmStmt = function() {
};

Node.prototype.parseShuffleVectorExpr = function() {
};

Node.prototype.parsePackedAttr = function() {
};

Node.prototype.parseMayAliasAttr = function() {
};

Node.prototype.parseMallocAttr = function() {
};

Node.prototype.parseObjCNSObjectAttr = function() {
};

Node.prototype.parseAlignMac68kAttr = function() {
};

Node.prototype.parseArcWeakrefUnavailableAttr = function() {
};

Node.prototype.parseNSConsumedAttr = function() {
};

Node.prototype.parseObjCExceptionAttr = function() {
};

Node.prototype.parseFormatArgAttr = function() {
};

Node.prototype.parseWarnUnusedResultAttr = function() {
};

Node.prototype.parsePureAttr = function() {
};

Node.prototype.parseBreakStmt = function() {
};

Node.prototype.parseCaseStmt = function() {
};

Node.prototype.parseSwitchStmt = function() {
};

Node.prototype.parseDefaultStmt = function() {
};

Node.prototype.parseReturnsTwiceAttr = function() {
};

Node.prototype.parse = function() {

	var remainder = this.line.substring(this.start+1),
		tok = remainder.split(' ');

	this.token = tok[0];
	this.addr = tok[1];

	if (this.token === '...') {
		// this is a varargs -- for example: fn(foo, bar, ...)
		emptyLine(this,'ParamVarArg'); // NOTE: this is our own type
	}
	else if (this.token === '<<<NULL>>>') {
		// this is a NULL branch, for example from a IfStatement
		emptyLine(this,'Null');
	}
	else {
		remainder = remainder.substring(this.token.length+this.addr.length+2);

		var x = remainder.indexOf('<'),
			y = remainder.indexOf('> '),
			y = y < 0 ? remainder.indexOf('>') : y,
			str = remainder.substring(x+1, y),
			str2 = str.split(',').map(function(v){return v.trim()});

		this.field = remainder.substring(y+1).trim();
		if (this.field.charAt(0)=='>') {
			this.field = this.field.substring(1);
		}

		if (/invalid sloc/.test(str)) {
			this.begin = this.end = {
				line: 0,
				col: 0
			}
		}
		else {
			parseLineColInfo(this,String(str2));
		}
	}

	// delegate to token parser
	var m = 'parse'+this.token,
		fn = this[m];

	if (typeof(fn)==='function') {
		fn.call(this);
	}
	else {
		console.error("no parser for ",this.token);
	}

	// recursively parse children
	if (this.children) {
		this.children.forEach(function(child){
			child.parse();
		});
	}

	// see if the parse wants a callback after the children are parsed
	m = 'parse'+this.token+'AfterChildren';
	fn = this[m];
	if (typeof(fn)==='function') {
		fn.call(this);
	}
}

Node.prototype.__defineGetter__('length',function(){
	return this.children ? this.children.length : 0;
});

Node.prototype.add = function(n){
	if (!this.children) {
		this.children = [];
	}
	n.parent = this;
	n.sibling = this.children.length ? this.children[this.length-1] : null;
	this.children.push(n);
};

Node.prototype.walk = function(iterator) {
	if (!this.parent) {
		iterator(this);
	}
	if (this.children) {
		this.children.forEach(function(child){
			iterator(child);
			child.walk(iterator);
		});
	}
};

Node.prototype.toString = function() {
	var lines = [];
	this.walk(function(node) {
		lines.push(node.line);
	});
	return lines.join('\n');
};

// these are keys we don't want to show up in JSON
const KEY_BLACKLIST = ['parent', 'sibling', 'addr', 'line', 'field', 'index', 'start', 'children', 'begin', 'end', 'header', 'token', 'extra', 'length'];

Node.prototype.toJSON = function() {
	if (this.token === 'TranslationUnitDecl') {
		return astToJSON(this);
	}
	return _.omit(this, KEY_BLACKLIST);
};

function astToJSON (ast) {
	var json = {
		classes: {},
		symbols: {}
	},
	categories = [];
	ast.walk(function(node) {
		switch(node.token) {
			case 'ObjCProtocolDecl':
			case 'ObjCInterfaceDecl': {
				if (node.name in json.classes) {
					_.extend(json.classes[node.name], node.toJSON());
				}
				else {
					json.classes[node.name] = _.omit(node.toJSON(),'name');
				}
				break;
			}
			case 'EnumConstantDecl': 
			case 'VarDecl': 
			case 'FunctionDecl': {
				json.symbols[node.name] = node.toJSON();
				break;
			}
			case 'ObjCCategoryDecl': {
				if (!node.interface) break;
				categories.push(node);
				break;
			}
		}
	});

	// capture methods & properties from categories into their classes
	categories.forEach(function(node){
			var intf = json.classes[node.interface],
				methods = node.methods,
				properties = node.properties,
				m = intf.methods,
				p = intf.properties;
			if (!m) {
				intf.methods = m = {};
			}
			if (!p) {
				intf.properties = p = {};
			}
			methods && Object.keys(methods).forEach(function(n){
				m[n] = methods[n];
			});
			properties && Object.keys(properties).forEach(function(n){
				p[n] = properties[n];
			});
	});

	return json;
}

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
	var stream = byline(output)
	output.resume();
	parse(stream, output, callback);
}

function parse(stream, pipe, callback) {


	var index = 0,
		current,
		root,
		rootRE = /^\|-([\w]+)/;

	stream.on('data',function(line){

		index++;
		line = String(line).trim();
		// console.log(line)

		var start = line.indexOf('-'),
			node = new Node(index-1, line, start);

		if (start > 0) {
			if (current.start === start) {
				DEBUG_TREE && console.log(rpad(25, rpad(4,index-1), '|', rpad(4,start), '|', rpad(10,'sibling'), '|', rpad(3,current.index)), '|', rpad(20,node.token), line.substring(0,50))
				current.parent.add(node);
			}
			else {
				if (current.start < start) {
					DEBUG_TREE && console.log(rpad(25, rpad(4,index-1), '|', rpad(4,start), '|', rpad(10,'child'), '|', rpad(3,current.index)), '|', rpad(20,node.token), line.substring(0,50))
					current.add(node);
				}
				else {
					var p = current.parent,
						found = false;
					while(p) {
						if (p.start === start) {
							DEBUG_TREE && console.log(rpad(25, rpad(4,index-1), '|', rpad(4,start), '|', rpad(10,'sibling'), '|', rpad(3,p.index)), '|', rpad(20,node.token), line.substring(0,50))
							p.parent.add(node);
							break;
						}
						p = p.parent;
					}
				}
			}
		}
		else {
			DEBUG_TREE && console.log(rpad(25, rpad(4,index-1), '|', rpad(4,start), '|', rpad(10,'root'), '|', rpad(3,-1)), '|', rpad(20,node.token), line.substring(0,50))
			root = node;
		}
		current = node;
	});

	function finish() {
		if (root) {
			root.parse();
			callback(null, root);
			root = null; // prevent multiple
		}
	}

	pipe.on('close',finish);
	stream.on('end',finish);
}

exports.parse = parse;
exports.parseFile = parseFile;
exports.parseBuffer = parseBuffer;

exports.Node = Node;

if (module.id === ".") {
	parseFile(path.join(__dirname,'..','..','clangout'),function(err,ast){
		/*ast.walk(function(node){
			if (node.token==='ObjCInterfaceDecl') {
				console.log(JSON.stringify(node.toJSON(),null,'  '))
			}
		});*/
		var j = ast.toJSON();
		console.log(j.classes.UIView.toJSON())
		//console.log(JSON.stringify(ast,null,'\t'));
	});
}
