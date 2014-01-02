# JavaScriptCore Unit Test Runner

Unit testing suite for JavaScriptCore on Android

## Requirements

- Android SDK
- libJavaScriptCore.so
- libJavaScriptCoreJNI.so

Make sure you have installed libJavaScriptCore.so and libJavaScriptCoreJNI.so copied into libs/armeabi-v7a. You can build them manually from [JavaScriptCore for Java](https://github.com/appcelerator/webkit/tree/javascriptcore-wp8-test262/Source/JavaScriptCore/API/java).

```
$ ls libs/armeabi-v7a
libJavaScriptCore.so	libJavaScriptCoreJNI.so
```

## How to build and install


```
$ android list targets
```

To find out which SDKs are installed on your system and what the corresponding target number id is.

Assuming you are in the same directory (.) that this README.txt is in, run:

```
$ android update project --target <id> --path .
```

Then you can use the standard ant technique for Android, e.g.

```
$ ant debug
```
or

```
$ ant debug install
```

(the latter if your device is connected and you want to build & install in one shot)