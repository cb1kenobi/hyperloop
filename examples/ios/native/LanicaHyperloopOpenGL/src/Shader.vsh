//
//  Shader.vsh
//  OpenGLTemplateiOS7Xcode5
//
//  Created by Eric Wing on 8/29/13.
//  Copyright (c) 2013 Eric Wing. All rights reserved.
//

attribute vec4 position;
attribute vec3 normal;
attribute vec2 texCoord;                // vertex texture coordinate attribute

varying lowp vec4 colorVarying;
varying vec2 texCoordVar;               // vertex texture coordinate varying

uniform mat4 modelViewProjectionMatrix;
uniform mat3 normalMatrix;

void main()
{
    vec3 eyeNormal = normalize(normalMatrix * normal);
    vec3 lightPosition = vec3(0.0, 0.0, 1.0);
    vec4 diffuseColor = vec4(0.4, 0.4, 1.0, 1.0);
    
    float nDotVP = max(0.0, dot(eyeNormal, normalize(lightPosition)));
                 
    colorVarying = diffuseColor * nDotVP;
	texCoordVar = texCoord;             // assign the texture coordinate attribute to its varying

    gl_Position = modelViewProjectionMatrix * position;
}
