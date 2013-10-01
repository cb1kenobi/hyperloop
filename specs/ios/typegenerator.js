/**
 * ios typegenerator tests
 */
var should = require('should'),
	typegenerator = require('../../lib/ios/jsc/typegenerator'),
    genmetadata = require('./metadata'),
    metadata;

describe("ios typegenerator", function(){

	before(function(done){
		genmetadata.getMetadata(function(err,m){
			if (err) return done(err);
			metadata = m;
			done();
		});
	});

	it("should be able to parse float", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'float');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','float');
		result.should.have.property('simpleType','float');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse float *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'float *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','float *');
		result.should.have.property('simpleType','float');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse float **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'float **');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','float **');
		result.should.have.property('simpleType','float');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse long", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'long');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','long');
		result.should.have.property('simpleType','long');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse signed long", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'signed long');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','signed long');
		result.should.have.property('simpleType','long');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse unsigned long", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'unsigned long');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','unsigned long');
		result.should.have.property('simpleType','long');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse long *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'long *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','long *');
		result.should.have.property('simpleType','long');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse long **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'long **');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','long **');
		result.should.have.property('simpleType','long');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse long long", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'long long');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','long long');
		result.should.have.property('simpleType','long long');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse double", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'double');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','double');
		result.should.have.property('simpleType','double');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse double *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'double *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','double *');
		result.should.have.property('simpleType','double');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse double **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'double **');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','double **');
		result.should.have.property('simpleType','double');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse short", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'short');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','short');
		result.should.have.property('simpleType','short');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse short *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'short *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','short *');
		result.should.have.property('simpleType','short');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse short **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'short **');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','short **');
		result.should.have.property('simpleType','short');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse int", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'int');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','int');
		result.should.have.property('simpleType','int');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse int *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'int *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','int *');
		result.should.have.property('simpleType','int');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse int **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'int **');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','int **');
		result.should.have.property('simpleType','int');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse bool", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'bool');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','bool');
		result.should.have.property('simpleType','bool');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse bool *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'bool *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','bool *');
		result.should.have.property('simpleType','bool');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse bool **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'bool **');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','bool **');
		result.should.have.property('simpleType','bool');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse char", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'char');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','char');
		result.should.have.property('simpleType','char');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse char *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'char *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','char *');
		result.should.have.property('simpleType','char');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse char **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'char **');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','char **');
		result.should.have.property('simpleType','char');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse const char *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'const char *');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','char *');
		result.should.have.property('simpleType','char');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
		result.should.have.property('is_const', true);
	});

	it("should be able to parse void", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'void');
		result.should.have.property('metatype','void');
		result.should.have.property('name','void');
		result.should.have.property('simpleType','void');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse void *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'void *');
		result.should.have.property('metatype','void');
		result.should.have.property('name','void *');
		result.should.have.property('simpleType','void');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse void **", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'void **');
		result.should.have.property('metatype','void');
		result.should.have.property('name','void **');
		result.should.have.property('simpleType','void');
		result.should.have.property('pointer',true);
		result.should.have.property('pointer_to_pointer',true);
	});

	it("should be able to parse id", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'id');
		result.should.have.property('metatype','id');
		result.should.have.property('name','id');
		result.should.have.property('simpleType','id');
	});

	it("should be able to parse SEL", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'SEL');
		result.should.have.property('metatype','selector');
		result.should.have.property('name','SEL *');
		result.should.have.property('simpleType','SEL');
	});

	it("should be able to parse SEL *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'SEL *');
		result.should.have.property('metatype','selector');
		result.should.have.property('name','SEL *');
		result.should.have.property('simpleType','SEL');
	});

	it("should be able to parse Class", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'Class');
		result.should.have.property('metatype','classobj');
		result.should.have.property('name','Class');
		result.should.have.property('simpleType','Class');
	});

	it("should be able to parse Class *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'Class *');
		result.should.have.property('metatype','classobj');
		result.should.have.property('name','Class');
		result.should.have.property('simpleType','Class');
	});

	it("should be able to parse void(*)(void)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'void(*)(void)');
		result.should.have.property('metatype','function');
		result.should.have.property('name','void(*)(void)');
		result.should.have.property('sentinel',false);
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','void');
		result.returnType.should.have.property('name','void');
		result.returnType.should.have.property('simpleType','void');
		result.returnType.should.have.property('pointer',false);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(1);
		result.args[0].metatype.should.equal('void');
		result.args[0].name.should.equal('void');
		result.args[0].simpleType.should.equal('void');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse void(*)(int)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'void(*)(int)');
		result.should.have.property('metatype','function');
		result.should.have.property('name','void(*)(int)');
		result.should.have.property('sentinel',false);
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','void');
		result.returnType.should.have.property('name','void');
		result.returnType.should.have.property('simpleType','void');
		result.returnType.should.have.property('pointer',false);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(1);
		result.args[0].metatype.should.equal('primitive');
		result.args[0].name.should.equal('int');
		result.args[0].simpleType.should.equal('int');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse float(*)(float,float)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'float(*)(float,float)');
		result.should.have.property('metatype','function');
		result.should.have.property('name','float(*)(float,float)');
		result.should.have.property('sentinel',false);
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','primitive');
		result.returnType.should.have.property('name','float');
		result.returnType.should.have.property('simpleType','float');
		result.returnType.should.have.property('pointer',false);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(2);
		result.args[0].metatype.should.equal('primitive');
		result.args[0].name.should.equal('float');
		result.args[0].simpleType.should.equal('float');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
		result.args[1].metatype.should.equal('primitive');
		result.args[1].name.should.equal('float');
		result.args[1].simpleType.should.equal('float');
		result.args[1].pointer.should.equal(false);
		result.args[1].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse void(^)(void)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'void(^)(void)');
		result.should.have.property('metatype','block');
		result.should.have.property('name','void(^)(void)');
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','void');
		result.returnType.should.have.property('name','void');
		result.returnType.should.have.property('simpleType','void');
		result.returnType.should.have.property('pointer',false);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(1);
		result.args[0].metatype.should.equal('void');
		result.args[0].name.should.equal('void');
		result.args[0].simpleType.should.equal('void');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse void(^)(int)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'void(^)(int)');
		result.should.have.property('metatype','block');
		result.should.have.property('name','void(^)(int)');
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','void');
		result.returnType.should.have.property('name','void');
		result.returnType.should.have.property('simpleType','void');
		result.returnType.should.have.property('pointer',false);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(1);
		result.args[0].metatype.should.equal('primitive');
		result.args[0].name.should.equal('int');
		result.args[0].simpleType.should.equal('int');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse int(^)(int)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'int(^)(int)');
		result.should.have.property('metatype','block');
		result.should.have.property('name','int(^)(int)');
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','primitive');
		result.returnType.should.have.property('name','int');
		result.returnType.should.have.property('simpleType','int');
		result.returnType.should.have.property('pointer',false);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(1);
		result.args[0].metatype.should.equal('primitive');
		result.args[0].name.should.equal('int');
		result.args[0].simpleType.should.equal('int');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse int*(^)(int)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'int*(^)(int)');
		result.should.have.property('metatype','block');
		result.should.have.property('name','int*(^)(int)');
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','primitive');
		result.returnType.should.have.property('name','int*');
		result.returnType.should.have.property('simpleType','int');
		result.returnType.should.have.property('pointer',true);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(1);
		result.args[0].metatype.should.equal('primitive');
		result.args[0].name.should.equal('int');
		result.args[0].simpleType.should.equal('int');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse int*(^)(float,float)", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'int*(^)(float,float)');
		result.should.have.property('metatype','block');
		result.should.have.property('name','int*(^)(float,float)');
		result.should.have.property('args');
		result.should.have.property('returnType');
		result.returnType.should.have.property('metatype','primitive');
		result.returnType.should.have.property('name','int*');
		result.returnType.should.have.property('simpleType','int');
		result.returnType.should.have.property('pointer',true);
		result.returnType.should.have.property('pointer_to_pointer',false);
		result.args.should.have.length(2);
		result.args[0].metatype.should.equal('primitive');
		result.args[0].name.should.equal('float');
		result.args[0].simpleType.should.equal('float');
		result.args[0].pointer.should.equal(false);
		result.args[0].pointer_to_pointer.should.equal(false);
		result.args[1].metatype.should.equal('primitive');
		result.args[1].name.should.equal('float');
		result.args[1].simpleType.should.equal('float');
		result.args[1].pointer.should.equal(false);
		result.args[1].pointer_to_pointer.should.equal(false);
	});

	it("should be able to parse NSString *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'NSString *');
		result.should.have.property('metatype','class');
		result.should.have.property('name','NSString *');
		result.should.have.property('simpleType','NSString');
		result.should.have.property('object');
		result.object.should.have.property('metatype','interface');
		result.object.should.have.property('name','NSString');
		result.object.should.have.property('framework','Foundation');
		result.object.should.have.property('superClass','NSObject');
	});

	it("should be able to parse UIView *", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'UIView *');
		result.should.have.property('metatype','class');
		result.should.have.property('name','UIView *');
		result.should.have.property('simpleType','UIView');
		result.should.have.property('object');
		result.object.should.have.property('metatype','interface');
		result.object.should.have.property('name','UIView');
		result.object.should.have.property('framework','UIKit');
		result.object.should.have.property('superClass','UIResponder');
	});

	it("should be able to parse enum NSComparisonResult", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'enum NSComparisonResult');
		result.should.have.property('metatype','enum');
		result.should.have.property('name','enum NSComparisonResult');
		result.should.have.property('simpleType','NSComparisonResult');
		result.should.have.property('object');
		result.object.should.have.property('name','NSComparisonResult');
		result.object.should.have.property('metatype','enum');
		result.object.should.have.property('types');
		result.object.types.should.have.property('NSOrderedAscending');
		result.object.types.should.have.property('NSOrderedSame');
		result.object.types.should.have.property('NSOrderedDescending');
	});

	it("should be able to parse struct _NSRange", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'struct _NSRange');
		result.should.have.property('metatype','struct');
		result.should.have.property('name','struct _NSRange');
		result.should.have.property('simpleType','_NSRange');
		result.should.have.property('object');
		result.object.should.have.property('name','_NSRange');
		result.object.should.have.property('metatype','struct');
		result.object.should.have.property('type','struct _NSRange');
		result.object.should.have.property('subtype','struct _NSRange');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(2);
		result.object.fields[0].name.should.equal('location');
		result.object.fields[0].type.should.equal('unsigned int');
		result.object.fields[0].subtype.should.equal('NSUInteger');
		result.object.fields[1].name.should.equal('length');
		result.object.fields[1].type.should.equal('unsigned int');
		result.object.fields[1].subtype.should.equal('NSUInteger');
	});

	it("should be able to parse _NSRange", function() {
		var result = typegenerator.generateTypeMetadata(metadata, '_NSRange');
		result.should.have.property('metatype','struct');
		result.should.have.property('name','_NSRange');
		result.should.have.property('simpleType','_NSRange');
		result.should.have.property('object');
		result.object.should.have.property('name','_NSRange');
		result.object.should.have.property('metatype','struct');
		result.object.should.have.property('type','struct _NSRange');
		result.object.should.have.property('subtype','struct _NSRange');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(2);
		result.object.fields[0].name.should.equal('location');
		result.object.fields[0].type.should.equal('unsigned int');
		result.object.fields[0].subtype.should.equal('NSUInteger');
		result.object.fields[1].name.should.equal('length');
		result.object.fields[1].type.should.equal('unsigned int');
		result.object.fields[1].subtype.should.equal('NSUInteger');
	});

	it("should be able to parse CGRect", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'CGRect');
		result.should.have.property('metatype','struct');
		result.should.have.property('name','struct CGRect');
		result.should.have.property('simpleType','CGRect');
		result.should.have.property('object');
		result.object.should.have.property('name','CGRect');
		result.object.should.have.property('metatype','typedef');
		result.object.should.have.property('type','struct CGRect');
		result.object.should.have.property('subtype','struct CGRect');
		result.object.should.have.property('alias','CGRect');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(2);
		result.object.fields[0].name.should.equal('origin');
		result.object.fields[0].type.should.equal('struct CGPoint');
		result.object.fields[0].subtype.should.equal('CGPoint');
		result.object.fields[1].name.should.equal('size');
		result.object.fields[1].type.should.equal('struct CGSize');
		result.object.fields[1].subtype.should.equal('CGSize');
	});

	it("should be able to parse CGPoint", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'CGPoint');
		result.should.have.property('metatype','struct');
		result.should.have.property('name','struct CGPoint');
		result.should.have.property('simpleType','CGPoint');
		result.should.have.property('object');
		result.object.should.have.property('name','CGPoint');
		result.object.should.have.property('metatype','typedef');
		result.object.should.have.property('type','struct CGPoint');
		result.object.should.have.property('subtype','struct CGPoint');
		result.object.should.have.property('alias','CGPoint');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(2);
		result.object.fields[0].name.should.equal('x');
		result.object.fields[0].type.should.equal('float');
		result.object.fields[0].subtype.should.equal('CGFloat');
		result.object.fields[1].name.should.equal('y');
		result.object.fields[1].type.should.equal('float');
		result.object.fields[1].subtype.should.equal('CGFloat');
	});

	it("should be able to parse CGSize", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'CGSize');
		result.should.have.property('metatype','struct');
		result.should.have.property('name','struct CGSize');
		result.should.have.property('simpleType','CGSize');
		result.should.have.property('object');
		result.object.should.have.property('name','CGSize');
		result.object.should.have.property('metatype','typedef');
		result.object.should.have.property('type','struct CGSize');
		result.object.should.have.property('subtype','struct CGSize');
		result.object.should.have.property('alias','CGSize');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(2);
		result.object.fields[0].name.should.equal('width');
		result.object.fields[0].type.should.equal('float');
		result.object.fields[0].subtype.should.equal('CGFloat');
		result.object.fields[1].name.should.equal('height');
		result.object.fields[1].type.should.equal('float');
		result.object.fields[1].subtype.should.equal('CGFloat');
	});

	it("should be able to parse UICollisionBehaviorModeItems", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'UICollisionBehaviorModeItems');
		result.should.have.property('metatype','constant');
		result.should.have.property('name','UICollisionBehaviorModeItems');
		result.should.have.property('simpleType','UICollisionBehaviorModeItems');
		result.should.have.property('object');
		result.object.should.have.property('name','UICollisionBehaviorModeItems');
		result.object.should.have.property('metatype','constant');
		result.object.should.have.property('type','unsigned int');
		result.object.should.have.property('subtype','NSUInteger');
		result.object.should.have.property('framework','UIKit');
		result.object.should.have.property('value',1);
	});

	it("should be able to parse CFSwap", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'CFSwap');
		result.should.have.property('metatype','union');
		result.should.have.property('name','CFSwap');
		result.should.have.property('simpleType','CFSwap');
		result.should.have.property('object');
		result.object.should.have.property('name','CFSwap');
		result.object.should.have.property('metatype','union');
		result.object.should.have.property('type','union');
		result.object.should.have.property('subtype','union');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(2);
		result.object.fields[0].should.have.property('name','v');
		result.object.fields[0].should.have.property('type','double');
		result.object.fields[0].should.have.property('subtype','double');
		result.object.fields[1].should.have.property('name','sv');
		result.object.fields[1].should.have.property('type','CFSwappedFloat64');
		result.object.fields[1].should.have.property('subtype','CFSwappedFloat64');
	});

	it("should be able to parse union CFSwap", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'union CFSwap');
		result.should.have.property('metatype','union');
		result.should.have.property('name','union CFSwap');
		result.should.have.property('simpleType','CFSwap');
		result.should.have.property('object');
		result.object.should.have.property('name','CFSwap');
		result.object.should.have.property('metatype','union');
		result.object.should.have.property('type','union');
		result.object.should.have.property('subtype','union');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(2);
		result.object.fields[0].should.have.property('name','v');
		result.object.fields[0].should.have.property('type','double');
		result.object.fields[0].should.have.property('subtype','double');
		result.object.fields[1].should.have.property('name','sv');
		result.object.fields[1].should.have.property('type','CFSwappedFloat64');
		result.object.fields[1].should.have.property('subtype','CFSwappedFloat64');
	});

	it("should be able to parse CFSwappedFloat64", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'CFSwappedFloat64');
		result.should.have.property('metatype','struct');
		result.should.have.property('name','CFSwappedFloat64');
		result.should.have.property('simpleType','CFSwappedFloat64');
		result.should.have.property('object');
		result.object.should.have.property('name','CFSwappedFloat64');
		result.object.should.have.property('metatype','typedef');
		result.object.should.have.property('type','CFSwappedFloat64');
		result.object.should.have.property('subtype','struct CFSwappedFloat64');
		result.object.should.have.property('fields');
		result.object.fields.should.have.length(1);
		result.object.fields[0].should.have.property('name','v');
		result.object.fields[0].should.have.property('type','unsigned long long');
		result.object.fields[0].should.have.property('subtype','uint64_t');
	});

	it("should be able to parse uint64_t", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'uint64_t');
		result.should.have.property('metatype','primitive');
		result.should.have.property('name','unsigned long long');
		result.should.have.property('simpleType','long long');
		result.should.have.property('pointer',false);
		result.should.have.property('pointer_to_pointer',false);
	});

	it("should be able to parse id<NSCopying>", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'id<NSCopying>');
		result.should.have.property('metatype','protocol');
		result.should.have.property('name','id<NSCopying>');
		result.should.have.property('classname','id');
		result.should.have.property('protocols');
		result.protocols.should.have.length(1);
		result.protocols[0].should.have.property('name','NSCopying');
		result.protocols[0].should.have.property('metatype','protocol');
		result.protocols[0].should.have.property('framework','Foundation');
	});

	it("should be able to parse id<NSCopying,NSMutableCopying,NSSecureCoding>", function() {
		var result = typegenerator.generateTypeMetadata(metadata, 'id<NSCopying,NSMutableCopying,NSSecureCoding>');
		result.should.have.property('metatype','protocol');
		result.should.have.property('name','id<NSCopying,NSMutableCopying,NSSecureCoding>');
		result.should.have.property('classname','id');
		result.should.have.property('protocols');
		result.protocols.should.have.length(3);
		result.protocols[0].should.have.property('name','NSCopying');
		result.protocols[0].should.have.property('metatype','protocol');
		result.protocols[0].should.have.property('framework','Foundation');
		result.protocols[1].should.have.property('name','NSMutableCopying');
		result.protocols[1].should.have.property('metatype','protocol');
		result.protocols[1].should.have.property('framework','Foundation');
		result.protocols[2].should.have.property('name','NSSecureCoding');
		result.protocols[2].should.have.property('metatype','protocol');
	});

});
