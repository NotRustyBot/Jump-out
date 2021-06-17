const shadeFragCode=`

precision highp float;

varying vec2 vTextureCoord;
uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform vec2 lightDir;
uniform float rotation;
uniform sampler2D uSampler;
uniform sampler2D uOutlineSampler;
uniform sampler2D uDarkSampler;
void main(void)
{
    vec2 coords=vTextureCoord;
    vec4 texture=texture2D(uSampler,vTextureCoord);
    vec4 outline=texture2D(uOutlineSampler,coords);
    vec4 dark=texture2D(uDarkSampler,coords);
    
    mat2 rot = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation));

    vec2 pos=coords.xy-vec2(.5,.5);
    //vec2 normLight=vec2(cos(_LightAngle),sin(_LightAngle));
    vec2 normLight=normalize(lightDir);
    float light = dot(pos, rot*normLight) + 0.5;
    
    texture*=light;
    dark*=1.-light;
    outline*=pow(light,5.);
    
    gl_FragColor=texture+dark+outline;
    //gl_FragColor = vec4(light,light,light,1);
}

`;