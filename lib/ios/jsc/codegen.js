/**
 * JavaScriptCore C API generation
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	wrench = require('wrench'),
	_ = require('underscore'),
	log = require('../../log'),
	typegenerator = require('./typegenerator'),
    template = fs.readFileSync(path.join(__dirname,'templates','template.ejs')).toString();


exports.generate = generate;
exports.generateCode = generateCode;
exports.precompile = precompile;
exports.arc = false;


function fileCopy(from, to) {
    var f = fs.readFileSync(from);
    fs.writeFileSync(to, f);
}

function generateCode (gen, genopts, callback) {

	var generated = gen.generated,
		metadata = genopts.metadata,
        srcs = genopts.srcs,
        state = typegenerator.createState(metadata,genopts.minversion),
        types = Object.keys(gen.classes)
    			.concat(Object.keys(gen.functions))
    			.concat(Object.keys(gen.statics)),
    	config = {
    		version: genopts.minversion,
    		types: types,
    		customclasses: gen.customclasses,
    		builddir: genopts.dest,
    		outdir: genopts.srcdir,
    		sources: genopts.srcs,
            state: state
    	},
        externs = [],
        code = [],
        classes = [],
        templateSourceDir = path.join(__dirname,'templates','source');

    // copy our sources over
    fs.readdirSync(templateSourceDir).forEach(function(file){
        if (/\.h$/.test(file)) {
            var f = path.join(templateSourceDir,file),
                t = path.join(config.outdir,file);
            fileCopy(f, t);
        }
    });

    Object.keys(gen.statics).forEach(function(sym){
        var type = typegenerator.resolveType(state, sym);
        //console.log(sym,'=>',type.metatype);
        switch(type.metatype) {
            case 'function': {
                var fn = 'Hyperloop'+type.mangledName,
                    cn = type.mangledName,
                    extern = 'extern JSValueRef '+fn+' (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)';

                //TODO: turn this into a register function
                code.push('JSStringRef '+cn+'Prop = JSStringCreateWithUTF8CString("'+sym+'");');
                code.push('JSObjectRef '+cn+'ObjectRef = JSObjectMakeFunctionWithCallback(ctx,'+cn+'Prop,'+fn+');');
                code.push('JSObjectSetProperty(ctx,object,'+cn+'Prop,'+cn+'ObjectRef,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete,0);');
                code.push('JSStringRelease('+cn+'Prop);');
                code.push('');
                externs.push(extern);
                break;
            }
            case 'symbol': {
                if (type.object && type.object.framework) {
                    gen.imports.push(type.object.framework);
                }
                typegenerator.resolveType(state,type.object.type);
                code.push('HyperloopRegisterSymbol'+type.mangledName+'(ctx,object);');
                code.push('');
                externs.push('extern void HyperloopRegisterSymbol'+type.mangledName+'(JSContextRef,JSObjectRef);');
                break;
            }
        }
    });

    Object.keys(gen.customclasses).forEach(function(cn) {
        //TODO: turn this into a register function
        var fn = 'MakeObjectFor'+cn+'ConstructorCallback',
            extern = 'extern JSValueRef MakeObjectFor'+cn+'ConstructorCallback (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)';

        code.push('JSStringRef '+cn+'Prop = JSStringCreateWithUTF8CString("Make$'+cn+'");');
        code.push('JSObjectRef '+cn+'ObjectRef = JSObjectMakeFunctionWithCallback(ctx,'+cn+'Prop,'+fn+');');
        code.push('JSObjectSetProperty(ctx,object,'+cn+'Prop,'+cn+'ObjectRef,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete,0);');
        code.push('JSStringRelease('+cn+'Prop);');
        code.push('');

        externs.push(extern);
    });
    
    Object.keys(gen.classes).forEach(function(cn) {
        var t = typegenerator.resolveType(state,cn);
        if (t.metatype=='interface' && !(cn in gen.customclasses)) {
            classes.push(cn);
        }
    });

    classes.forEach(function(cn) {
        //TODO: turn this into a register function
        var fn = 'JSObjectRef '+cn+'ObjectRef = MakeObjectFor'+cn+'Constructor',
            extern = 'extern JSObjectRef MakeObjectFor'+cn+'Constructor (JSContextRef)';

        code.push('JSStringRef '+cn+'Prop = JSStringCreateWithUTF8CString("'+cn+'");');
        code.push(fn+'(ctx);');
        code.push('JSObjectSetProperty(ctx,object,'+cn+'Prop,'+cn+'ObjectRef,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete,0);');
        code.push('JSStringRelease('+cn+'Prop);');
        code.push('');

        externs.push(extern);
    });

    typegenerator.generate(metadata, config, function(err) {

        if (err) return callback(err);

        var includes = [],
            imports = gen.imports;

        typegenerator.sortOutSystemFrameworks(state,imports,includes);

        // load the jsengine template file dynamically
        var source = ejs.render(template, {
            gen:gen,
            externs: externs,
            imports: imports,
            _includes: includes,
            code: code.join('\n'),
            metadata: metadata,
            indentify: typegenerator.indentify
        });

        return callback(null, source);

    });

}

function generate (config) {
    //TODO: refactor out
}

function precompile(genopts, callback) {
    //TODO: refactor out
    return callback();
}

