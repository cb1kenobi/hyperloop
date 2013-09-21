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
#import <zlib.h>
#import "JSBuffer.h"
#import "JSOwner.h"

typedef enum JSPrivateObjectType {
	JSPrivateObjectTypeID = 0,
	JSPrivateObjectTypeClass = 1,
	JSPrivateObjectTypeJSBuffer = 2
} JSPrivateObjectType;

typedef struct JSPrivateObject {
    void *object;
   	JSPrivateObjectType type;
   	NSMapTable *map;
   	JSContextRef context;
} JSPrivateObject;

@protocol HyperloopFactory
+(JSObjectRef)make:(JSContextRef)ctx instance:(id)instance;
@end

@protocol HyperloopModule
+(JSValue*)load:(JSContext*)context;
@end


/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is an id
 */
JSPrivateObject* HyperloopMakePrivateObjectForID(JSContextRef ctx,id object);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a Class
 */
JSPrivateObject* HyperloopMakePrivateObjectForClass(Class cls);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a JSBuffer *
 */
JSPrivateObject* HyperloopMakePrivateObjectForJSBuffer(JSBuffer *buffer);

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
JSContext* HyperloopCreateVM (NSString *name);
