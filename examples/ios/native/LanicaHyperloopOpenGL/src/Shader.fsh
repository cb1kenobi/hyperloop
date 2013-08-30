//
//  Shader.fsh
//  OpenGLTemplateiOS7Xcode5
//
//  Created by Eric Wing on 8/29/13.
//  Copyright (c) 2013 Eric Wing. All rights reserved.
//

varying lowp vec4 colorVarying;

void main()
{
    gl_FragColor = colorVarying;
}
