# Hyperloop ∞

Hyperloop is a next-generation compiler that converts JavaScript source code into native code for targeting different native OS platforms.

> **THIS IS UNSTABLE, UNRELEASED CODE. DO NOT USE IN PRODUCTION YET.**

## Requirements

Hyperloop currently only builds for iOS. It requires the following:

* [Node.js](http://nodejs.org/) >= 0.10.5
* iOS SDK 7.0.  

> Currently, hyperloop is only being developed and tested on OSX. Windows and Linux will eventually be supported officially.

## Install

#### from npm

coming soon...

#### from github

```bash
sudo npm install -g git://github.com/appcelerator/hyperloop.git
```

If you have chown-ed the NPM folder to your local user (`sudo chown -R $USER /usr/local`) you can leave out the `sudo` bit.

#### fork, clone, and install locally

Assuming your Github username is `hyperloopdev`, fork this repo and execute the following:

```bash
# create a local cloned repo
git clone https://github.com/hyperloopdev/hyperloop.git

# change to the new directory
cd hyperloop

# add the appcelerator repo as a remote
git remote add appcelerator https://github.com/appcelerator/hyperloop.git

# install dependencies locally
npm install

# link your PATH to the locally installed hyperloop. This removes the need to `npm install` after changes
sudo npm link
```

## Quick Start

To get started with iOS, check out the [Quick Start Guide](https://github.com/appcelerator/hyperloop/wiki/Getting-started-with-iOS-and-Hyperloop).  You can see a number of examples under the [examples directory](https://github.com/appcelerator/hyperloop/tree/master/examples).

To compile, package and launch for iOS, use an example of the following command-line:

```bash
hyperloop package --platform=ios --src=examples/ios/simple/ --dest=build --name=foo --appid=com.foo --launch
```

The initial compile will take a minute or so to generate the AST for the system frameworks. However, subsequent compiles will be almost instantaneous as it will be cached.  In the future, we plan on speeding this up greatly.

If all goes well, this should compile the application source code and the native application and launch it in the iOS Simulator.

*Note:* Add the `--clean` command to clean the `build` dir before building a different example. You can also specify a different `--dest` folder to build multiple different examples.

## Documentation & Community

- [Wiki](https://github.com/appcelerator/hyperloop/wiki)
- [Mailing List](https://groups.google.com/forum/#!forum/tinext)

## Design

Hyperloop works by using a high-level [DSL](http://en.wikipedia.org/wiki/Domain-specific_language) written in JavaScript and compiling that into native code using an [AOT](http://en.wikipedia.org/wiki/AOT_compiler) compiler.

The compiler is broken into two subsystems: _backend_ and _frontend_.  The _frontend_ will parse the input JavaScript source code and transform it into an [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree) and will resolve special reserved JavaScript keywords which instruct the compiler to perform specific code transformations (we call this CNI, short for Common Native Interface).  Once CNI instructions are encountered, the _backend_ compiler will emit the appropriate language and OS specific code for the target platform.  The _backend_ compiler is specific to each OS while the _frontend_ compiler is generic for all platforms.

#### Generating Code

The backend compiler will turn the appropriate CNI into the target language of that platform. For example, for iOS, the backend will generate Objective-C source code.  For Android, the backend will generate Java, and so forth.

The backend code will generate JS VM specific code, depending on the engine specified.  By default, the backend will generate code for the [JavaScriptCore](http://trac.webkit.org/wiki/JavaScriptCore) engine (or "JSCore") which is part of the [WebKit](http://en.wikipedia.org/wiki/WebKit) opensource project.  Currently, Hyperloop only supports JSCore. However, we intend to support [V8](https://code.google.com/p/v8/) eventually as well.

## Reporting Bugs or submitting fixes

If you run into problems, and trust us, there are likely plenty of them at this point -- please create an [Issue](https://github.com/appcelerator/hyperloop/issues) or, even better, send us a pull request. You should also check out the [Mailing List](https://groups.google.com/forum/#!forum/tinext).

## Contributing

Hyperloop is an open source project.  Hyperloop wouldn't be where it is now without contributions by the community. Please consider forking Hyperloop to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

To protect the interests of the Hyperloop contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once.

[You can digitally sign the CLA](http://bit.ly/app_cla) online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA.  Once you've submitted it, you no longer need to send one for subsequent submissions.

## Contributors

The original source and design for this project was developed by [Jeff Haynie](http://github.com/jhaynie) ([@jhaynie](http://twitter.com/jhaynie)).

```
project  : hyperloop
 repo age : 8 weeks ago
 commits  : 325
 active   : 46 days
 files    : 259
 authors  : 
   198	Jeff Haynie             60.9%
    68	Tony Lukasavage         20.9%
    22	matt-langston           6.8%
    15	Dawson Toth             4.6%
     5	Allen Yeung             1.5%
     4	Fokke Zandbergen        1.2%
     4	Matt Langston           1.2%
     3	Kota Iguchi             0.9%
     2	Olivier Morandi         0.6%
     2	Chris Barber            0.6%
     1	ewmailing               0.3%
     1	Eric Wing               0.3%
```

## Legal

Copyright (c) 2013 by [Appcelerator, Inc](http://www.appcelerator.com). All Rights Reserved.
This code contains patents and/or patents pending by Appcelerator, Inc.
Hyperloop is a trademark of Appcelerator, Inc.
This project is licensed under the Apache Public License, version 2.  Please see details in the LICENSE file.
