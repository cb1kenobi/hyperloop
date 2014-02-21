# Hyperloop ∞ [![Build Status](https://travis-ci.org/appcelerator/hyperloop.png)](https://travis-ci.org/appcelerator/hyperloop)

Hyperloop is a next-generation compiler that converts JavaScript source code into native code for targeting different native OS platforms. Currently supports iOS and WinRT development.

> **EXPERIMENTAL: DO NOT USE IN PRODUCTION YET.**

## Requirements

* [Node.js](http://nodejs.org/) >= 0.10.13
* [iOS development requirements](https://github.com/appcelerator/hyperloop/wiki/Getting-started-with-iOS-and-Hyperloop)
* [Windows development requirements](https://github.com/appcelerator/hyperloop/wiki/Running-Hyperloop-on-Windows)

## Install

#### from npm [![NPM version](https://badge.fury.io/js/hyperloop.png)](http://badge.fury.io/js/hyperloop)

```
[sudo] npm install -g hyperloop
```

#### from github (cutting edge)

```bash
[sudo] npm install -g git://github.com/appcelerator/hyperloop.git
```

#### clone and install

```bash
git clone https://github.com/appcelerator/hyperloop.git
cd hyperloop
npm install
sudo npm link
```

## Quick Start

Assuming you have already satisfied the [requirements](https://github.com/appcelerator/hyperloop#requirements) for your target platform and installed hyperloop following the [clone and install](https://github.com/appcelerator/hyperloop#clone-and-install) instructions, launching a basic example app can be done like this:

```
# let's launch the windows "helloworld" on Windows
hyperloop launch --src="examples\windows\helloworld"

# or try the ios spritekit example on OSX
hyperloop launch --src="examples/ios/spritekit"
```

Based on your target platform, you may be asked to create certificates, licenses, etc... Hyperloop should walk you through that. The initial compile will take a minute or so to generate the AST for the system frameworks. However, subsequent compiles will be almost instantaneous as it will be cached.  In the future, we plan on speeding this up greatly. If all goes well you'll see this on your local machine (Windows) or iOS simulator (Mac OSX), respectively.

This shows only the most basic workflow for launching an app with hyperloop. Be sure to check out the wiki for _many_ more details on creating, developing, building, and launching apps with hyperloop using both purely CLI and the native tooling of your target platform. Also, be sure to check out the full [listing of examples](https://github.com/appcelerator/hyperloop/tree/master/examples).

For even more information regarding development, supported platforms, and even using [hyperloop code in Titanium 3.1.3+](https://github.com/appcelerator/hyperloop/wiki/Using-Hyperloop-code-in-Ti.Current-SDK), be sure to check out the [wiki](https://github.com/appcelerator/hyperloop/wiki).

## Documentation & Community

- [Wiki](https://github.com/appcelerator/hyperloop/wiki)
- [Mailing List](https://groups.google.com/forum/#!forum/tinext)

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
 repo age : 6 months
 active   : 138 days
 commits  : 766
 files    : 855
 authors  :
   302  Jeff Haynie              39.4%
   176  Dawson Toth              23.0%
   169  Tony Lukasavage          22.1%
    32  Kota Iguchi              4.2%
    30  Matt Langston            4.0%
    23  Russ McMahon             3.0%
     7  Olivier Morandi          0.9%
     7  Fokke Zandbergen         0.9%
     5  Allen Yeung              0.7%
     5  Eric Wing                0.6%
     3  Pier Paolo Ramon         0.4%
     2  Chris Barber             0.3%
     2  Drew Fyock               0.3%
     2  jonalter                 0.3%
     1  U-dev-vm\Thomas Anderson 0.1%
```

## Legal

Copyright (c) 2014 by [Appcelerator, Inc](http://www.appcelerator.com). All Rights Reserved.
This code contains patents and/or patents pending by Appcelerator, Inc.
Hyperloop is a trademark of Appcelerator, Inc.
This project is licensed under the Apache Public License, version 2.  Please see details in the LICENSE file.

