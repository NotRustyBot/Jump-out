const gasFragCode=`

precision highp float;

varying vec2 vTextureCoord;
uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform vec4 uColor;
uniform vec4 corners;
uniform sampler2D uSampler;
void main(void)
{
    vec4 cornerCoord = vec4(1.0-vTextureCoord.x,1.0-vTextureCoord.y,vTextureCoord.xy);
    float value =   cornerCoord.x * cornerCoord.y * corners.x +
                    cornerCoord.z * cornerCoord.y * corners.y +
                    cornerCoord.z * cornerCoord.w * corners.z +
                    cornerCoord.x * cornerCoord.w * corners.w;
    value = value / 2.0;
    gl_FragColor= vec4(value,value,value,value)*uColor;
}

`;