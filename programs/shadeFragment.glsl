const shadeFragCode=`
#version 300 es

precision mediump float;

in vec2 vTextureCoord;
uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform vec2 lightDir;
uniform float rotation;
uniform sampler2D uSampler;
uniform sampler2D uOutlineSampler;
uniform sampler2D uDarkSampler;

out vec4 fragColor;
void main(void)
{
    vec2 coords=vTextureCoord;
    vec4 base=texture(uSampler,vTextureCoord);
    vec4 outline=texture(uOutlineSampler,coords);
    vec4 dark=texture(uDarkSampler,coords);
    
    mat2 rot = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation));

    vec2 pos=coords.xy-vec2(.5,.5);
    //vec2 normLight=vec2(cos(_LightAngle),sin(_LightAngle));
    vec2 normLight=normalize(lightDir);
    float light = dot(pos, rot*normLight) + 0.5;
    
    base*=light;
    dark*=1.-light;
    outline*=pow(light,5.);
    
    fragColor=base+dark+outline;
}

`;