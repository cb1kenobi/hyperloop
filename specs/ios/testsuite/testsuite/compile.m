/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert char * to JSValueRef
 */
JSValueRef Hyperloopchar__ToJSValueRef (JSContextRef ctx, char * object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to char *
 */
char * HyperloopJSValueRefTochar__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	char * result = NULL;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		result = (char *)malloc(sizeof(char)*size);
		*cleanup = true;
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(char) * 1);
			}
			else
			{
				result = (char *)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert char to JSValueRef
 */
JSValueRef HyperloopcharToJSValueRef (JSContextRef ctx, char object)
{
	JSChar chars[1];
	chars[0]=(JSChar)object;
	JSStringRef string = JSStringCreateWithCharacters((const JSChar*)&chars,1);
	JSValueRef result = JSValueMakeString(ctx, string);
	JSStringRelease(string);
	return result;
}

/**
 * convert JSValueRef to char
 */
char HyperloopJSValueRefTochar (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	char result = '\0';
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		const JSChar *ch = JSStringGetCharactersPtr(str);
		result = (char)ch[0];
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (char)((char*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert char [32] to JSValueRef
 */
JSValueRef Hyperloopchar__32_ToJSValueRef (JSContextRef ctx, char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 32;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to char [32]
 */
char* HyperloopJSValueRefTochar__32_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	char *result = malloc(sizeof(char) * 32);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 32)
		{
			size = 32;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(char) * 32);
			}
			else
			{
				result = (char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert char [37] to JSValueRef
 */
JSValueRef Hyperloopchar__37_ToJSValueRef (JSContextRef ctx, char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 37;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to char [37]
 */
char* HyperloopJSValueRefTochar__37_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	char *result = malloc(sizeof(char) * 37);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 37)
		{
			size = 37;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(char) * 37);
			}
			else
			{
				result = (char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert char [4096] to JSValueRef
 */
JSValueRef Hyperloopchar__4096_ToJSValueRef (JSContextRef ctx, char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 4096;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to char [4096]
 */
char* HyperloopJSValueRefTochar__4096_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	char *result = malloc(sizeof(char) * 4096);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 4096)
		{
			size = 4096;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(char) * 4096);
			}
			else
			{
				result = (char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert char [512] to JSValueRef
 */
JSValueRef Hyperloopchar__512_ToJSValueRef (JSContextRef ctx, char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 512;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to char [512]
 */
char* HyperloopJSValueRefTochar__512_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	char *result = malloc(sizeof(char) * 512);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 512)
		{
			size = 512;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(char) * 512);
			}
			else
			{
				result = (char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert double to JSValueRef
 */
JSValueRef HyperloopdoubleToJSValueRef (JSContextRef ctx, double object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to double
 */
double HyperloopJSValueRefTodouble (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	double result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (double)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (double)((double*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert float to JSValueRef
 */
JSValueRef HyperloopfloatToJSValueRef (JSContextRef ctx, float object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to float
 */
float HyperloopJSValueRefTofloat (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	float result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (float)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (float)((float*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert int * to JSValueRef
 */
JSValueRef Hyperloopint__ToJSValueRef (JSContextRef ctx, int * object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to int *
 */
int * HyperloopJSValueRefToint__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	int * result = 0;
	if (JSValueIsNumber(ctx,object))
	{
		result = malloc(sizeof(int));
		*cleanup=true;
		result[0] = (int)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(int) * 1);
			}
			else 
			{
				result = (int *)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert int to JSValueRef
 */
JSValueRef HyperloopintToJSValueRef (JSContextRef ctx, int object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to int
 */
int HyperloopJSValueRefToint (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	int result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (int)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (int)((int*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert int [] to JSValueRef
 */
JSValueRef Hyperloopint___ToJSValueRef (JSContextRef ctx, int* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to int []
 */
int* HyperloopJSValueRefToint___ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	int *result = malloc(sizeof(int) * 1);
	*cleanup = true;
	if (JSValueIsNumber(ctx,object))
	{
		result[0] = (int)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(int) * 1);
			}
			else 
			{
				result = (int*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert int [1024] to JSValueRef
 */
JSValueRef Hyperloopint__1024_ToJSValueRef (JSContextRef ctx, int* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 1024;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to int [1024]
 */
int* HyperloopJSValueRefToint__1024_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	int *result = malloc(sizeof(int) * 1024);
	*cleanup = true;
	if (JSValueIsNumber(ctx,object))
	{
		result[0] = (int)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(int) * 1024);
			}
			else 
			{
				result = (int*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert int [18] to JSValueRef
 */
JSValueRef Hyperloopint__18_ToJSValueRef (JSContextRef ctx, int* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 18;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to int [18]
 */
int* HyperloopJSValueRefToint__18_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	int *result = malloc(sizeof(int) * 18);
	*cleanup = true;
	if (JSValueIsNumber(ctx,object))
	{
		result[0] = (int)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(int) * 18);
			}
			else 
			{
				result = (int*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert int [19] to JSValueRef
 */
JSValueRef Hyperloopint__19_ToJSValueRef (JSContextRef ctx, int* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 19;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to int [19]
 */
int* HyperloopJSValueRefToint__19_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	int *result = malloc(sizeof(int) * 19);
	*cleanup = true;
	if (JSValueIsNumber(ctx,object))
	{
		result[0] = (int)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(int) * 19);
			}
			else 
			{
				result = (int*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert integer_t * to JSValueRef
 */
JSValueRef Hyperloopinteger_t__ToJSValueRef (JSContextRef ctx, integer_t * object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to integer_t *
 */
integer_t * HyperloopJSValueRefTointeger_t__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	integer_t * result = 0;
	if (JSValueIsNumber(ctx,object))
	{
		result = malloc(sizeof(integer_t));
		*cleanup=true;
		result[0] = (integer_t)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(integer_t) * 1);
			}
			else 
			{
				result = (integer_t *)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert integer_t [1024] to JSValueRef
 */
JSValueRef Hyperloopinteger_t__1024_ToJSValueRef (JSContextRef ctx, integer_t* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 1024;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to integer_t [1024]
 */
integer_t* HyperloopJSValueRefTointeger_t__1024_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	integer_t *result = malloc(sizeof(integer_t) * 1024);
	*cleanup = true;
	if (JSValueIsNumber(ctx,object))
	{
		result[0] = (integer_t)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(integer_t) * 1024);
			}
			else 
			{
				result = (integer_t*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert long long to JSValueRef
 */
JSValueRef Hyperlooplong_longToJSValueRef (JSContextRef ctx, long long object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to long long
 */
long long HyperloopJSValueRefTolong_long (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	long long result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (long long)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (long long)((long long*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert long to JSValueRef
 */
JSValueRef HyperlooplongToJSValueRef (JSContextRef ctx, long object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to long
 */
long HyperloopJSValueRefTolong (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	long result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (long)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (long)((long*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert short to JSValueRef
 */
JSValueRef HyperloopshortToJSValueRef (JSContextRef ctx, short object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to short
 */
short HyperloopJSValueRefToshort (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	short result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (short)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (short)((short*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert ShortFixed * to JSValueRef
 */
JSValueRef HyperloopShortFixed__ToJSValueRef (JSContextRef ctx, ShortFixed * object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to ShortFixed *
 */
ShortFixed * HyperloopJSValueRefToShortFixed__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	ShortFixed * result = 0;
	if (JSValueIsNumber(ctx,object))
	{
		result = malloc(sizeof(ShortFixed));
		*cleanup=true;
		result[0] = (ShortFixed)JSValueToNumber(ctx,object,exception);	
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup)
			{
				memcpy(result, buffer->buffer, sizeof(ShortFixed) * 1);
			}
			else 
			{
				result = (ShortFixed *)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert signed char to JSValueRef
 */
JSValueRef Hyperloopsigned_charToJSValueRef (JSContextRef ctx, signed char object)
{
	JSChar chars[1];
	chars[0]=(JSChar)object;
	JSStringRef string = JSStringCreateWithCharacters((const JSChar*)&chars,1);
	JSValueRef result = JSValueMakeString(ctx, string);
	JSStringRelease(string);
	return result;
}

/**
 * convert JSValueRef to signed char
 */
signed char HyperloopJSValueRefTosigned_char (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	signed char result = 0;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		const JSChar *ch = JSStringGetCharactersPtr(str);
		result = (signed char)ch[0];
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (signed char)((signed char*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert UniChar * to JSValueRef
 */
JSValueRef HyperloopUniChar__ToJSValueRef (JSContextRef ctx, UniChar * object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to UniChar *
 */
UniChar * HyperloopJSValueRefToUniChar__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	UniChar * result = 0;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		result = (UniChar *)malloc(sizeof(char)*size);
		*cleanup = true;
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(UniChar) * 1);
			}
			else
			{
				result = (UniChar *)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert UniCharCount * to JSValueRef
 */
JSValueRef HyperloopUniCharCount__ToJSValueRef (JSContextRef ctx, UniCharCount * object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to UniCharCount *
 */
UniCharCount * HyperloopJSValueRefToUniCharCount__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	UniCharCount * result = 0;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		result = (UniCharCount *)malloc(sizeof(char)*size);
		*cleanup = true;
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(UniCharCount) * 1);
			}
			else
			{
				result = (UniCharCount *)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char to JSValueRef
 */
JSValueRef Hyperloopunsigned_charToJSValueRef (JSContextRef ctx, unsigned char object)
{
	JSChar chars[1];
	chars[0]=(JSChar)object;
	JSStringRef string = JSStringCreateWithCharacters((const JSChar*)&chars,1);
	JSValueRef result = JSValueMakeString(ctx, string);
	JSStringRelease(string);
	return result;
}

/**
 * convert JSValueRef to unsigned char
 */
unsigned char HyperloopJSValueRefTounsigned_char (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char result = 0;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		const JSChar *ch = JSStringGetCharactersPtr(str);
		result = (unsigned char)ch[0];
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (unsigned char)((unsigned char*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char * to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__ToJSValueRef (JSContextRef ctx, unsigned char * object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = sizeof(object);
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char *
 */
unsigned char * HyperloopJSValueRefTounsigned_char__ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char * result = NULL;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		result = (unsigned char *)malloc(sizeof(char)*size);
		*cleanup = true;
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 1);
			}
			else
			{
				result = (unsigned char *)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char [16] to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__16_ToJSValueRef (JSContextRef ctx, unsigned char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 16;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char [16]
 */
unsigned char* HyperloopJSValueRefTounsigned_char__16_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char *result = malloc(sizeof(unsigned char) * 16);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 16)
		{
			size = 16;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 16);
			}
			else
			{
				result = (unsigned char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char [256] to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__256_ToJSValueRef (JSContextRef ctx, unsigned char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 256;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char [256]
 */
unsigned char* HyperloopJSValueRefTounsigned_char__256_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char *result = malloc(sizeof(unsigned char) * 256);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 256)
		{
			size = 256;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 256);
			}
			else
			{
				result = (unsigned char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char [28] to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__28_ToJSValueRef (JSContextRef ctx, unsigned char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 28;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char [28]
 */
unsigned char* HyperloopJSValueRefTounsigned_char__28_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char *result = malloc(sizeof(unsigned char) * 28);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 28)
		{
			size = 28;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 28);
			}
			else
			{
				result = (unsigned char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char [32] to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__32_ToJSValueRef (JSContextRef ctx, unsigned char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 32;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char [32]
 */
unsigned char* HyperloopJSValueRefTounsigned_char__32_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char *result = malloc(sizeof(unsigned char) * 32);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 32)
		{
			size = 32;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 32);
			}
			else
			{
				result = (unsigned char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char [33] to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__33_ToJSValueRef (JSContextRef ctx, unsigned char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 33;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char [33]
 */
unsigned char* HyperloopJSValueRefTounsigned_char__33_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char *result = malloc(sizeof(unsigned char) * 33);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 33)
		{
			size = 33;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 33);
			}
			else
			{
				result = (unsigned char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char [34] to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__34_ToJSValueRef (JSContextRef ctx, unsigned char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 34;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char [34]
 */
unsigned char* HyperloopJSValueRefTounsigned_char__34_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char *result = malloc(sizeof(unsigned char) * 34);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 34)
		{
			size = 34;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 34);
			}
			else
			{
				result = (unsigned char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned char [64] to JSValueRef
 */
JSValueRef Hyperloopunsigned_char__64_ToJSValueRef (JSContextRef ctx, unsigned char* object)
{
	JSBuffer *buffer = malloc(sizeof(JSBuffer));
	size_t len = 64;
	buffer->length = len;
	buffer->buffer = malloc(len);
	memcpy(buffer->buffer,object,len);
	((unsigned char*)buffer->buffer)[len]='\0';
	JSValueRef result = MakeObjectForJSBuffer(ctx, buffer);
	return result;
}

/**
 * convert JSValueRef to unsigned char [64]
 */
unsigned char* HyperloopJSValueRefTounsigned_char__64_ (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned char *result = malloc(sizeof(unsigned char) * 64);
	*cleanup = true;
	if (JSValueIsString(ctx, object))
	{
		JSStringRef str = JSValueToStringCopy(ctx,object,exception);
		size_t size = JSStringGetMaximumUTF8CStringSize(str);
		if (size > 64)
		{
			size = 64;
		}
		size = JSStringGetUTF8CString(str,(char*)result,size);
		result[size]='\0';
		set = true;
		JSStringRelease(str);
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			if (*cleanup) 
			{
				memcpy(result, buffer->buffer, sizeof(unsigned char) * 64);
			}
			else
			{
				result = (unsigned char*)buffer->buffer;
			}
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
		if ((*cleanup))
		{
			free(result);
			result = NULL;
			*cleanup = false;
		}
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned int to JSValueRef
 */
JSValueRef Hyperloopunsigned_intToJSValueRef (JSContextRef ctx, unsigned int object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to unsigned int
 */
unsigned int HyperloopJSValueRefTounsigned_int (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned int result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (unsigned int)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (unsigned int)((unsigned int*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned long long to JSValueRef
 */
JSValueRef Hyperloopunsigned_long_longToJSValueRef (JSContextRef ctx, unsigned long long object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to unsigned long long
 */
unsigned long long HyperloopJSValueRefTounsigned_long_long (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned long long result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (unsigned long long)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (unsigned long long)((unsigned long long*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned long to JSValueRef
 */
JSValueRef Hyperloopunsigned_longToJSValueRef (JSContextRef ctx, unsigned long object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to unsigned long
 */
unsigned long HyperloopJSValueRefTounsigned_long (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned long result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (unsigned long)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (unsigned long)((unsigned long*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}


#import <hyperloop.h>
@import Foundation;
@import JavaScriptCore;
#import "JSBuffer.h"

/**
 * convert unsigned short to JSValueRef
 */
JSValueRef Hyperloopunsigned_shortToJSValueRef (JSContextRef ctx, unsigned short object)
{
	JSValueRef result = JSValueMakeNumber(ctx, (double)object);
	return result;
}

/**
 * convert JSValueRef to unsigned short
 */
unsigned short HyperloopJSValueRefTounsigned_short (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup)
{
	bool set = false;
	unsigned short result = 0;
	if (JSValueIsNumber(ctx, object)) 
	{
		result = (unsigned short)JSValueToNumber(ctx,object,exception);
		set = true;
	}
	else if (JSValueIsObject(ctx,object))
	{
		JSObjectRef object$o = JSValueToObject(ctx,object,0);
		if (HyperloopPrivateObjectIsType(object$o,JSPrivateObjectTypeJSBuffer))
		{
			JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(object$o);
			result = (unsigned short)((unsigned short*)buffer->buffer)[0];
			set = true;
		}
	}
	if (!set)
	{
		HyperloopMakeException(ctx,"invalid type",exception);
	}
	return result;
}

