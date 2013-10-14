/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
@import JavaScriptCore;
#import <objc/runtime.h>
#import <malloc/malloc.h>
#import <zlib.h>
#import "JSBuffer.h"
#import "JSOwner.h"
#import "Module.h"

#define UNUSED(x) (void)(x)

typedef enum JSPrivateObjectType {
	JSPrivateObjectTypeID = 0,
	JSPrivateObjectTypeClass = 1,
	JSPrivateObjectTypeJSBuffer = 2,
	JSPrivateObjectTypePointer = 3,
	JSPrivateObjectTypeNumber = 4
} JSPrivateObjectType;

typedef struct JSPrivateObject {
    void *object;
    double value; // this would be good to turn into a union at some point
   	JSPrivateObjectType type;
   	NSMapTable *map;
   	JSContextRef context;
} JSPrivateObject;

@protocol HyperloopFactory
+(JSObjectRef)make:(JSContextRef)ctx instance:(id)instance;
@end

@protocol HyperloopModule
+(NSData*)buffer;
+(void)load:(JSContextRef)context withObject:(JSObjectRef)object;
@end

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is an id
 */
JSPrivateObject* HyperloopMakePrivateObjectForID(JSContextRef ctx, id object);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a Class
 */
JSPrivateObject* HyperloopMakePrivateObjectForClass(Class cls);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a JSBuffer *
 */
JSPrivateObject* HyperloopMakePrivateObjectForJSBuffer(JSBuffer *buffer);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a void *
 */
JSPrivateObject* HyperloopMakePrivateObjectForPointer(void *pointer);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a double
 */
JSPrivateObject* HyperloopMakePrivateObjectForNumber(double value);

/**
 * return a JSPrivateObject as an ID (or nil if not of type JSPrivateObjectTypeID)
 */
id HyperloopGetPrivateObjectAsID(JSObjectRef objectRef);

/**
 * return a JSPrivateObject as a Class (or nil if not of type JSPrivateObjectTypeID)
 */
Class HyperloopGetPrivateObjectAsClass(JSObjectRef objectRef);

/**
 * return a JSPrivateObject as a JSBuffer (or NULL if not of type JSPrivateObjectTypeJSBuffer)
 */
JSBuffer* HyperloopGetPrivateObjectAsJSBuffer(JSObjectRef objectRef);

/**
 * return a JSPrivateObject as a void * (or NULL if not of type JSPrivateObjectTypePointer)
 */
void* HyperloopGetPrivateObjectAsPointer(JSObjectRef objectRef);

/**
 * return a JSPrivateObject as a double (or NaN if not of type JSPrivateObjectTypeNumber)
 */
double HyperloopGetPrivateObjectAsNumber(JSObjectRef objectRef);

/**
 * return true if JSPrivateObject contained in JSObjectRef is of type
 */
bool HyperloopPrivateObjectIsType(JSObjectRef objectRef, JSPrivateObjectType type);

/**
 * destroy a JSPrivateObject stored in a JSObjectRef
 */
void HyperloopDestroyPrivateObject(JSObjectRef object);

/**
 * set the owner for an object
 */
void HyperloopSetOwner(JSObjectRef object, id owner);

/**
 * get the owner for an object or nil if no owner or it's been released
 */
id HyperloopGetOwner(JSObjectRef object);

/**
 * raise an exception
 */
JSValueRef HyperloopMakeException(JSContextRef ctx, const char *message, JSValueRef *exception);

/**
 * return a string representation as a JSValueRef for an id
 */
JSValueRef HyperloopToString(JSContextRef ctx, id object);

/**
 * attempt to convert a JSValueRef to a NSString
 */
NSString* HyperloopToNSString(JSContextRef ctx, JSValueRef value);

/**
 * create a hyperloop VM
 */
JSGlobalContextRef HyperloopCreateVM (NSString *name, NSString *prefix);

/**
 * given a context, get the global context
 */
JSGlobalContextRef HyperloopGetGlobalContext(JSContextRef ctx);

/**
 * destroy a hyperloop VM
 */
void HyperloopDestroyVM(JSGlobalContextRef ctx);

/**
 * attempt to convert a JSString to a NSString
 */
NSString* HyperloopToNSStringFromString(JSContextRef ctx, JSStringRef value);

/**
 * invoke a dynamic argument
 */
id HyperloopDynamicInvoke (JSContextRef ctx, const JSValueRef *arguments, size_t argumentCount, id target, SEL selector, bool instance);

