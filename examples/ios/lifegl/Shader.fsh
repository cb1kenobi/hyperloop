/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

precision mediump float;
varying vec4 vcolor;

void main()
{
    if (vcolor.a <= 0.0) {
        discard;
    }
    gl_FragColor = vcolor;
}
