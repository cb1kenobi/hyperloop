/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

#import "JSBuffer.h"
#import <hyperloop.h>
#import <malloc/malloc.h>

static JSClassDefinition ClassDefinitionForJSBufferConstructor;
static JSClassDefinition ClassDefinitionForJSBuffer;
static JSClassRef JSBufferClassDefForConstructor;
static JSClassRef JSBufferClassDef;


#define BUFFER(name) \
JSBuffer *name = (JSBuffer*)HyperloopGetPrivateObjectAsJSBuffer(object);\
if (buffer==NULL)\
{\
    return JSValueMakeUndefined(ctx);\
}\

#define CHECK_SIZE_AND_GROW(size,index) \
if (buffer->length <= ( index * size ) || (index == 0 && buffer->length < size))\
{\
    if (index == 0)\
    {\
        free(buffer->buffer);\
        buffer->buffer = malloc(size);\
        buffer->length = size;\
    }\
    else\
    {\
        void *copy = malloc(buffer->length + size);\
        memcpy(copy, buffer->buffer, buffer->length);\
        free(buffer->buffer);\
        buffer->buffer = copy;\
        buffer->length += size;\
    }\
}\


#define MIN_SIZE(size) \
if (buffer->length < size)\
{\
    return JSValueMakeNumber(ctx,NAN);\
}\

#define PRIMITIVE_GET(type) \
type value = (type)((type*)buffer->buffer)[0]; \

#define PRIMITIVE_GET_ARRAY(type) \
type * value = (type *)(buffer->buffer); \

#define PRIMITIVE_SET(type,index) \
type *p = (type*)buffer->buffer;\
p[(int)index] = (type)value;\

#define ARGCOUNTMIN(size) \
if (argumentCount < size) \
{\
JSStringRef string = JSStringCreateWithUTF8CString("wrong number of arguments passed, required at a minimum #size");\
JSValueRef message = JSValueMakeString(ctx, string);\
JSStringRelease(string);\
*exception = JSObjectMakeError(ctx, 1, &message, 0);\
return NULL;\
}\

#define ARGCOUNT(size) \
if (argumentCount != size) \
{\
JSStringRef string = JSStringCreateWithUTF8CString("wrong number of arguments passed, required #size");\
JSValueRef message = JSValueMakeString(ctx, string);\
JSStringRelease(string);\
*exception = JSObjectMakeError(ctx, 1, &message, 0);\
return NULL;\
}\

#define CHECK_EXCEPTION(x) \
if (*exception!=NULL) {\
return x;\
} \

#define CHECK_EXCEPTION_UNDEFINED \
CHECK_EXCEPTION(JSValueMakeUndefined(ctx))

#define GET_NUMBER(index,varname)\
double varname = 0;\
if (argumentCount >= index + 1) \
{ \
    JSValueRef arg = arguments[index];\
    if (JSValueIsNumber(ctx,arg)) { \
        varname = JSValueToNumber(ctx, arg, exception);\
        CHECK_EXCEPTION_UNDEFINED \
    }\
    else if (JSValueIsBoolean(ctx,arg)) { \
        varname = (double)JSValueToBoolean(ctx, arg);\
        CHECK_EXCEPTION_UNDEFINED \
    }\
    else if (JSValueIsString(ctx,arg)) { \
        JSStringRef string = JSValueToStringCopy(ctx, arg, exception);\
        CHECK_EXCEPTION_UNDEFINED\
        const JSChar* charBuf = JSStringGetCharactersPtr(string);\
        varname = (double)charBuf[0];\
        JSStringRelease(string);\
    } \
    else {\
        varname = NAN; \
    }\
}\


#define GET_ARRAY(type) \
PRIMITIVE_GET_ARRAY(type);\
size_t len = sizeof(value) / sizeof(type); \
JSValueRef array[len]; \
for (size_t c=0;c<len;c++)\
{\
    type v = (type)(value[c]);\
    array[c] = JSValueMakeNumber(ctx,(double)v);\
}\
return JSObjectMakeArray(ctx,len,array,exception);\


/**
 * private release that can be shared
 */
void ReleaseBuffer (JSObjectRef object)
{
    HyperloopDestroyPrivateObject(object);
}

/**
 * return the length of the buffer
 */
JSValueRef GetLengthForJSBuffers (JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    BUFFER(buffer);
    return JSValueMakeNumber(ctx, buffer->length);
}

/**
 * return the NaN value
 */
JSValueRef GetNaNForJSBuffers (JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    return JSValueMakeNumber(ctx, NAN);
}

/**
 * generic conversion from native object representation to JS string
 */
JSValueRef toStringForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSStringRef descriptionStr = JSStringCreateWithUTF8CString("[object JSBuffer]");
    JSValueRef result = JSValueMakeString(ctx, descriptionStr);
    JSStringRelease(descriptionStr);
    return result;
}

/**
 * release
 */
JSValueRef releaseForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    ReleaseBuffer(object);
    return JSValueMakeUndefined(ctx);
}


/**
 * duplicate
 */
JSValueRef duplicateForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    JSBuffer *newbuf = malloc(sizeof(JSBuffer));
    newbuf->length = buffer->length;
    if (buffer->length)
    {
        if (buffer->type == JSBufferTypePointer)
        {
            newbuf->buffer = malloc(newbuf->length);
            memcpy(newbuf->buffer, buffer->buffer, buffer->length);
        }
        else
        {
            // JSValueRef is a copy
            newbuf->buffer = buffer->buffer;
        }
        newbuf->type = buffer->type;
    }
    return MakeObjectForJSBuffer (ctx, newbuf);
}

/**
 * put
 */
JSValueRef putForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNT(4);
    JSValueRef bufValueRef = arguments[0];
    if (!JSValueIsObject(ctx,bufValueRef))
    {
        JSStringRef string = JSStringCreateWithUTF8CString("first argument must be a buffer object");
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
        return JSValueMakeUndefined(ctx);
    }
    JSObjectRef bufObjectRef = JSValueToObject(ctx,bufValueRef,exception);
    CHECK_EXCEPTION_UNDEFINED
    JSBuffer *srcBuffer = (JSBuffer*)HyperloopGetPrivateObjectAsJSBuffer(bufObjectRef);
    if (srcBuffer==NULL)
    {
        JSStringRef string = JSStringCreateWithUTF8CString("first argument must be a buffer object (JSBuffer NULL)");
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
        return JSValueMakeUndefined(ctx);
    }

    GET_NUMBER(1,srcIndex);
    GET_NUMBER(2,srcLength);
    GET_NUMBER(3,destIndex);

    if (srcLength > srcBuffer->length)
    {
        JSStringRef string = JSStringCreateWithUTF8CString("source length passed in greater than source buffer length");
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
        return JSValueMakeUndefined(ctx);
    }

    if (srcLength <= 0)
    {
        JSStringRef string = JSStringCreateWithUTF8CString("source length must be greater than 0");
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
        return JSValueMakeUndefined(ctx);
    }

    void *src = &(srcBuffer->buffer[(int)srcIndex]);
    size_t newsize = (buffer->length - (int)destIndex);
    newsize = newsize + srcLength - newsize;
    void *dest = &(buffer->buffer[(int)destIndex]);

    if (newsize  > buffer->length)
    {
        // new to grow it
        void *copy = malloc(buffer->length);
        size_t copylen = buffer->length;
        memcpy(copy, buffer->buffer, copylen);
        free(buffer->buffer);
        buffer->buffer = malloc(newsize);
        buffer->length = newsize;
        memcpy(buffer->buffer,copy,copylen);
    }
    memcpy(dest, src, (int)srcLength);

    return object;
}

/**
 * putInt
 */
JSValueRef putIntForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(int),index);
    PRIMITIVE_SET(int,index);
    return object;
}

/**
 * putFloat
 */
JSValueRef putFloatForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(float),index);
    PRIMITIVE_SET(float,index);
    return object;
}

/**
 * putDouble
 */
JSValueRef putDoubleForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(double),index);
    PRIMITIVE_SET(double,index);
    return object;
}

/**
 * putShort
 */
JSValueRef putShortForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(short),index);
    PRIMITIVE_SET(short,index);
    return object;
}

/**
 * putLong
 */
JSValueRef putLongForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(long),index);
    PRIMITIVE_SET(long,index);
    return object;
}

/**
 * putLongLong
 */
JSValueRef putLongLongForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(long long),index);
    PRIMITIVE_SET(long long,index);
    return object;
}


/**
 * putBool
 */
JSValueRef putBoolForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(bool),index);
    PRIMITIVE_SET(bool,index);
    return object;
}

/**
 * putChar
 */
JSValueRef putCharForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    GET_NUMBER(0,value);
    GET_NUMBER(1,index);
    CHECK_SIZE_AND_GROW(sizeof(char),index);
    PRIMITIVE_SET(char,index);
    return object;
}

/**
 * putString
 */
JSValueRef putStringForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    ARGCOUNTMIN(1);
    NSString *string = HyperloopToNSString(ctx,arguments[0]);
    if (string!=nil)
    {
        const char *copy = [string UTF8String];
        size_t length = strlen(copy);
        CHECK_SIZE_AND_GROW(length,0);
        memcpy(buffer->buffer,copy,length);
    }
    return JSValueMakeUndefined(ctx);
}

/**
 * toInt
 */
JSValueRef toIntForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(int);
    GET_NUMBER(0,index);
    int v = value[(size_t)index];
    return JSValueMakeNumber(ctx, v);
}

/**
 * toIntArray
 */
JSValueRef toIntArrayForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    GET_ARRAY(int);
}

/**
 * toFloat
 */
JSValueRef toFloatForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(float);
    GET_NUMBER(0,index);
    float v = value[(size_t)index];
    return JSValueMakeNumber(ctx, v);
}

/**
 * toFloatArray
 */
JSValueRef toFloatArrayForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    GET_ARRAY(float);
}

/**
 * toDouble
 */
JSValueRef toDoubleForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(double);
    GET_NUMBER(0,index);
    double v = value[(size_t)index];
    return JSValueMakeNumber(ctx, v);
}

/**
 * toDoubleArray
 */
JSValueRef toDoubleArrayForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    GET_ARRAY(double);
}


/**
 * toLong
 */
JSValueRef toLongForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(long);
    GET_NUMBER(0,index);
    long v = value[(size_t)index];
    return JSValueMakeNumber(ctx, v);
}

/**
 * toLongArray
 */
JSValueRef toLongArrayForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    GET_ARRAY(long);
}

/**
 * toLongLong
 */
JSValueRef toLongLongForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(long long);
    GET_NUMBER(0,index);
    long long v = value[(size_t)index];
    return JSValueMakeNumber(ctx, v);
}

/**
 * toShort
 */
JSValueRef toShortForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(short);
    GET_NUMBER(0,index);
    short v = value[(size_t)index];
    return JSValueMakeNumber(ctx, v);
}

/**
 * toShortArray
 */
JSValueRef toShortArrayForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    GET_ARRAY(short);
}

/**
 * toBool
 */
JSValueRef toBoolForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(bool);
    GET_NUMBER(0,index);
    bool v = value[(size_t)index];
    return JSValueMakeBoolean(ctx,v);
}

/**
 * toBoolArray
 */
JSValueRef toBoolArrayForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    GET_ARRAY(bool);
}

/**
 * toChar
 */
JSValueRef toCharForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(char);
    GET_NUMBER(0,index);
    JSChar buf[1];
    buf[0] = (JSChar)value[(size_t)index];
    JSStringRef stringRef = JSStringCreateWithCharacters(buf, 1);
    JSValueRef result = JSValueMakeString(ctx,stringRef);
    JSStringRelease(stringRef);
    return result;
}

/**
 * toCharArray
 */
JSValueRef toCharArrayForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET_ARRAY(char);
    size_t len = buffer->length + 1;
    char *buf = malloc(len);
    strcpy(buf,buffer->buffer);
    buf[len]='\0';
    JSStringRef stringRef = JSStringCreateWithUTF8CString(buf);
    JSValueRef result = JSValueMakeString(ctx,stringRef);
    JSStringRelease(stringRef);
    return result;
}

/**
 * toObject
 */
JSValueRef toObjectForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    if (buffer->type == JSBufferTypeJSValueRef)
    {
        return (JSValueRef)buffer->buffer;
    }
    return JSValueMakeUndefined(ctx);
}

/**
 * isNan
 */
JSValueRef isNaNForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    PRIMITIVE_GET(float);
    return JSValueMakeBoolean(ctx, isnan(value));
}

/**
 * slice
 */
JSValueRef sliceForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    MIN_SIZE(2);
    GET_NUMBER(0,index);
    GET_NUMBER(1,length);
    if (length > buffer->length)
    {
        JSStringRef string = JSStringCreateWithUTF8CString("length requested is greater than internal buffer length");
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
        return JSValueMakeUndefined(ctx);
    }
    if ((int)index >= buffer->length || (int)index < 0)
    {
        JSStringRef string = JSStringCreateWithUTF8CString("index requested is invalid");
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
        return JSValueMakeUndefined(ctx);
    }
    if (buffer->type!=JSBufferTypePointer)
    {
        JSStringRef string = JSStringCreateWithUTF8CString("cannot slice a non-pointer buffer");
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
        return JSValueMakeUndefined(ctx);
    }

    void *memory = malloc(length);
    void *start = &(buffer->buffer[(int)index]);
    memcpy(memory,start,length);
    JSBuffer *newbuffer = malloc(sizeof(JSBuffer));
    newbuffer->buffer = memory;
    newbuffer->length = length;
    newbuffer->type = JSBufferTypePointer;

    return MakeObjectForJSBuffer(ctx,newbuffer);
}

/**
 * reset
 */
JSValueRef resetForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    BUFFER(buffer);
    if (buffer->length)
    {
        if (buffer->type == JSBufferTypePointer)
        {
            free(buffer->buffer);
        }
        buffer->length = sizeof(int);
        buffer->buffer = malloc(buffer->length);
        buffer->type = JSBufferTypePointer;
        memset(buffer->buffer,0,buffer->length);
    }
    return object;
}

JSObjectRef MakeInstance (JSContextRef ctx, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    size_t length = 1;
    if (argumentCount > 0)
    {
        *exception = NULL;
        if (!JSValueIsNumber(ctx,arguments[0]))
        {
            JSStringRef string = JSStringCreateWithUTF8CString("required first argument to be a number which is the size of the buffer requested");
            JSValueRef message = JSValueMakeString(ctx, string);
            JSStringRelease(string);
            *exception = JSObjectMakeError(ctx, 1, &message, 0);
            return NULL;
        }
        length = JSValueToNumber(ctx, arguments[0], exception);
        CHECK_EXCEPTION(NULL);
    }
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    buffer->buffer = malloc(length);
    buffer->length = length;
    buffer->type = JSBufferTypePointer;
    memset(buffer->buffer, 0, length);
    // by default, let's set the value to NAN
    float *p = (float*)buffer->buffer;
    p[0] = NAN;
    JSObjectRef object = MakeObjectForJSBuffer(ctx,buffer);
    return object;
}


/**
 * called to make an instance of the JSBuffer class using the proper
 * constructor and prototype chain.  this is called when you call
 * new JSBuffer()
 */
JSObjectRef MakeInstanceForJSBuffer (JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstance(ctx,argumentCount,arguments,exception);
}

/**
 * called to make an instance of the JSBuffer class using the proper
 * constructor and prototype chain. this is called when you call
 * JSBuffer()
 */
JSValueRef MakeInstanceFromFunctionForJSBuffer (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstance(ctx,argumentCount,arguments,exception);
}

#define SIZE_OF_FUNCTION_DEF(type) \
JSValueRef GetSizeOf##type##ForJSBuffer (JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)\
{\
    return JSValueMakeNumber(ctx,sizeof(type));\
}\

#define STRINGIFY(x) #x

#define SIZE_OF_FUNCTION_DECL(type, name) \
    { "SIZE_OF_" STRINGIFY(name), GetSizeOf##type##ForJSBuffer, 0, kJSPropertyAttributeReadOnly }


SIZE_OF_FUNCTION_DEF(float)
SIZE_OF_FUNCTION_DEF(int)
SIZE_OF_FUNCTION_DEF(char)
SIZE_OF_FUNCTION_DEF(bool)
SIZE_OF_FUNCTION_DEF(double)
SIZE_OF_FUNCTION_DEF(long)
SIZE_OF_FUNCTION_DEF(short)

static JSStaticValue StaticValueArrayForJSBuffer [] = {
    { "length", GetLengthForJSBuffers, 0, kJSPropertyAttributeReadOnly },
    { "NaN", GetNaNForJSBuffers, 0, kJSPropertyAttributeReadOnly },
    SIZE_OF_FUNCTION_DECL(float,FLOAT),
    SIZE_OF_FUNCTION_DECL(int,INT),
    SIZE_OF_FUNCTION_DECL(char,CHAR),
    SIZE_OF_FUNCTION_DECL(bool,BOOL),
    SIZE_OF_FUNCTION_DECL(double,DOUBLE),
    SIZE_OF_FUNCTION_DECL(long,LONG),
    SIZE_OF_FUNCTION_DECL(short,SHORT),
    { 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJSBuffer [] = {
    { "toInt", toIntForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toFloat", toFloatForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toDouble", toDoubleForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toShort", toShortForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toLong", toLongForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toLongLong", toLongLongForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toBool", toBoolForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toChar", toCharForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toObject", toObjectForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },

    { "toIntArray", toIntArrayForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toFloatArray", toFloatArrayForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toDoubleArray", toDoubleArrayForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toShortArray", toShortArrayForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toBoolArray", toBoolArrayForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "toCharArray", toCharArrayForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },

    { "put", putForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putInt", putIntForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putFloat", putFloatForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putDouble", putDoubleForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putShort", putShortForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putLong", putLongForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putLongLong", putLongLongForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putBool", putBoolForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putChar", putCharForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "putString", putStringForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },

    { "duplicate", duplicateForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "slice", sliceForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "isNaN", isNaNForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete },
    { "reset", resetForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete },

    { "release", releaseForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete },
    { "toString", toStringForJSBuffer, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete },
    { 0, 0, 0 }
};


/**
 * called when the JS object is ready to be garbage collected
 */
void FinalizerForJSBuffer (JSObjectRef object)
{
    ReleaseBuffer(object);
}


/**
 * called to get the JSClassRef for JSBuffer class
 */
JSClassRef CreateClassForJSBufferConstructor ()
{
    static bool init;
    if (!init)
    {
        init = true;

        ClassDefinitionForJSBufferConstructor = kJSClassDefinitionEmpty;
        ClassDefinitionForJSBufferConstructor.callAsConstructor = MakeInstanceForJSBuffer;
        ClassDefinitionForJSBufferConstructor.callAsFunction = MakeInstanceFromFunctionForJSBuffer;
        ClassDefinitionForJSBufferConstructor.className = "JSBufferConstructor";


        JSBufferClassDefForConstructor = JSClassCreate(&ClassDefinitionForJSBufferConstructor);

        JSClassRetain(JSBufferClassDefForConstructor);

    }
    return JSBufferClassDefForConstructor;
}

/**
 * called to get the JSClassRef for JSBuffer class
 */
JSClassRef CreateClassForJSBuffer ()
{
    static bool init;
    if (!init)
    {
        init = true;

        ClassDefinitionForJSBuffer = kJSClassDefinitionEmpty;
        ClassDefinitionForJSBuffer.staticValues = StaticValueArrayForJSBuffer;
        ClassDefinitionForJSBuffer.staticFunctions = StaticFunctionArrayForJSBuffer;
        ClassDefinitionForJSBuffer.finalize = FinalizerForJSBuffer;
        ClassDefinitionForJSBuffer.className = "JSBuffer";

        JSBufferClassDef = JSClassCreate(&ClassDefinitionForJSBuffer);

        JSClassRetain(JSBufferClassDef);
    }
    return JSBufferClassDef;
}


/**
 * called to make a native object for JSBuffer. this method must be called instead of
 * normal JSObjectMake in JavaScriptCore so that the correct prototype chain and
 * constructor will be setup.
 */
JSObjectRef MakeObjectForJSBuffer (JSContextRef ctx, JSBuffer *instance)
{
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJSBuffer(), HyperloopMakePrivateObjectForJSBuffer(instance));
    JSObjectRef value = JSObjectMake(ctx, CreateClassForJSBufferConstructor(), 0);

    JSStringRef cproperty = JSStringCreateWithUTF8CString("constructor");
    JSObjectSetProperty(ctx, object, cproperty, value, kJSPropertyAttributeDontEnum, 0);
    JSStringRelease(cproperty);

    JSStringRef nameProperty = JSStringCreateWithUTF8CString("name");
    JSStringRef valueProperty = JSStringCreateWithUTF8CString("JSBuffer");
    JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
    JSObjectSetProperty(ctx, value, nameProperty, valueRef, kJSPropertyAttributeDontEnum, 0);
    JSStringRelease(nameProperty);
    JSStringRelease(valueProperty);

    return object;
}

/**
 * called to make a native object for JSBuffer Constructor. this method must be called instead of
 * normal JSObjectMake in JavaScriptCore so that the correct prototype chain and
 * constructor will be setup.
 */
JSObjectRef MakeObjectForJSBufferConstructor (JSContextRef ctx)
{
    JSClassRef classRef = CreateClassForJSBufferConstructor();
    JSObjectRef object = JSObjectMake(ctx, classRef, 0);

    JSStringRef nameProperty = JSStringCreateWithUTF8CString("name");
    JSStringRef valueProperty = JSStringCreateWithUTF8CString("JSBuffer");
    JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
    JSObjectSetProperty(ctx, object, nameProperty, valueRef, kJSPropertyAttributeDontEnum, 0);
    JSStringRelease(nameProperty);
    JSStringRelease(valueProperty);

    JSObjectRef plainObject = JSObjectMake(ctx,0,0);
    JSStringRef prototypeProperty = JSStringCreateWithUTF8CString("prototype");
    JSObjectSetProperty(ctx, object, prototypeProperty, plainObject, kJSPropertyAttributeDontEnum, 0);
    JSStringRelease(prototypeProperty);

    JSStringRef cproperty = JSStringCreateWithUTF8CString("constructor");
    JSObjectSetProperty(ctx, plainObject, cproperty, object, kJSPropertyAttributeDontEnum, 0);
    JSStringRelease(cproperty);


    return object;
}

/**
 * register JSBuffer into global context. you can call this safely multiple times but it
 * will only register into the global context once.  however, this is currently not safe if
 * you have *multiple* JSContextRef you're trying to use.
 */
void RegisterJSBuffer (JSContextRef ctx, JSObjectRef global)
{
    static bool init;
    if (!init)
    {
        JSStringRef property = JSStringCreateWithUTF8CString("JSBuffer");
        JSObjectRef object = MakeObjectForJSBufferConstructor(ctx);
        JSObjectSetProperty(ctx, global, property, object, kJSPropertyAttributeDontEnum, 0);
        JSStringRelease(property);
        init = true;
    }
}

/**
 * cleanup an allocted JSBuffer *
 */
void DestroyJSBuffer(JSBuffer *buffer)
{
    switch (buffer->type)
    {
        case JSBufferTypePointer:
        {
            free(buffer->buffer);
            break;
        }
        case JSBufferTypeJSValueRef:
        {
            // don't free, it's assigned
            break;
        }
    }
    buffer->buffer = NULL;
    free(buffer);
    buffer=NULL;
}

/**
 * create a JSBuffer* and set it as the private object for objectRef using JSValueRef as its value
 */
void SetJSBufferValue(JSContextRef ctx, JSObjectRef objectRef, JSValueRef sourceRef)
{
    JSBuffer *buffer = (JSBuffer*)HyperloopGetPrivateObjectAsJSBuffer(objectRef);
    if (buffer!=NULL)
    {
        DestroyJSBuffer(buffer);
    }
    buffer = malloc(sizeof(JSBuffer));
    buffer->type = JSBufferTypeJSValueRef;
    buffer->length = malloc_size(sourceRef);
    buffer->buffer = (void*)sourceRef;

   JSPrivateObject *privateObject = HyperloopMakePrivateObjectForJSBuffer(buffer);
   JSObjectSetPrivate(objectRef,privateObject);
}

/**
 * create a JSBuffer* and set it as the private object for objectRef using a void* as the JSBuffer pointer
 */
void SetJSBufferPointer(JSContextRef ctx, JSObjectRef objectRef, void* pointer)
{
    JSBuffer *buffer = (JSBuffer*)HyperloopGetPrivateObjectAsJSBuffer(objectRef);
    if (buffer!=NULL)
    {
        DestroyJSBuffer(buffer);
    }
    buffer = malloc(sizeof(JSBuffer));
    buffer->type = JSBufferTypePointer;
    buffer->length = malloc_size(pointer);
    memcpy(buffer->buffer,pointer,buffer->length);

    JSPrivateObject *privateObject = HyperloopMakePrivateObjectForJSBuffer(buffer);
    JSObjectSetPrivate(objectRef,privateObject);
}
