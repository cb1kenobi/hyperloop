# Hyperloop ∞

Hyperloop is a next-generation compiler that converts JavaScript source code into native code for targeting different native OS platforms.

> **THIS IS UNSTABLE, UNRELEASED CODE. DO NOT USE IN PRODUCTION YET.**

## Requirements

Hyperloop requires at least [Node.js](http://nodejs.org/) 0.10.5 and iOS SDK 7.0.  _Currently, hyperloop is only being developed and tested on OSX, however, Windows and Linux will eventually be supported officially._

## Install

To install hyperloop, using node npm:

```bash
[sudo] npm install hyperloop -g
```

## Quick Start

You can see examples under the `examples` directory.

To compile, package and launch for iOS, use an example of the following command-line:

```bash
hyperloop package --platform=ios --src=examples/simple/ --dest=build --name=foo --appid=com.foo --launch
```

The initial compile will take a minute or so to generate the AST for the system frameworks. However, subsequent compiles will be almost instantaneous as it will be cached.  In the future, we plan on speeding this up greatly.

If all goes well, this should compile the application source code and the native application and launch it in the iOS Simulator.


## Platforms Supported

The following Platforms are being targeted for supported.

### Current (already working)

- _iOS_ - iOS 7.0

### Planned (in development)

- _Android_ - Android
- _Windows 8_ - Win8 desktop 
- _Windows Phone 8_ - Windows Phone / Tablet
- _OSX_ - OSX desktop

### Possible, Likely (dreaming, wanna help?)

- _Blackberry_ - BB 10 
- _Tizen_ - Tizen OS
- _Leapmotion_ - Leapmotion SDK


## Design

Hyperloop works by using a high-level [DSL](http://en.wikipedia.org/wiki/Domain-specific_language) written in JavaScript and compiling that into native code using an [AOT](http://en.wikipedia.org/wiki/AOT_compiler) compiler. 

The compiler is broken into two subsystems: _backend_ and _frontend_.  The _frontend_ will parse the input JavaScript source code and transform it into an [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree) and will resolve special reserved JavaScript keywords which instruct the compiler to perform specific code transformations (we call this CNI, short for Common Native Interface).  Once CNI instructions are encountered, the _backend_ compiler will emit the appropriate language and OS specific code for the target platform.  The _backend_ compiler is specific to each OS while the _frontend_ compiler is generic for all platforms.

### CNI keywords

The DSL provides a small number of specific reserved keywords which form the DSL for CNI.  While the keywords are platform independent, the specific values passed are usually platform dependent.

* _@import_ - import a specific symbol.  Typically this is used to import a static symbol or class.  
* _@compiler_ - instruct the native compiler to use specific settings which are passed as an object.
* _@class_ - create a class implementation of a specific interface or an anonymous (classless) implementation.
* _@memory_ - create a direct memory buffer (equivalent to C malloc).

For example, in iOS, you could do something such as:

```javascript
@import('UIKit/UIView');
var view = new UIView();
```

In the above example, the _@import_ keyword will cause the compiler to import the `UIKit` framework and load the `UIView` interface and make it available in the current JS scope of the file.  Notice that `UIView` doesn't need to be defined, it is automatically available in scope when the JS is executed.  We can now treat `UIView` as a normal class.  In the second line, we will then instantiate the class using normal JS semantics.  This will create a native `UIView` implementation and return a pointer to it in the JS variable `view`.

You can now perform specific platform dependent methods that are defined in the OS interface:

```javascript
view.frame = CGRectMake(0,0,200,200);
view.backgroundColor = UIColor.blueColor();
```

However, before we can compile this code, we will need to add the additional imports for the additional native functions (before the code above):

```javascript
@import('CoreGraphics/CGRectMake');
@import('UIKit/UIColor');
```

You'll notice that we're importing a static method defined in the `CoreGraphics` framework named `CGRectMake`.  We can use this C function as we would any standard JS function.

### Generating Code

The backend compiler will turn the appropriate CNI into the target language of that platform. For example, for iOS, the backend will generate Objective-C source code.  For Android, the backend will generate Java, and so forth.

The backend code will generate JS VM specific code, depending on the engine specified.  By default, the backend will generate code for the [JavaScriptCore](http://trac.webkit.org/wiki/JavaScriptCore) engine (or "JSCore") which is part of the [WebKit](http://en.wikipedia.org/wiki/WebKit) opensource project.  Currently, Hyperloop only supports JSCore. However, we intend to support [V8](https://code.google.com/p/v8/) eventually as well.

#### JavaScriptCore

For JSCore, we have extended it to support additional platforms beyond iOS, such as Android and Windows 8.  In addition, we have extended JSCore to include additional capabilities which work with our compiler instructions.  All of our extensions are available in our public fork of [WebKit](https://github.com/appcelerator/webkit), currently on the branch named `javascriptcore_jsexport_api`.


## Current Limitations

### iOS / OSX


#### Instances with other than init constructors

To create a new instance, typically `[[obj alloc] init]`, you should use `new Object` in CNI. However, often, you want to call a specific init method.  For example:

~~~objective-c
var window = [[NSWindow alloc] initWithContentRect:NSRectMake(0,0,100,200) styleMask:NSTitledWindowMask backing:NSBackingStoreBuffered defer:NO];
~~~

Right now, there's no way to do this in CNI. However, this is coming quickly.  You will likely do something like the following in CNI (although not yet supported):

~~~javascript
var window = new NSWindow('initWithContentRect:styleMask:backing:style:',NSRectMake(0,0,100,200),NSTitledWindowMask,false);
~~~

Whereby the first parameter to a constructor equals the selector of an initXXX constructor in Objective-C.  In this case, instead of the normal `init` method being invoked, the selector would be invoked to construct the instance.

#### Resources

Currently, we don't copy assets (such as images) into your Resources directory on package. That will be resolved quickly.


## FAQ

#### [iOS] Will this work with iOS 5 or iOS 6?

RTFM. No, look above.

#### [iOS] What happens when I add my own methods to UIView (for example)?  i.e. subclass it?  Does it get compiled in to the native class?  Or is it JS only?  Or maybe there's a specific syntax used to make it a native method vs. JS-only method?

Any JS Object (i.e. Class) imported in principle is a first-class JS object where the native methods and properties are prototypes on the returned JS Object.  This will allow you to also add your own functions and properties to the returned Object as either direct properties of the object or on the prototype of the JS class.

#### Is this like XYZ?

Sure. I guess. Just like Titanium is like PhoneGap.  No.

#### Why the funky non-standard JS symbols like @?

Well, we wanted to specifically confuse JSLint and wreak havoc for your editors. Seriously, we wanted to specifically distinguish specific keywords that we're using as _special_ CNI keywords distinctly.  We want developers to understand that these keywords are specific to CNI and special and do magic things, thus the special `@` symbol prefix.  This is very similar to what other compilers do such as clang using `@import` to import modules or C pre-processor using `#ifdef` to tell the compiler that it wants to do something special before compiling the language.  

#### Can I write modules?

For Titanium (and Hyperloop), modules just become Hyperloop CNI code packaged as [Common JS](http://wiki.commonjs.org/wiki/CommonJS) and loaded via `require`.  We will make a new packaging mechanism to make it easier to distribute them such as Node does with NPM modules. 


## Hyperloop and Titanium

The next generation Titanium SDK, called [Ti.Next](http://ceogeek.tumblr.com/post/54456815189/thoughts-on-ti-next), is being rebuilt around Hyperloop.  However, we are separating the new compiler (hyperloop) in a standalone project so that developers can use hyperloop without Titanium.  Ti.Next uses the hyperloop compiler to build the new Titanium SDK.

The target for "hyperloop standalone" is developers who would like to write native applications using JavaScript (as a language) but prefer to use the target platforms API directly, instead of using the cross-platform Titanium API.  

## Contributors

The original source and design for this project was developed by [Jeff Haynie](http://github.com/jhaynie) ([@jhaynie](http://twitter.com/jhaynie)).

## Contributing

Hyperloop is an open source project.  Hyperloop wouldn't be where it is now without contributions by the community. Please consider forking Hyperloop to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

To protect the interests of the Hyperloop contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once.

[You can digitally sign the CLA](http://bit.ly/app_cla) online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA.  Once you've submitted it, you no longer need to send one for subsequent submissions.

## Legal

Copyright (c) 2013 by [Appcelerator, Inc](http://www.appcelerator.com). All Rights Reserved.
This code contains patents and/or patents pending by Appcelerator, Inc.
Hyperloop is a trademark of Appcelerator, Inc.
This project is licensed under the Apache Public License, version 2.  Please see details in the LICENSE file. 
