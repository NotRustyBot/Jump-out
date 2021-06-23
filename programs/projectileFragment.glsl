const projectileFragCode=`
#version 300 es

precision mediump float;

in vec2 vTextureCoord;
uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform vec4 uColor;
uniform sampler2D uSampler;
uniform sampler2D uOutlineSampler;
uniform sampler2D uDarkSampler;

out vec4 fragColor;
void main(void)
{
    fragColor = texture(uSampler,vTextureCoord)*uColor;
}

`;