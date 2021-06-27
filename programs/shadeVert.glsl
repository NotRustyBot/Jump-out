let shadeVertCode=`
#version 300 es

precision mediump float;

in vec2 aVertexPosition;
in vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTextureMatrix;

out vec2 vTextureCoord;

void main(void)
{
    gl_Position=vec4((projectionMatrix*translationMatrix*vec3(aVertexPosition,1.)).xy,0.,1.);
    
    vTextureCoord=(uTextureMatrix*vec3(aTextureCoord,1.)).xy;
}
`