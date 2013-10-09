/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "JSBaseTestCase.h"

extern JSObjectRef MakeObjectForJSBuffer (JSContextRef ctx, JSBuffer *instance);


@interface PrimitiveTypesTests : JSBaseTestCase
@end

@implementation PrimitiveTypesTests

extern JSValueRef HyperloopcharToJSValueRef (JSContextRef ctx, char object);
- (void)testcharToJSValue
{
    JSValueRef value = HyperloopcharToJSValueRef(globalContext,'a');
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsString(globalContext, value), @"JSValueRef should have been a string");
    XCTAssertTrue([HyperloopToNSString(globalContext,value) isEqualToString:@"a"], @"JSValueRef should have been 'a'");
}

extern char HyperloopJSValueRefTochar (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testJSValueToChar
{
    JSValueRef value = HyperloopToString(globalContext, @"a");
    JSValueRef exception = NULL;
    bool cleanup = false;
    char result = HyperloopJSValueRefTochar(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result=='a', @"result should have been a, was: %c",result);
}

extern JSValueRef Hyperloopchar_PToJSValueRef (JSContextRef ctx, char * object, size_t len);
- (void)testHyperloopchar__ToJSValueRef
{
    char *abc = "abc";
    JSValueRef value = Hyperloopchar_PToJSValueRef(globalContext, abc, malloc_size(abc));
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = malloc_size(abc);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern char * HyperloopJSValueRefTochar_P (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTochar_P
{
    JSStringRef string = JSStringCreateWithUTF8CString("abc");
    JSValueRef value = JSValueMakeString(globalContext, string);
    JSValueRef exception = NULL;
    bool cleanup = false;
    char *result = HyperloopJSValueRefTochar_P(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(strcmp(result,"abc")==0, @"result should have been 'abc', was: %s",result);
    free(result);
    JSStringRelease(string);
}


extern JSValueRef Hyperloopchar__32_ToJSValueRef (JSContextRef ctx, char* object);
-(void)testHyperloopchar__32_ToJSValueRef
{
    char buf[32];
    sprintf(buf,"%d",123);
    JSValueRef value = Hyperloopchar__32_ToJSValueRef(globalContext,buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue(strcmp(buffer->buffer,"123")==0, @"result should have been '123', was: %s",buffer->buffer);
}

extern char* HyperloopJSValueRefTochar__32_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTochar__32_
{
    JSStringRef string = JSStringCreateWithUTF8CString("123");
    JSValueRef value = JSValueMakeString(globalContext, string);
    JSValueRef exception = NULL;
    bool cleanup = false;
    char *result = HyperloopJSValueRefTochar__32_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(strcmp(result,"123")==0, @"result should have been '123', was: %s",result);
    free(result);
    JSStringRelease(string);
}

extern JSValueRef Hyperloopchar__37_ToJSValueRef (JSContextRef ctx, char* object);
- (void)testHyperloopchar__37_ToJSValueRef
{
    char buf[37];
    sprintf(buf,"%d",123);
    JSValueRef value = Hyperloopchar__37_ToJSValueRef(globalContext,buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue(strcmp(buffer->buffer,"123")==0, @"result should have been '123', was: %s",buffer->buffer);
}

extern char* HyperloopJSValueRefTochar__37_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);

- (void)testHyperloopJSValueRefTochar__37_
{
    JSStringRef string = JSStringCreateWithUTF8CString("123");
    JSValueRef value = JSValueMakeString(globalContext, string);
    JSValueRef exception = NULL;
    bool cleanup = false;
    char *result = HyperloopJSValueRefTochar__37_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(strcmp(result,"123")==0, @"result should have been '123', was: %s",result);
    free(result);
    JSStringRelease(string);
}

extern JSValueRef Hyperloopchar__4096_ToJSValueRef (JSContextRef ctx, char* object);
- (void)testHyperloopchar__4096_ToJSValueRef
{
    char buf[4096];
    sprintf(buf,"%d",123);
    JSValueRef value = Hyperloopchar__4096_ToJSValueRef(globalContext,buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue(strcmp(buffer->buffer,"123")==0, @"result should have been '123', was: %s",buffer->buffer);
}

extern char* HyperloopJSValueRefTochar__4096_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTochar__4096_
{
    JSStringRef string = JSStringCreateWithUTF8CString("123");
    JSValueRef value = JSValueMakeString(globalContext, string);
    JSValueRef exception = NULL;
    bool cleanup = false;
    char *result = HyperloopJSValueRefTochar__4096_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(strcmp(result,"123")==0, @"result should have been '123', was: %s",result);
    free(result);
    JSStringRelease(string);
}

extern JSValueRef Hyperloopchar__512_ToJSValueRef (JSContextRef ctx, char* object);
- (void)testHyperloopchar__512_ToJSValueRef
{
    char buf[512];
    sprintf(buf,"%d",123);
    JSValueRef value = Hyperloopchar__512_ToJSValueRef(globalContext,buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue(strcmp(buffer->buffer,"123")==0, @"result should have been '123', was: %s",buffer->buffer);
}

extern char* HyperloopJSValueRefTochar__512_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTochar__512_
{
    JSStringRef string = JSStringCreateWithUTF8CString("123");
    JSValueRef value = JSValueMakeString(globalContext, string);
    JSValueRef exception = NULL;
    bool cleanup = false;
    char *result = HyperloopJSValueRefTochar__512_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(strcmp(result,"123")==0, @"result should have been '123', was: %s",result);
    free(result);
    JSStringRelease(string);
}

extern JSValueRef HyperloopdoubleToJSValueRef (JSContextRef ctx, double object);
- (void)testHyperloopdoubleToJSValueRef
{
    double d = 123;
    JSValueRef value = HyperloopdoubleToJSValueRef(globalContext,d);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext, value), @"should have been number type");
    XCTAssertTrue(JSValueToNumber(globalContext, value, 0)==123, @"should have been '123', was: %f",JSValueToNumber(globalContext, value, 0));
}

extern double HyperloopJSValueRefTodouble (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTodouble
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    double result = HyperloopJSValueRefTodouble(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %f",result);
}

extern JSValueRef HyperloopfloatToJSValueRef (JSContextRef ctx, float object);
- (void)testHyperloopfloatToJSValueRef
{
    float f = 123.0f;
    JSValueRef value = HyperloopfloatToJSValueRef(globalContext,f);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext, value), @"should have been number type");
    XCTAssertTrue(JSValueToNumber(globalContext, value, 0)==123.0f, @"should have been '123.0', was: %f",JSValueToNumber(globalContext, value, 0));
}

extern float HyperloopJSValueRefTofloat (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTofloat
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    float result = HyperloopJSValueRefTofloat(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %f",result);
}

extern JSValueRef Hyperloopint_PToJSValueRef (JSContextRef ctx, int * object, size_t length);
- (void)testHyperloopint_PToJSValueRef
{
    int *i = malloc(sizeof(int)*1);
    i[0]=123;
    JSValueRef value = Hyperloopint_PToJSValueRef(globalContext,i,malloc_size(i));
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = malloc_size(i);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((int)((int*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(int)((int*)buffer->buffer)[0]);
}

extern int * HyperloopJSValueRefToint_P (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToint_P
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    int *i = malloc(sizeof(int)*1);
    i[0]=123;
    buffer->length = sizeof(i);
    buffer->buffer = i;
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    int *result = HyperloopJSValueRefToint_P(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    HyperloopDestroyPrivateObject(value);
}

extern JSValueRef HyperloopintToJSValueRef (JSContextRef ctx, int object);
- (void)testHyperloopintToJSValueRef
{
    int i = 123;
    JSValueRef value = HyperloopintToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext,value), @"value should have been a number");
    XCTAssertTrue(JSValueToNumber(globalContext,value,0)==123, @"value should have been '123', was: %d",(int)JSValueToNumber(globalContext, value,0));
}

extern int HyperloopJSValueRefToint (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToint
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    int result = HyperloopJSValueRefToint(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been true");
    XCTAssertTrue(result==123, @"result should have been '123', was: %d",result);
}

extern JSValueRef Hyperloopint___ToJSValueRef (JSContextRef ctx, int* object, size_t length);
- (void)testHyperloopint___ToJSValueRef
{
    int i[] = {123};
    JSValueRef value = Hyperloopint___ToJSValueRef(globalContext,i,sizeof(i));
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(i);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((int)((int*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(int)((int*)buffer->buffer)[0]);
}

extern int* HyperloopJSValueRefToint___ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToint___
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    int i[] = {123};
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    int *result = HyperloopJSValueRefToint___(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopint__1024_ToJSValueRef (JSContextRef ctx, int* object);
- (void)testHyperloopint__1024_ToJSValueRef
{
    int *i = malloc(sizeof(int)*1024);
    i[0] = 123;
    JSValueRef value = Hyperloopint__1024_ToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(int)*1024;
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((int)((int*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(int)((int*)buffer->buffer)[0]);
    free(i);
}

extern int* HyperloopJSValueRefToint__1024_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToint__1024_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    int i[1024];
    i[0]=123;
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    int *result = HyperloopJSValueRefToint__1024_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopint__18_ToJSValueRef (JSContextRef ctx, int* object);
- (void)testHyperloopint__18_ToJSValueRef
{
    int *i = malloc(sizeof(int)*18);
    i[0] = 123;
    JSValueRef value = Hyperloopint__18_ToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(int)*18;
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((int)((int*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(int)((int*)buffer->buffer)[0]);
    free(i);
}

extern int* HyperloopJSValueRefToint__18_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToint__18_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    int i[18];
    i[0]=123;
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    int *result = HyperloopJSValueRefToint__18_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopint__19_ToJSValueRef (JSContextRef ctx, int* object);
- (void)testHyperloopint__19_ToJSValueRef
{
    int *i = malloc(sizeof(int)*19);
    i[0] = 123;
    JSValueRef value = Hyperloopint__19_ToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(int)*19;
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((int)((int*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(int)((int*)buffer->buffer)[0]);
    free(i);
}

extern int* HyperloopJSValueRefToint__19_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToint__19_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    int i[19];
    i[0]=123;
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    int *result = HyperloopJSValueRefToint__19_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopinteger_t_PToJSValueRef (JSContextRef ctx, integer_t * object, size_t length);
- (void)testHyperloopinteger_t_PToJSValueRef
{
    integer_t *i = malloc(sizeof(integer_t)*1);
    i[0] = 123;
    JSValueRef value = Hyperloopinteger_t_PToJSValueRef(globalContext,i, malloc_size(i));
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = malloc_size(i);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((integer_t)((integer_t*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(integer_t)((integer_t*)buffer->buffer)[0]);
    free(i);
}

extern integer_t * HyperloopJSValueRefTointeger_t_P (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTointeger_t_P
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    integer_t i[1];
    i[0]=123;
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    int *result = HyperloopJSValueRefTointeger_t_P(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
}

extern JSValueRef Hyperloopinteger_t_1024_ToJSValueRef (JSContextRef ctx, integer_t* object);
- (void)testHyperloopinteger_t_1024_ToJSValueRef
{
    integer_t *i = malloc(sizeof(integer_t)*1024);
    i[0] = 123;
    JSValueRef value = Hyperloopinteger_t_1024_ToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(integer_t) * 1024;
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((integer_t)((integer_t*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(integer_t)((integer_t*)buffer->buffer)[0]);
    free(i);
}

extern integer_t* HyperloopJSValueRefTointeger_t_1024_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTointeger_t_1024_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    integer_t i[1];
    i[0]=123;
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    integer_t *result = HyperloopJSValueRefTointeger_t_1024_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been true");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperlooplong_longToJSValueRef (JSContextRef ctx, long long object);
- (void)testHyperlooplong_longToJSValueRef
{
    long long i = 123;
    JSValueRef value = Hyperlooplong_longToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext,value), @"value should have been a number");
    XCTAssertTrue(JSValueToNumber(globalContext,value,0)==123, @"value should have been '123', was: %d",(int)JSValueToNumber(globalContext, value,0));
}

extern long long HyperloopJSValueRefTolong_long (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTolong_long
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    long long result = HyperloopJSValueRefTolong_long(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %lld",result);
}

extern JSValueRef HyperlooplongToJSValueRef (JSContextRef ctx, long object);
- (void)testHyperlooplongToJSValueRef
{
    long i = 123;
    JSValueRef value = HyperlooplongToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext,value), @"value should have been a number");
    XCTAssertTrue(JSValueToNumber(globalContext,value,0)==123, @"value should have been '123', was: %ld",(long)JSValueToNumber(globalContext, value,0));
}

extern long HyperloopJSValueRefTolong (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTolong
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123L);
    JSValueRef exception = NULL;
    bool cleanup = false;
    long result = HyperloopJSValueRefTolong(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %ld",result);
}

extern JSValueRef HyperloopshortToJSValueRef (JSContextRef ctx, short object);
- (void)testHyperloopshortToJSValueRef
{
    long i = 123;
    JSValueRef value = HyperlooplongToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext,value), @"value should have been a number");
    XCTAssertTrue(JSValueToNumber(globalContext,value,0)==123, @"value should have been '123', was: %ld",(long)JSValueToNumber(globalContext, value,0));
}

extern short HyperloopJSValueRefToshort (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToshort
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    short result = HyperloopJSValueRefToshort(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %hd",result);
}
/*

extern JSValueRef HyperloopShortFixed__ToJSValueRef (JSContextRef ctx, ShortFixed * object);
- (void)testHyperloopShortFixed__ToJSValueRef
{
    ShortFixed *i = malloc(sizeof(ShortFixed)*1);
    i[0] = 123;
    JSValueRef value = HyperloopShortFixed__ToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(i);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((ShortFixed)((ShortFixed*)buffer->buffer)[0]==123, @"result should not have been 123, was: %d",(ShortFixed)((ShortFixed*)buffer->buffer)[0]);
    free(i);
}

extern ShortFixed * HyperloopJSValueRefToShortFixed__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToShortFixed__
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    ShortFixed i[1];
    i[0]=123;
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    ShortFixed *result = HyperloopJSValueRefToShortFixed__(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==123, @"result should have been '123', was: %d",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
}
*/
extern JSValueRef Hyperloopsigned_charToJSValueRef (JSContextRef ctx, signed char object);
- (void)testHyperloopsigned_charToJSValueRef
{
    JSValueRef value = Hyperloopsigned_charToJSValueRef(globalContext,'a');
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsString(globalContext, value), @"JSValueRef should have been a string");
    XCTAssertTrue([HyperloopToNSString(globalContext,value) isEqualToString:@"a"], @"JSValueRef should have been 'a'");
}

extern signed char HyperloopJSValueRefTosigned_char (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTosigned_char
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    signed char i[1];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    signed char result = HyperloopJSValueRefTosigned_char(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result=='a', @"result should have been 'a', was: %d",result);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
}

extern JSValueRef Hyperloopunichar_PToJSValueRef (JSContextRef ctx, UniChar * object, size_t len);
- (void)testHyperloopunichar_PToJSValueRef
{
    UniChar *i = malloc(sizeof(UniChar)*1);
    i[0] = 0x263A; //☺
    JSValueRef value = Hyperloopunichar_PToJSValueRef(globalContext,i,malloc_size(i));
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = malloc_size(i);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((UniChar)((UniChar*)buffer->buffer)[0]==0x263A, @"result should not have been 0x263A, was: 0x%X",(UniChar)((UniChar*)buffer->buffer)[0]);
    free(i);
}


extern UniChar * HyperloopJSValueRefTounichar_P (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounichar_P
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    UniChar i[1];
    i[0]=0x263A; //☺
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    UniChar *result = HyperloopJSValueRefTounichar_P(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==0x263A, @"result should have been '☺', was: %d",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
}

/*
extern JSValueRef HyperloopUniCharCount__ToJSValueRef (JSContextRef ctx, UniCharCount * object);
- (void)testHyperloopUniCharCount__ToJSValueRef
{
    UniCharCount *i = malloc(sizeof(UniCharCount)*1);
    i[0] = 1L;
    JSValueRef value = HyperloopUniCharCount__ToJSValueRef(globalContext,i);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(i);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len,(int)buffer->length);
    XCTAssertTrue((UniCharCount)((UniCharCount*)buffer->buffer)[0]==1L, @"result should not have been 1L, was: %ld",(UniCharCount)((UniCharCount*)buffer->buffer)[0]);
    free(i);
}

extern UniCharCount * HyperloopJSValueRefToUniCharCount__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefToUniCharCount__
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    UniCharCount i[1];
    i[0]=1;
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    UniCharCount *result = HyperloopJSValueRefToUniCharCount__(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should not have been NULL");
    XCTAssertTrue(result[0]==1, @"result should have been '1', was: %ld",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
}
*/

extern JSValueRef Hyperloopunsigned_charToJSValueRef (JSContextRef ctx, unsigned char object);
- (void)testHyperloopunsigned_charToJSValueRef
{
    JSValueRef value = Hyperloopunsigned_charToJSValueRef(globalContext,'a');
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsString(globalContext, value), @"JSValueRef should have been a string");
    XCTAssertTrue([HyperloopToNSString(globalContext,value) isEqualToString:@"a"], @"JSValueRef should have been 'a'");
}

extern unsigned char HyperloopJSValueRefTounsigned_char (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[1];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char result = HyperloopJSValueRefTounsigned_char(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result=='a', @"result should have been 'a', was: %c",result);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
}

extern JSValueRef Hyperloopunsigned_char_PToJSValueRef (JSContextRef ctx, unsigned char * object, size_t length);
- (void)testHyperloopunsigned_char_PToJSValueRef
{
    char *abc = "abc";
    JSValueRef value = Hyperloopunsigned_char_PToJSValueRef(globalContext, (unsigned char*)abc, malloc_size(abc));
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = malloc_size(abc);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char * HyperloopJSValueRefTounsigned_char_P (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char_P
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[1];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char_P(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
}

/*
extern JSValueRef Hyperloopunsigned_char__16_ToJSValueRef (JSContextRef ctx, unsigned char* object);
- (void)testHyperloopunsigned_char__16_ToJSValueRef
{
    unsigned char buf[16] = {'a','b','c'};
    JSValueRef value = Hyperloopunsigned_char__16_ToJSValueRef(globalContext, (unsigned char*)buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char* HyperloopJSValueRefTounsigned_char__16_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char__16_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[16];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char__16_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopunsigned_char__256_ToJSValueRef (JSContextRef ctx, unsigned char* object);
- (void)testHyperloopunsigned_char__256_ToJSValueRef
{
    unsigned char buf[256] = {'a','b','c'};
    JSValueRef value = Hyperloopunsigned_char__256_ToJSValueRef(globalContext, (unsigned char*)buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char* HyperloopJSValueRefTounsigned_char__256_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char__256_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[256];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char__256_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopunsigned_char__28_ToJSValueRef (JSContextRef ctx, unsigned char* object);
- (void)testHyperloopunsigned_char__28_ToJSValueRef
{
    unsigned char buf[28] = {'a','b','c'};
    JSValueRef value = Hyperloopunsigned_char__28_ToJSValueRef(globalContext, (unsigned char*)buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char* HyperloopJSValueRefTounsigned_char__28_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char__28_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[28];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char__28_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopunsigned_char__32_ToJSValueRef (JSContextRef ctx, unsigned char* object);
- (void)testHyperloopunsigned_char__32_ToJSValueRef
{
    unsigned char buf[32] = {'a','b','c'};
    JSValueRef value = Hyperloopunsigned_char__32_ToJSValueRef(globalContext, (unsigned char*)buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char* HyperloopJSValueRefTounsigned_char__32_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char__32_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[32];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char__32_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopunsigned_char__33_ToJSValueRef (JSContextRef ctx, unsigned char* object);
- (void)testHyperloopunsigned_char__33_ToJSValueRef
{
    unsigned char buf[33] = {'a','b','c'};
    JSValueRef value = Hyperloopunsigned_char__33_ToJSValueRef(globalContext, (unsigned char*)buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char* HyperloopJSValueRefTounsigned_char__33_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char__33_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[33];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char__33_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopunsigned_char__34_ToJSValueRef (JSContextRef ctx, unsigned char* object);
- (void)testHyperloopunsigned_char__34_ToJSValueRef
{
    unsigned char buf[34] = {'a','b','c'};
    JSValueRef value = Hyperloopunsigned_char__34_ToJSValueRef(globalContext, (unsigned char*)buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char* HyperloopJSValueRefTounsigned_char__34_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char__34_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[34];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char__34_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}

extern JSValueRef Hyperloopunsigned_char__64_ToJSValueRef (JSContextRef ctx, unsigned char* object);
- (void)testHyperloopunsigned_char__64_ToJSValueRef
{
    unsigned char buf[64] = {'a','b','c'};
    JSValueRef value = Hyperloopunsigned_char__64_ToJSValueRef(globalContext, (unsigned char*)buf);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    JSObjectRef object = JSValueToObject(globalContext, value, NULL);
    XCTAssertTrue(HyperloopPrivateObjectIsType(object, JSPrivateObjectTypeJSBuffer),@"object should have been JSBuffer");
    JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object);
    XCTAssertTrue(buffer!=NULL, @"buffer should have not been NULL");
    size_t len = sizeof(buf);
    XCTAssertTrue(buffer->length == len, @"buffer length should have been %d, was: %d", (int)len, (int)buffer->length);
}

extern unsigned char* HyperloopJSValueRefTounsigned_char__64_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_char__64_
{
    JSBuffer *buffer = malloc(sizeof(JSBuffer));
    unsigned char i[64];
    i[0]='a';
    buffer->length = sizeof(i);
    buffer->buffer = malloc(sizeof(i));
    memcpy(buffer->buffer,i,sizeof(i));
    JSObjectRef value = MakeObjectForJSBuffer(globalContext,buffer);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned char *result = HyperloopJSValueRefTounsigned_char__64_(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==true, @"cleanup should have been false");
    XCTAssertTrue(result!=NULL, @"result should should not have been NULL");
    XCTAssertTrue(result[0]=='a', @"result should have been 'a', was: %c",result[0]);
    XCTAssertTrue(buffer->length==sizeof(i), @"result should have been '%d', was: %d",(int)sizeof(i),buffer->length);
    HyperloopDestroyPrivateObject(value);
    free(result);
}
 */

extern JSValueRef Hyperloopunsigned_intToJSValueRef (JSContextRef ctx, unsigned int object);
- (void)testHyperloopunsigned_intToJSValueRef
{
    unsigned int d = 123;
    JSValueRef value = Hyperloopunsigned_intToJSValueRef(globalContext,d);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext, value), @"should have been number type");
    XCTAssertTrue(JSValueToNumber(globalContext, value, 0)==123, @"should have been '123', was: %f",JSValueToNumber(globalContext, value, 0));
}

extern unsigned int HyperloopJSValueRefTounsigned_int (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_int
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned int result = HyperloopJSValueRefTounsigned_int(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %u",result);
}

extern JSValueRef Hyperloopunsigned_long_longToJSValueRef (JSContextRef ctx, unsigned long long object);
- (void)testHyperloopunsigned_long_longToJSValueRef
{
    unsigned long long d = 123;
    JSValueRef value = Hyperloopunsigned_long_longToJSValueRef(globalContext,d);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext, value), @"should have been number type");
    XCTAssertTrue(JSValueToNumber(globalContext, value, 0)==123, @"should have been '123', was: %f",JSValueToNumber(globalContext, value, 0));
}

extern unsigned long long HyperloopJSValueRefTounsigned_long_long (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_long_long
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned long long result = HyperloopJSValueRefTounsigned_long_long(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %llu",result);
}

extern JSValueRef Hyperloopunsigned_longToJSValueRef (JSContextRef ctx, unsigned long object);
- (void)testHyperloopunsigned_longToJSValueRef
{
    unsigned long d = 123;
    JSValueRef value = Hyperloopunsigned_longToJSValueRef(globalContext,d);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext, value), @"should have been number type");
    XCTAssertTrue(JSValueToNumber(globalContext, value, 0)==123, @"should have been '123', was: %f",JSValueToNumber(globalContext, value, 0));
}

extern unsigned long HyperloopJSValueRefTounsigned_long (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_long
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned long result = HyperloopJSValueRefTounsigned_long(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %lu",result);
}

extern JSValueRef Hyperloopunsigned_shortToJSValueRef (JSContextRef ctx, unsigned short object);
- (void)testHyperloopunsigned_shortToJSValueRef
{
    unsigned short d = 123;
    JSValueRef value = Hyperloopunsigned_shortToJSValueRef(globalContext,d);
    XCTAssertTrue(value!=NULL, @"JSValueRef was NULL");
    XCTAssertTrue(JSValueIsNumber(globalContext, value), @"should have been number type");
    XCTAssertTrue(JSValueToNumber(globalContext, value, 0)==123, @"should have been '123', was: %f",JSValueToNumber(globalContext, value, 0));
}

extern unsigned short HyperloopJSValueRefTounsigned_short (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);
- (void)testHyperloopJSValueRefTounsigned_short
{
    JSValueRef value = JSValueMakeNumber(globalContext, 123);
    JSValueRef exception = NULL;
    bool cleanup = false;
    unsigned short result = HyperloopJSValueRefTounsigned_short(globalContext, value, &exception, &cleanup);
    XCTAssertTrue(exception==NULL, @"exception should have been NULL");
    XCTAssertTrue(cleanup==false, @"cleanup should have been false");
    XCTAssertTrue(result==123, @"result should not have been 123, was: %hu",result);
}

extern JSValueRef HyperloopBOOLToJSValueRef(JSContextRef, BOOL animated);
- (void)testHyperloopBOOLToJSValueRef
{
    JSValueRef animated = HyperloopBOOLToJSValueRef(globalContext,YES);
    XCTAssertTrue(JSValueToBoolean(globalContext, animated), @"should have been true");
}



@end
