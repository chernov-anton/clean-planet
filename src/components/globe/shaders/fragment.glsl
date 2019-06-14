uniform sampler2D mapIndex;
uniform sampler2D lookup;
uniform sampler2D outline;
uniform float outlineLevel;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
    vec4 mapColor = texture2D(mapIndex, vUv);
    float indexedColor = mapColor.x;
    vec2 lookupUV = vec2(indexedColor, 0.);
    vec4 lookupColor = texture2D(lookup, lookupUV);
    float mask = lookupColor.x + (1.-outlineLevel) * indexedColor;
    mask = clamp(mask, 0., 1.);
    float outlineColor = texture2D(outline, vUv).x * outlineLevel;
    float diffuse = mask + outlineColor;
    gl_FragColor = vec4(vec3(diffuse), 1.);
}