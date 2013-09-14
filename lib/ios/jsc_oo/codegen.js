/**
 * JavaScriptCore specific details 
 */
var fs = require('fs'),
    path = require('path'),
    ejs = require('ejs'),
    _ = require('underscore'),
    codegen = require('../codegen'),
    castRegex = /<(.*)>/,
    blackList = [
        'NSNumber',
        'NSString',
        'NSMutableString',
        'NSAttributedString',
        'NSMutableAttributedString',
        'NSValue',
        'NSArray',
        'NSDictionary',
        'NSSet',
        'NSMutableSet',
        'NSMutableDictionary',
        'NSObject',
        'NSDate',
        'Protocol',
        'NSRunLoop',
        'NSZone',
        'NSPort',
        'NSOperation',
        'NSOperationQueue',
        'NSRange',
        'NSCoder'
    ],
    template = fs.readFileSync(path.join(__dirname,'templates','template.ejs')).toString();

function checkMetadata(metadata) {
    if (!metadata.generate) {
        metadata.generate = {
            interfaces: [],
            implementations: []
        };
    }
}

function makeExport(f,implementation,skipExport) {

    //TEMP HACK until I can support multiple methods
    if (f.constructor.name === Array.prototype.constructor.name) {
        f = f[0];
    }

    var output=[];
    if (!skipExport && !implementation && f.args && f.args.length>1) {
        output.push('JSExportAs(' + f.name +',');
    }
    var selector = (f.instance ? '-' : '+');
    selector+='('+f.returnType+')';
    selector+=f.implname||f.name;
    if (f.args && f.args.length) {
        selector+=':';
        // sometimes, name is empty from spec
        if (!f.args[0].name) {
            f.args[0].name = 'o';
        }
        selector+='('+f.args[0].type+')'+f.args[0].name;
        if (f.args.length>1) {
            var sel = f.selector ? f.selector.split(':') : null;
            for (var c=1;c<f.args.length;c++) {
                var a = f.args[c],
                    n = sel ? sel[c] : a.name;
                selector+=' '+n+':('+a.type+')'+a.name + (skipExport ? ';' : '');
            }
        }
        else {
            !implementation && (selector+=';');
        }
    }
    else {
        !implementation && (selector+=';');
    }
    if (implementation) {
        selector+='\n{\n';
        implementation.split('\n').forEach(function(b){
            selector+='   '+b+'\n';
        });
        selector+='}';
    }
    if (!skipExport && !implementation && f.args && f.args.length>1) {
        output.push('   '+selector);
        output.push(');');
    }
    else {
        output.push(selector);
    }
    return output.join('\n') + '\n';
}

function toFunction(ast, gen, indent) {
    var result = toValue(ast,{name:'result$',type:gen.ref.returnType,subtype:gen.ref.returnSubtype});
    if (/\.\.\.\)$/.test(gen.ref.signature)) {
        // this is a vararg, we need to build the signature differently - skip it
        return;
    }
    else {
        var args = gen.ref.arguments;
        var argbody = [],
            varnames = [],
            count = 0;
        args.forEach(function(a){
            if (!a.type && !a.subtype) {
                varnames.push('arg'+count);
                argbody.push(a.name+' arg'+count);
            }   
            else {
                varnames.push(a.name);
                argbody.push(a.type+' '+a.name);
            }
            count++;
        });
        var argsig = '('+argbody.join(', ')+')';
        var body = '^' + argsig + ' {\n';
        body+=indent+indent+gen.ref.returnType+' result$ = '+gen.ref.name+'('+varnames.join(',')+');\n';
        body+=indent+indent+'return '+result+';\n';
        body+=indent+'}';
        return body;
    }    
}

function toValue(ast, g, indent) {
    
    var type,
        t = g.type.replace('*','').trim();

    if (g.type === 'char*' || g.type === 'char *') {
        type = '[NSString stringWithUTF8String:'+g.name+']';
    }
    else {
        switch(g.subtype) {

            case 'void': {
                type = '';
                break;
            }
        	case 'CFTypeID':
        	case 'CFOptionFlags':
        	case 'CFHashCode':
        	{
				type = '[NSNumber numberWithUnsignedLong:(unsigned long)'+g.name+']';
				break;
        	}
        	case 'CFIndex':
        	{
				type = '[NSNumber numberWithSignedLong:(signed long)'+g.name+']';
				break;
        	}
            case 'CFStringRef': {
                type = '(__bridge id)'+g.name;
                break;
            }
            case 'CGFloat': {
                type = '[NSNumber numberWithFloat:'+g.name+']';
                break;
            }
            case 'NSInteger': {
                type = '[NSNumber numberWithInteger:'+g.name+']';
                break;
            }
            case 'NSUInteger': {
                type = '[NSNumber numberWithUnsignedInteger:'+g.name+']';
                break;
            }
            case 'NSTimeInterval': {
                type = '[NSNumber numberWithDouble:'+g.name+']';
                break;
            }
            case 'CGSize': {
                type = '[JSValue valueWithSize:'+g.name+' inContext:[JSContext currentContext]]';
                break;
            }
            case 'CGPoint': {
                type = '[JSValue valueWithPoint:'+g.name+' inContext:[JSContext currentContext]]';
                break;
            }
            case 'NSRange': {
                type = '[JSValue valueWithRange:'+g.name+' inContext:[JSContext currentContext]]';
                break;
            }
            case 'CGRect': {
                type = '[JSValue valueWithRect:'+g.name+' inContext:[JSContext currentContext]]';
                break;
            }
            default: {
                switch(t) {
                    case 'float': {
                        type = '[NSNumber numberWithFloat:(float)'+g.name+']';
                        break;
                    }
                    case 'bool': {
                        type = '[NSNumber numberWithBool:(bool)'+g.name+']';
                        break;
                    }
                    case 'double': {
                        type = '[NSNumber numberWithDouble:(double)'+g.name+']';
                        break;
                    }
                    case 'signed int': {
                        type = '[NSNumber numberWithInt:(signed int)'+g.name+']';
                        break;
                    }
                    case 'int': {
                        type = '[NSNumber numberWithInt:(int)'+g.name+']';
                        break;
                    }
                    case 'signed long': {
                        type = '[NSNumber numberWithLong:(signed long)'+g.name+']';
                        break;
                    }
                    case 'long': {
                        type = '[NSNumber numberWithLong:(long)'+g.name+']';
                        break;
                    }
                    case 'signed long long': {
                        type = '[NSNumber numberWithLongLong:(signed long long)'+g.name+']';
                        break;
                    }
                    case 'long long': {
                        type = '[NSNumber numberWithLongLong:(long long)'+g.name+']';
                        break;
                    }
                    case 'signed short': {
                        type = '[NSNumber numberWithShort:(signed short)'+g.name+']';
                        break;
                    }
                    case 'short': {
                        type = '[NSNumber numberWithShort:(short)'+g.name+']';
                        break;
                    }
                    case 'signed char': {
                        type = '[NSNumber numberWithChar:(signed char)'+g.name+']';
                        break;
                    }
                    case 'char': {
                        type = '[NSNumber numberWithChar:(char)'+g.name+']';
                        break;
                    }
                    case 'unsigned int': {
                        type = '[NSNumber numberWithUnsignedInt:(unsigned int)'+g.name+']';
                        break;
                    }
                    case 'unsigned long': {
                        type = '[NSNumber numberWithUnsignedLong:(unsigned long)'+g.name+']';
                        break;
                    }
                    case 'unsigned long long': {
                        type = '[NSNumber numberWithUnsignedLongLong:(unsigned long long)'+g.name+']';
                        break;
                    }
                    case 'unsigned short': {
                        type = '[NSNumber numberWithUnsignedShort:(unsigned short)'+g.name+']';
                        break;
                    }
                    case 'unsigned char': {
                        type = '[NSNumber numberWithUnsignedChar:(unsigned char)'+g.name+']';
                        break;
                    }
                    case 'CVTime': {
                        return '//FIXME: CVTime not yet implemented for '+g.name;
                    }
                    case 'int32_t': {
                        type = '[JSValue valueWithInt32:'+g.name+' inContext:[JSContext currentContext]]'; 
                        break;
                    }
                    case 'uint32_t': {
                        type = '[JSValue valueWithUInt32:'+g.name+' inContext:[JSContext currentContext]]'; 
                        break;
                    }
                    case '_Complex double': {
                        type = '[NSNumber numberWithDouble:(double)'+g.name+']';
                    	break;
                    }
                    case 'id':
                    case 'Class':
                    case 'JSValue':
                    case 'NSArray':
                    case 'NSMutableArray':
                    case 'NSDate':
                    case 'NSString': 
                    case 'NSNumber':
                    case 'NSBlock':
                    case 'NSNull':
                    case 'NSMutableString': {
                        //NOTE: this are automatically converted in JSValue
                        type = g.name;
                        break;
                    }
                    default: {

                        var o;
                        if ((o=ast.symbols[g.name])) {
                            if (o.metatype==='constant') {
                                type = g.name;
                                break;
                            }
                        }
                        // if we find a class, we can assume it has been JSExport and we 
                        // can just return it
                        if (ast.classes[g.type]) {
                            type = g.name;
                            break;
                        }
                        else {
                            throw new Error('Unsupported type: '+g.type);
                        }
                    }
                }
                break;
            }
        }
    }
    return type || '';
}    

function addDependency (metadata, depends, generated, type) {
    if (!type) return;
    var t = type.replace('*','').trim(),
        m = castRegex.exec(t), // attempt to remove stuff like id<Foo>
        t = m ? m[1] : t;
    if (t && depends.indexOf(t)===-1 && generated.indexOf(t)===-1 && blackList.indexOf(t)===-1) {
        if (t in metadata.classes) {
            depends.push(t);
        }
    }
}

function internalGenerate (metadata, generation, interfaceName, depends, generated) {

    //TODO: protocols
    //TODO: visibility, availability, etc.
    var entry = metadata.classes[interfaceName] || metadata.protocols[interfaceName];

    entry.makeExport = makeExport; 
    entry.formatSource = codegen.formatSource;
    entry.metadata = metadata;
    entry.generation = generation;

    checkMetadata(metadata);
    
    addDependency(metadata, depends, generated, entry.superClass);

    entry.protocols && entry.protocols.forEach(function(p){
        addDependency(metadata, depends, generated, p);
    });

    entry.properties && Object.keys(entry.properties).forEach(function(k){
        var p = entry.properties[k];
        addDependency(metadata, depends, generated, p.type);
    });
    
    entry.methods && Object.keys(entry.methods).forEach(function(k){
        var m = entry.methods[k];
        if (m.constructor.name === Array.prototype.constructor.name) {
            m = m[0]; //FIXME: this is a temp hack until i can handle multiple args
        }
        addDependency(metadata, depends, generated, m.returnType);
        if (m.args && m.args.length) {
            m.args.forEach(function(arg){
                addDependency(metadata, depends, generated, arg.type);
            });
        }
    });

    delete entry.makeExport;
    delete entry.makeBinding;
    delete entry.formatSource;
    delete entry.metadata;
    delete entry.generation;
    
    if (generated.indexOf(interfaceName)===-1) generated.push(interfaceName);
}   

function generateRecursive (metadata, generation, interfaceName, depends, generated, imports) {

    // don't generate multiple times
    if (generated.indexOf(interfaceName)!==-1) return '';
    
    // generate the main interface
    var code = internalGenerate(metadata, generation, interfaceName, depends, generated) || '';
    
    // generate dependant classes
    depends.forEach(function(d){
        code+=generateRecursive(metadata, generation, d, depends, generated, imports) || '';
    });
    
    // generate the imports
    generated.forEach(function(i){
        var intf = metadata.classes[i] || metadata.protocols[i];
        if (intf.framework) {
            var importName = '@import '+intf.framework+';';
            if (imports.indexOf(importName)===-1) {
                imports.push(importName);
            }
        }
    });
    
    return code;
}

function generate (metadata, generation, interfaceName, depends, generated, prefix, srchash, srcs, srcdir) {

    var imports = ['#import <objc/runtime.h>','@import JavaScriptCore;'],
        code = generateRecursive(metadata, generation, interfaceName, depends, generated, imports);
    
    // since we can include multiple codegen librariesi into a final application
    // and this is a global function, we need to generate a unique symbol name for it
    // which the timestamp should be sufficient for this purpose
    var registerName = 'RegisterJSClasses_'+srchash;
    generated.registerName = registerName;

    code+='/**\n';
    code+=' * called to dynamically add our JSExport protocols to the system interfaces\n';
    code+=' */\n';
    code+='void '+registerName+'()\n';
    code+='{\n';
    code+='     static bool registered;\n';
    code+='     if (registered==false)\n';
    code+='     {\n';
    code+='         registered = true;\n';
    code+='     }\n';
    code+='\n';

    var protocol_shims_interfaces = [],
        protocol_shims_implementations = [];


    // generate the imports
    generated.forEach(function(i){
        var intf = metadata.classes[i] || metadata.protocols[i],
            name = i,
            // see if we need to generate.  also note that if we don't have a superclass we ain't doing anything with it
            generate = blackList.indexOf(name)===-1 && intf.superClass,
            properties = intf.properties || {},
            methods = intf.methods || {};


        var sc = intf.superClass;
        while(sc) {
            var p = metadata.classes[sc];
            if (!p) break;
            p.methods && (methods = _.extend(methods,p.methods));
            p.properties && (properties = _.extend(properties,p.properties));
            sc = p.superClass;
        }

        // if have any properties or methods, we need to generate the exports for those
        if (!generate && (Object.keys(properties).length > 0 || Object.keys(methods).length > 0))
        {
            generate = true;
        }        

        if (generate) {

                metadata.generate.interfaces.push('/**');
                metadata.generate.interfaces.push(' * wrapped JSExport for '+name);
                metadata.generate.interfaces.push(' */');
                metadata.generate.interfaces.push('@protocol JS'+name+'Export <JSExport>');
                metadata.generate.interfaces.push('');

                Object.keys(properties).forEach(function(k){
                    var p = properties[k];
                    metadata.generate.interfaces.push('@property '+(p.type.indexOf('^')===-1 ? p.type : p.subtype)+' '+k+';');
                    if (p.name === 'delegate' && p.getter === 'delegate' && /^id</.test(p.type) && p.type === p.subtype) {
                        var pi = /id<(.*)>/.exec(p.type);
                        if (pi && pi.length==2) {
                            var protocol = metadata.protocols[pi[1]];
                            if (protocol) {
                                // this is a delegate assignment for a protocol, we need to create a shim for it
                                protocol_shims_interfaces.push('/**');
                                protocol_shims_interfaces.push(' * wrapped delegate shim for '+name);
                                protocol_shims_interfaces.push(' */');
                                protocol_shims_interfaces.push('@interface '+name+'(JS'+name+'DelegateShim)');
                                protocol_shims_interfaces.push('-(void)setJSDelegateWithProtocol:('+p.type+')delegate;');
                                protocol_shims_interfaces.push('@end');
                                protocol_shims_interfaces.push('');
                                protocol_shims_implementations.push('@implementation '+name+'(JS'+name+'DelegateShim)');
                                protocol_shims_implementations.push('-(void)setJSDelegateWithProtocol:('+p.type+')delegate');
                                protocol_shims_implementations.push('{');
                                protocol_shims_implementations.push('    self.delegate = delegate;');
                                protocol_shims_implementations.push('}');
                                protocol_shims_implementations.push('@end');
                                protocol_shims_implementations.push('');
                                metadata.generate.interfaces.push('-(void)setJSDelegateWithProtocol:('+p.type+')delegate;');
                                metadata.generate.interfaces.push('');
                            }
                        }
                    }              
                });
                metadata.generate.interfaces.push('');

                // we don't generate methods for protocols, only interfaces
                if (intf.metatype === 'interface') {
                    Object.keys(methods).forEach(function(k){
                        var m = methods[k],
                            e = makeExport(m);
                        metadata.generate.interfaces.push(e);
                        metadata.generate.interfaces.push('');
                    });
                    metadata.generate.interfaces.push('');
                }

                metadata.generate.interfaces.push('@end');
                metadata.generate.interfaces.push('');

            if (intf.metatype == 'interface') {
                code+='    if ([['+name+' class] conformsToProtocol:@protocol(JS'+name+'Export)]==NO)\n';
                code+='    {\n';
                code+='        class_addProtocol(['+name+' class], @protocol(JS'+name+'Export));\n';
                code+='    }\n';
                code+='\n';
            }
        }
    });
    
    code+='}\n';

    // generate any protocols
    var protocol_interfaces = [],
        protocol_implementations = [];

    Object.keys(generation).forEach(function(k){
        var f = generation[k];
        Object.keys(f).forEach(function(i){
            var proto = metadata.protocols[i];
            if (proto) {

                protocol_interfaces.push('@interface JS'+i+' : NSObject<'+i+'>');
                protocol_interfaces.push('');
                Object.keys(proto.methods).forEach(function(m){
                    var f = proto.methods[m],
                        // only generate instance methods for callbacks
                        e = f.instance && f.returnType=='void' && makeExport(f,null,true);
                    e && protocol_interfaces.push(e);
                });
                protocol_interfaces.push('@end');
                protocol_interfaces.push('');

                protocol_implementations.push('@implementation JS'+i);
                protocol_implementations.push('');
                
                protocol_implementations.push('-(void)dealloc {');
                protocol_implementations.push('   NSLog(@"dealloc %@",self);');
                protocol_implementations.push('}');
                protocol_implementations.push('');

                Object.keys(proto.methods).forEach(function(m){
                    var f = proto.methods[m];
                    // only create callbacks that return empty methods
                    if (f.instance && f.returnType=='void') {
                        var body = [];
                        body.push('JSManagedValue *mv = self.callback;');
                        body.push('JSValue *object = [mv value];');
                        body.push('if (object==nil) return;');
                        body.push('JSValue *fn = object[@"'+m+'"];');
                        body.push('if (fn && [fn isObject]) {');
                        body.push('   NSMutableArray *args = [NSMutableArray array];')
                        f.args.forEach(function(arg){
                            body.push('   id _'+arg.name+' = '+codegen.makeBinding(metadata,arg,true)+';');
                            body.push('   [args addObject:_'+arg.name+'];');
                        });
                        body.push('   [fn callWithArguments:args];');
                        body.push('}');
                        body.push('return;');
                        var e = makeExport(f,body.join('\n'));
                        e && protocol_implementations.push(e);
                    }
                });
                protocol_implementations.push('@end');
                protocol_implementations.push('');
            }
        });
    });

    var subcode = '';

    if (protocol_shims_interfaces.length > 0) {
        subcode+=protocol_shims_interfaces.join('\n') + '\n\n';
        subcode+=protocol_shims_implementations.join('\n') + '\n';
    }

    if (metadata.generate && (metadata.generate.interfaces.length || metadata.generate.implementations.length)) {
        
        subcode+=metadata.generate.interfaces.join('\n') + '\n\n';
        subcode+=metadata.generate.implementations.join('\n') + '\n';
    }

    if (protocol_interfaces.length) {
        subcode+=protocol_interfaces.join('\n') + '\n\n';
        subcode+=protocol_implementations.join('\n') + '\n';
    }

    var impl = ejs.render(fs.readFileSync(path.join(__dirname,'templates','types.ejs')).toString(),{
        gen: {
            imports: imports,
            code: subcode + code,
            prefix: prefix
        }
    }),
    header = ejs.render(fs.readFileSync(path.join(__dirname,'templates','types_header.ejs')).toString(),{
        gen: {
            imports: imports,
            prefix: prefix
        }
    });

    var types = path.join(srcdir,'types.m');
    fs.writeFileSync(types,impl);

    // make sure we compile it
    srcs.push(types);

    types = path.join(srcdir,'types.h');
    fs.writeFileSync(types,header);
}

function currentArgument(times, name) {
    var result = [];
    for (var c=0;c<times;c++) {
        result.push('[(JSValue*)['+name+' objectAtIndex:'+c+'] toObject]');
    }
    return result.join(',');
}

function generateCode (gen, callback) {
    gen.currentArgument = currentArgument;
    gen.generateStatic = generateStatic; 

    // load the jsengine template file dynamically
    var source = ejs.render(template, {
        gen:gen
    });
    callback(null,source);
}

function generateStatic(ast,gen,indent) {
    switch(gen.ref.metatype) {
        case 'function': {
            return toFunction(ast,gen,indent);
        }
        case 'constant': {
            return toValue(ast,gen.ref,indent);
        }
    }
}

exports.toValue = toValue;
exports.toFunction = toFunction;
exports.generate = generate;
exports.makeExport = makeExport;
exports.generateCode = generateCode;
exports.arc = true;
