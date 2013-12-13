/*
 * Copyright (C) 2009 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
#include <string.h>
#include <jni.h>

#include <sys/types.h> // need for off_t for asset_manager because it looks like r9b broke something.
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <android/log.h>
#include <JavaScriptCore/JSContextRef.h>
#include <JavaScriptCore/JSStringRef.h>

#define LOGD(...) ((void)__android_log_print(ANDROID_LOG_INFO,  "HelloAndroidJavaScriptCore", __VA_ARGS__))
#define LOGE(...) ((void)__android_log_print(ANDROID_LOG_ERROR,  "HelloAndroidJavaScriptCore", __VA_ARGS__))

/* This is a trivial JNI example where we use a native method
 * to return a new VM String. See the corresponding Java source
 * file located at:
 *
 *   apps/samples/hello-jni/project/src/com/example/hellojni/HelloJni.java
 */


static jobject s_proxyObject;
static JavaVM* s_javaVm;

jint JNI_OnLoad(JavaVM* java_vm, void* reserved)
{
	s_javaVm = java_vm;
	return JNI_VERSION_1_6;
}

#if 0
static void MyNDKPlaybackFinishedCallback(ALint which_channel, ALuint al_source, ALmixer_Data* almixer_data, ALboolean finished_naturally, void* user_data)
{

	LOGD("MyNDKPlaybackFinishedCallback on channel:%d source:%d finished_naturally:%d", which_channel, al_source, finished_naturally);

    JNIEnv* env;
	/* For demonstration purposes, call back into Java */

	/* Careful: If ALmixer is compiled with threads, make sure any calls back into Java are thread safe. */
	/* Unfortunately, JNI is making thread handling even more complicated than usual.
	 * If ALmixer is compiled with threads, it invokes callbacks on a ALmixer private background thread.
	 * In this case, we are required to call AttachCurrentThread for Java.
	 * However, there is a case in ALmixer where the callback doesn't happen on the background thread, but the calling thread.
	 * Calling ALmixer_HaltChannel() will trigger the callback on immediately on the thread you called the function on.
	 * (In this program, it is the main thread.)
	 * But JNI will break and crash if you try calling AttachCurrentThread in this case.
	 * So we need to know what thread we are on. If we are on the background thread, we must call AttachCurrentThread.
	 * Otherwise, we need to avoid calling it and use the current "env".
	 */

	 /* There is a little JNI dance you can do to deal with this situation which is shown here.
	 */
    int get_env_stat = (*s_javaVm)->GetEnv(s_javaVm, (void**)&env, JNI_VERSION_1_6);
    if(get_env_stat == JNI_EDETACHED)
	{
		jint attach_status = (*s_javaVm)->AttachCurrentThread(s_javaVm, &env, NULL);
		if(0 != attach_status)
		{
			LOGE("AttachCurrentThread failed"); 
		}
    }
	else if(JNI_OK == get_env_stat)
	{
        // don't need to do anything
    }
	else if (get_env_stat == JNI_EVERSION)
	{
		LOGE("GetEnv: version not supported"); 
    }

	/* Now that we've done the dance, we can actually call into Java now. */
    jclass clazz  = (*env)->GetObjectClass(env, s_proxyObject);
    jmethodID method_id = (*env)->GetMethodID(env, clazz, "HelloAndroidJavaScriptCore_MyJavaPlaybackFinishedCallbackTriggeredFromNDK", "(IIZ)V");
    (*env)->CallVoidMethod(env, s_proxyObject, method_id, which_channel, al_source, finished_naturally);


	/* Clean up: If we Attached the thread, we need to Detach it */
    if(get_env_stat == JNI_EDETACHED)
	{
		(*s_javaVm)->DetachCurrentThread(s_javaVm);
	}
}
#endif

static _Bool RunScript()
{
	JSGlobalContextRef js_context = JSGlobalContextCreate(NULL);
	JSStringRef js_script_string = JSStringCreateWithUTF8CString("2+2;");
    JSStringRef js_file_name = JSStringCreateWithUTF8CString("fakefile.js");
    JSValueRef js_exception = NULL;
	double test_result = 0;

			LOGD("js_context is %x", js_context);

			LOGD("js_script_string is %x", js_script_string);

			
    //JSValueRef js_result = JSEvaluateScript(js_context, js_script_string, NULL, js_file_name, 0, &js_exception);
    JSValueRef js_result = JSEvaluateScript(js_context, js_script_string, NULL, NULL, 0, NULL);
 //   _Bool is_success = js_result && !js_exception;
    _Bool is_success = (js_result != NULL);
			LOGD("js_result is %x", js_result);

//	if(1)
	if(js_result)
	{
		if(JSValueIsNumber(js_context, js_result))
		{
			js_exception = NULL;
			test_result = JSValueToNumber(js_context, js_result, &js_exception);
			LOGD("test result is %lf", test_result);
		}
		else
		{
			LOGE("Assertion error: Did not get a number");
		}
		/*
		
		        JSStringRef js_result_string = JSValueToStringCopy(js_context, js_result, NULL);
 
				size_t bytes_needed = JSStringGetMaximumUTF8CStringSize(js_result_string);
				LOGD("result bytes_needed: %d\n", bytes_needed);
				
				char* c_result_string = (char*)calloc(bytes_needed, sizeof(char));
				JSStringGetUTF8CString(js_result_string, c_result_string, bytes_needed);
				
				LOGD("c_result_string: %s\n", c_result_string);
				free(c_result_string);
				JSStringRelease(js_result_string);
				*/
	}
	else
	{
			LOGE("Evaluate Script failed");
			if(js_exception)
			{
//				JSStringRef js_stack_string = JSStringCreateWithUTF8CString("stack");
//				JSValueRef js_stack = JSObjectGetProperty(js_context, JSValueToObject(js_context, js_exception, NULL), js_stack_string, NULL);
//				JSStringRelease(js_stack_string);

				JSStringRef js_exception_string = JSValueToStringCopy(js_context, js_exception, NULL);

				size_t bytes_needed = JSStringGetMaximumUTF8CStringSize(js_exception_string);
				LOGD("bytes_needed: %d\n", bytes_needed);
				
				char* c_exception_string = (char*)calloc(bytes_needed, sizeof(char));
				JSStringGetUTF8CString(js_exception_string, c_exception_string, bytes_needed);
				
				LOGD("c_exception_string: %s\n", c_exception_string);
				free(c_exception_string);
				JSStringRelease(js_exception_string);

			}		
	}


	JSStringRelease(js_file_name);
	JSStringRelease(js_script_string);

	JSGarbageCollect(js_context);
	JSGlobalContextRelease(js_context);

	return is_success;
}

/* Returns a JSStringRef which must be released by you when done */
static JSStringRef jstringToJSStringRef(JNIEnv* jni_env, jstring original_jstring)
{
	JSStringRef return_jsstringref;
	const char* c_string = (*jni_env)->GetStringUTFChars(jni_env, original_jstring, 0);
	return_jsstringref = JSStringCreateWithUTF8CString(c_string);
	(*jni_env)->ReleaseStringUTFChars(jni_env, original_jstring, c_string);
	return return_jsstringref;
}

static jstring jstringFromJSStringRef(JNIEnv* jni_env, JSStringRef original_jsstringref)
{
	jstring return_jstring;
	size_t bytes_needed = JSStringGetMaximumUTF8CStringSize(original_jsstringref);

	LOGD("result bytes_needed: %d\n", bytes_needed);

	char* c_result_string = (char*)calloc(bytes_needed, sizeof(char));
	JSStringGetUTF8CString(original_jsstringref, c_result_string, bytes_needed);

	LOGD("c_result_string: %s\n", c_result_string);

    return_jstring =  (*jni_env)->NewStringUTF(jni_env, c_result_string);
	free(c_result_string);
	return return_jstring;
}

/* Returns a JSStringRef which must be released by you when done */
static JSStringRef RunScriptAndReturnJSStringRef(JSStringRef js_script_string)
{
	JSGlobalContextRef js_context = JSGlobalContextCreate(NULL);
//	JSStringRef js_script_string = JSStringCreateWithUTF8CString("2+2;");
    JSStringRef js_file_name = JSStringCreateWithUTF8CString("fakefile.js");
    JSValueRef js_exception = NULL;
	JSStringRef js_return_string = NULL;
			LOGD("js_context is %x", js_context);

			LOGD("js_script_string is %x", js_script_string);

			
    JSValueRef js_result = JSEvaluateScript(js_context, js_script_string, NULL, js_file_name, 0, &js_exception);
 //   JSValueRef js_result = JSEvaluateScript(js_context, js_script_string, NULL, NULL, 0, NULL);
	_Bool is_success = js_result && !js_exception;
	LOGD("js_result is %x", js_result);



	if(is_success)
	{
		js_return_string = JSValueToStringCopy(js_context, js_result, NULL);
		size_t bytes_needed = JSStringGetMaximumUTF8CStringSize(js_return_string);
		LOGD("result bytes_needed: %d\n", bytes_needed);

		char* c_result_string = (char*)calloc(bytes_needed, sizeof(char));
		JSStringGetUTF8CString(js_return_string, c_result_string, bytes_needed);

		LOGD("c_result_string: %s\n", c_result_string);
		free(c_result_string);
//		JSStringRelease(js_result_string);
	}
	else
	{
		if(js_exception)
		{
			js_return_string = JSValueToStringCopy(js_context, js_exception, NULL);
		}
		else
		{
			LOGD("JSEvaluateScript() failed, but didn't get an exception???\n");
		}
	}

	JSStringRelease(js_file_name);
//	JSStringRelease(js_script_string);

	JSGarbageCollect(js_context);
	JSGlobalContextRelease(js_context);

	return js_return_string;
}

jboolean Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doInit(JNIEnv* env, jobject thiz, jobject java_asset_manager)
{
	LOGD("Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doInit");

	// I'm not sure if I need to
	AAssetManager* ndk_asset_manager = AAssetManager_fromJava(env, java_asset_manager);
	/* Saving the object instance so it can be used for calling back into Java. 
	 * I think I need to call NewGlobalRef on it because it must live past this function,
	 * otherwise I get the error: 
	 * JNI ERROR (app bug): accessed stale local reference
	 */
	s_proxyObject = (*env)->NewGlobalRef(env, thiz);


	return JNI_TRUE;
}

void Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doPause(JNIEnv* env, jobject thiz)
{
	LOGD("Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doPause");
}

void Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doResume(JNIEnv* env, jobject thiz)
{
	LOGD("Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doResume");
}

void Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doDestroy(JNIEnv* env, jobject thiz)
{
	LOGD("Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doDestroy");

	/* Release the proxy object. */
	(*env)->DeleteGlobalRef(env, s_proxyObject);
	s_proxyObject = NULL;

	LOGD("Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_doDestroy end");

}

jstring Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_evaluateScript(JNIEnv* jni_env, jobject thiz, jstring jstring_script)
{
	JSStringRef jsstringref_script = jstringToJSStringRef(jni_env, jstring_script);

	JSStringRef jsstringref_result = RunScriptAndReturnJSStringRef(jsstringref_script);
	jstring jstring_result = jstringFromJSStringRef(jni_env, jsstringref_result);
	JSStringRelease(jsstringref_script);
	
	return jstring_result;
}

#if 1
void Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_playSound(JNIEnv* env, jobject thiz, jint sound_id)
{
	LOGD("Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_playSound, sound_id:%d", sound_id);
	int which_channel;
	// For laziness, I just interpret integer ids to map to particular sounds.
	switch(sound_id)
	{
		case 1:
			{
				//			which_channel = ALmixer_PlayChannel(-1, s_alertSoundHandle, 0);
				RunScript();
				break;
			}
		case 2:
			{
				//			which_channel = ALmixer_PlayChannel(-1, s_beepSoundHandle, 0);
				break;
			}
		default:
			{
				// Shouldn't hit this case, but the alert sound seems appropriate.
				//			which_channel = ALmixer_PlayChannel(-1, s_alertSoundHandle, 0);
				break;
			}
	}
	/*
	   if(which_channel < 0)
	   {	
		LOGD("Failed to play: %s", ALmixer_GetError());
	}
	LOGD("Java_com_appcelerator_hyperloop_helloandroidjavascriptcore_HelloAndroidJavaScriptCore_playSound ended, which_channel:%d", which_channel);
*/	
}
#endif

