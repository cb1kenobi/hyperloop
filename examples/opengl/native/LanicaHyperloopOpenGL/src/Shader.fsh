/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */


varying lowp vec4 colorVarying;

uniform sampler2D texture;      // shader texture uniform

varying lowp vec2 texCoordVar; // fragment texture coordinate varying

void main()
{
	gl_FragColor = colorVarying * texture2D( texture, texCoordVar);
}
