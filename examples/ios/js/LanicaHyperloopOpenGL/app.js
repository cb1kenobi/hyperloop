/**
 * Author: Eric Wing <ewing@lanica.co>
 * Author: Matt Langston <mlangston@appcelerator.com>
 * Created: 2013.08.29
 * 
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you
 * may not use this software or any of it's contents except in
 * compliance with the License. The full text of the license is in the
 * file LICENSE.txt in the top-level directory of this project, or you
 * may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 */


@import('UIKit/UIApplication');

@import('GLKit/GLKitGLKViewController');
@import('GLKit/EAGLContext');
@import('GLKit/kEAGLRenderingAPIOpenGLES2');
//@import('GLKit/GLKView');
@import('GLKit/GLKViewDrawableDepthFormat24');

@import('Foundation/NSLog');

@compiler({
    cflags: ['-DDEBUG=1']
});

var keyWindow = UIApplication.sharedApplication().keyWindow;

var viewController = new GLKViewController({
    'viewDidLoad': function() {
	super.viewDidLoad();
	
	this.context = new EAGLContext({
	    'initWithAPI': kEAGLRenderingAPIOpenGLES2
	});
	
	if (!this.context) {
            NSLog("Failed to create ES context");
	}
	
	// The view is a GLKView.
	this.view.context = self.context;
	this.view.drawableDepthFormat = GLKViewDrawableDepthFormat24;
    
	this.setupGL();
    },

    'dealloc': function() {
	// TODO
    },


    'didReceiveMemoryWarning': function() {
	// TODO
    },

    'setupGL': function() {
	// TODO
    },

    'tearDownGL': function() {
	// TODO
    },

    'update': function() {
	// TODO
    },

    'glkViewDrawInRect': function(rect) {
	// TODO
    },

    'loadShaders': function() {
	// TODO
    },

    'compileShaderTypeFile': function(type, file) {
	// TODO
    },

    'linkProgram': function(prog) {
	// TODO
    },

    'validateProgram': function(prog) {
	// TODO
    }
});

keyWindow.addSubview(viewController.view);
