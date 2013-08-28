# Hyperloop

Hyperloop is a next-generation compiler that converts JavaScript source code into native code for targeting different native OS platforms.

## Install

To install hyperloop, using npm:

```bash
> npm install hyperloop -g
```

## Design

Hyperlook works by using a high-level [DSL](http://en.wikipedia.org/wiki/Domain-specific_language) written in JavaScript into native code using an [AOT](http://en.wikipedia.org/wiki/AOT_compiler) compiler. 

The compiler is broken into two subsystems: _backend_ and _frontend_.  The _frontend_ will parse the input JavaScript source code and transform it into an [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree) and will resolve special reserved JavaScript keywords which instruct the compiler to perform specific code transformations (we call this CNI, short for Common Native Interface).  Once CNI instructions are encountered, the _backend_ compiler will emit the appropriate language and OS specific code for the target platform.  The _backend_ compiler is specific to each OS while the _frontend_ compiler is generic for all platforms.

### CNI keywords

The DSL provides a small number of specific reserved keywords which form the DSL for CNI.  While the keywords are platform independent, the specific values passed are usually platform dependent.

* _import_ - import a specific symbol.  Typically this is used to import a static symbol or class.  
* _native_ - instruct the native compiler to use specific settings which are passed as an object.
* _interface_ - create a class implementation of a specific interface or an anonymous (classless) implementation.

For example, in iOS, you could do something such as:

```javascript
import('UIKit/UIView');
var view = new UIView();
```

In the above example, the _import_ keyword will cause the compiler to import the `UIKit` framework and load the `UIView` interface and make it available in the current JS scope of the file.  Notice that `UIView` doesn't need to be defined, it is automatically available in scope when the JS is executed.  We can now treat `UIView` as a normal class.  In the second line, we will then instantiate the class using normal JS semantics.  This will create a native `UIView` implementation and return a pointer to it in the JS variable `view`.

You can now perform specific platform dependent methods that are defined in the OS interface:

```javascript
view.frame = CGRectMake(0,0,200,200);
view.backgroundColor = UIColor.blueColor();
```

However, before we can compile this code, we will need to add the additional imports for the additional native functions (before the code above):

```javascript
import('CoreGraphics/CGRectMake');
import('UIKit/UIColor');
```

You'll notice that we're importing a static method defined in the `CoreGraphics` framework named `CGRectMake`.  We can use this C function as we would any standard JS function.

### Generating Code

The backend compiler will turn the appropriate CNI into the target language of that platform. For example, for iOS, the backend will generate Objective-C source code.  For Android, the backend will generate Java, and so forth.

The backend code will generate JS VM specific code, depending on the engine specified.  By default, the backend will generate code for the [JavaScriptCore](http://trac.webkit.org/wiki/JavaScriptCore) engine (or "JSCore") which is part of the [WebKit](http://en.wikipedia.org/wiki/WebKit) opensource project.  Currently, Hyperloop only supports JSCore. However, we intend to support [V8](https://code.google.com/p/v8/) eventually as well.

#### JavaScriptCore

For JSCore, we have extended it to support additional platforms beyond iOS, such as Android and Windows 8.  In addition, we have extended JSCore to include additional capabilities which work with our compiler instructions.  All of our extensions are available in our public fork of [WebKit](https://github.com/appcelerator/webkit), currently on the branch named `javascriptcore_jsexport_api`.


## Quick Start

You can see examples under the `examples` directory.

To compile, package and launch for iOS, use an example of the following command-line:

```bash
hyperloop package --platform=ios --src=examples/simple/ --dest=build --name=foo --appid=com.foo --launch
```

The initial compile will take a minute or so to generate the AST for the system frameworks. However, subsequent compiles will be almost instantaneous as it will be cached.  In the future, we plan on speeding this up greatly.

If all goes well, this should compile the application source code and the native application and launch it in the iOS Simulator.


## Contributors

The original source and design for this project was developed by [Jeff Haynie](http://github.com/jhaynie) ([@jhaynie](http://twitter.com/jhaynie)).


## Legal

Copyright (c) 2013 by [Appcelerator, Inc](http://www.appcelerator.com). All Rights Reserved.
This code contains patents and/or patents pending by Appcelerator, Inc.
Hyperlook is a trademark of Appcelerator, Inc.
This project is licensed under the Apache Public License, version 2.  Please see details in the LICENSE file. 
