/**
 * JavaScriptCore specific details 
 */
function toValue(ast, g) {
    
    var type,
        t = g.type.replace('*','').trim();

    if (g.type === 'char*' || g.type === 'char *') {
        type = '[NSString stringWithUTF8String:'+g.name+']';
    }
    else {
        switch(g.subtype) {

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
                type = '[JSValue valueWithSize:'+g.name+' inContext:object.context]';
                break;
            }
            case 'CGPoint': {
                type = '[JSValue valueWithPoint:'+g.name+' inContext:object.context]';
                break;
            }
            case 'NSRange': {
                type = '[JSValue valueWithRange:'+g.name+' inContext:object.context]';
                break;
            }
            case 'CGRect': {
                type = '[JSValue valueWithRect:'+g.name+' inContext:object.context]';
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
                        type = '[JSValue valueWithInt32:'+g.name+' inContext:object.context]'; 
                        break;
                    }
                    case 'uint32_t': {
                        type = '[JSValue valueWithUInt32:'+g.name+' inContext:object.context]'; 
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
                        if ((o=ast.statics[g.name])) {
                            if (o.metatype==='constant') {
                                type = g.name;
                                break;
                            }
                        }
                        // if we find a class, we can assume it has been JSExport and we 
                        // can just return it
                        if (ast.classes[g.name]) {
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

exports.toValue = toValue;
