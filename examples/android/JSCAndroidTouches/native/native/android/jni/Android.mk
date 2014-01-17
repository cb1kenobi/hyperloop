# Copyright (C) 2009 The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := HyperloopJNI
LOCAL_SRC_FILES := ../../HyperloopJNI.c ../../HyperloopJNIExport.c ../../JS_android_util_Log.c ../../JS_java_lang_Object.c ../../JS_java_lang_String.c ../../JS_android_app_Activity.c ../../JS_android_os_Bundle.c ../../JS_android_view_Gravity.c ../../JS_android_graphics_Color.c ../../JS_android_widget_FrameLayout.c ../../JS_android_widget_FrameLayout_LayoutParams.c ../../JS_android_view_View.c ../../JS_android_view_View_OnTouchListener.c ../../JS_android_view_MotionEvent.c ../../JS_EmptyObject.c

LOCAL_SHARED_LIBRARIES := JavaScriptCore_shared
LOCAL_LDLIBS    := -llog -landroid
LOCAL_CFLAGS    := -std=c99

include $(BUILD_SHARED_LIBRARY)

# Remember: The NDK_MODULE_PATH environmental variable must contain the modules directories in the search path.
$(call import-module,BUILD_webkit2)

