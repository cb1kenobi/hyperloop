/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

attribute vec4 position;

uniform mat4 modelViewProjectionMatrix;
uniform float pointSize;

attribute vec4 color;
varying vec4 vcolor;

void main()
{
    gl_Position = modelViewProjectionMatrix * position;
    gl_PointSize = pointSize;

    vcolor = color;
}
