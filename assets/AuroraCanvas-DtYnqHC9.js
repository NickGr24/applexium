import{r as e}from"./rolldown-runtime-hePW80VL.js";import{t}from"./jsx-runtime-NZYk81nU.js";import{t as n}from"./react-CwJFpaho.js";import{a as r,i,n as a,r as o,t as s}from"./Triangle-CaGRA7Eq.js";var c=e(n(),1),l=t(),u=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,d=`#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \\
  int index = 0;                                            \\
  for (int i = 0; i < 2; i++) {                               \\
     ColorStop currentColor = colors[i];                    \\
     bool isInBetween = currentColor.position <= factor;    \\
     index = int(mix(float(index), float(i), float(isInBetween))); \\
  }                                                         \\
  ColorStop currentColor = colors[index];                   \\
  ColorStop nextColor = colors[index + 1];                  \\
  float range = nextColor.position - currentColor.position; \\
  float lerpFactor = (factor - currentColor.position) / range; \\
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`,f=[`#1C1890`,`#245EFE`,`#1FCDFF`];function p({colorStops:e=f,amplitude:t=1,blend:n=.5,speed:p=1,dpr:m,progressRef:h,paused:g=!1}){let _=(0,c.useRef)({colorStops:e,amplitude:t,blend:n,speed:p});_.current={colorStops:e,amplitude:t,blend:n,speed:p};let v=(0,c.useRef)(g);v.current=g;let y=(0,c.useRef)(null),b=(0,c.useRef)(null),x=(0,c.useRef)(0);return(0,c.useEffect)(()=>{let c=y.current;if(!c)return;let l=new i({alpha:!0,premultipliedAlpha:!0,antialias:!0,dpr:m}),f=l.gl;f.clearColor(0,0,0,0),f.enable(f.BLEND),f.blendFunc(f.ONE,f.ONE_MINUS_SRC_ALPHA),f.canvas.style.backgroundColor=`transparent`;let p;function g(){if(!c)return;let e=c.offsetWidth,t=c.offsetHeight;l.setSize(e,t),p&&(p.uniforms.uResolution.value=[e,t])}window.addEventListener(`resize`,g);let S=new s(f);S.attributes.uv&&delete S.attributes.uv;let C=e.map(e=>{let t=new a(e);return[t.r,t.g,t.b]});p=new r(f,{vertex:u,fragment:d,uniforms:{uTime:{value:0},uAmplitude:{value:t},uColorStops:{value:C},uResolution:{value:[c.offsetWidth,c.offsetHeight]},uBlend:{value:n}}});let w=new o(f,{geometry:S,program:p});c.appendChild(f.canvas);let T=e=>{if(v.current)return;x.current=requestAnimationFrame(T);let t=_.current,n=h?.current??0;p.uniforms.uAmplitude.value=t.amplitude*(1+n*.35),p.uniforms.uTime.value=e*.01*(t.speed*(1+n*.25))*.1,p.uniforms.uBlend.value=t.blend,p.uniforms.uColorStops.value=t.colorStops.map(e=>{let t=new a(e);return[t.r,t.g,t.b]}),l.render({scene:w})};return b.current=T,v.current||(x.current=requestAnimationFrame(T)),g(),()=>{cancelAnimationFrame(x.current),b.current=null,window.removeEventListener(`resize`,g),c&&f.canvas.parentNode===c&&c.removeChild(f.canvas),f.getExtension(`WEBGL_lose_context`)?.loseContext()}},[t,m]),(0,c.useEffect)(()=>{g||!b.current||(cancelAnimationFrame(x.current),x.current=requestAnimationFrame(b.current))},[g]),(0,l.jsx)(`div`,{ref:y,style:{width:`100%`,height:`100%`}})}export{p as AuroraCanvas};