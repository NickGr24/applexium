import{r as e}from"./rolldown-runtime-hePW80VL.js";import{t}from"./jsx-runtime-NZYk81nU.js";import{t as n}from"./react-CwJFpaho.js";import{a as r,i,n as a,r as o,t as s}from"./Triangle-CaGRA7Eq.js";var c=e(n(),1),l=t(),u=`
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`,d=`
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0); // Center in UV space
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha); // Enhance contrast
    alpha = min(alpha, 1.0); // Clamp to maximum 1.0
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`,f=165,p=.5,m=[.5,.5],h=[1,0];function g({focal:e=m,rotation:t=h,starSpeed:n=.5,density:g=1,hueShift:_=f,disableAnimation:v=!1,speed:y=1,mouseInteraction:b=!0,glowIntensity:x=.35,saturation:S=p,mouseRepulsion:C=!0,repulsionStrength:w=2,twinkleIntensity:T=.3,rotationSpeed:E=.1,autoCenterRepulsion:D=0,transparent:O=!0,dpr:k,paused:A=!1}){let j=(0,c.useRef)(null),M=(0,c.useRef)({x:.5,y:.5}),N=(0,c.useRef)({x:.5,y:.5}),P=(0,c.useRef)(0),F=(0,c.useRef)(0),I=(0,c.useRef)(A);I.current=A;let L=(0,c.useRef)(null),R=(0,c.useRef)(0);return(0,c.useEffect)(()=>{let c=j.current;if(!c)return;let l=new i({alpha:O,premultipliedAlpha:!1,dpr:k}),f=l.gl;O?(f.enable(f.BLEND),f.blendFunc(f.SRC_ALPHA,f.ONE_MINUS_SRC_ALPHA),f.clearColor(0,0,0,0)):f.clearColor(0,0,0,1);let p;function m(){l.setSize(c.offsetWidth,c.offsetHeight),p&&(p.uniforms.uResolution.value=new a(f.canvas.width,f.canvas.height,f.canvas.width/f.canvas.height))}window.addEventListener(`resize`,m,!1),m();let h=new s(f);p=new r(f,{vertex:u,fragment:d,uniforms:{uTime:{value:0},uResolution:{value:new a(f.canvas.width,f.canvas.height,f.canvas.width/f.canvas.height)},uFocal:{value:new Float32Array(e)},uRotation:{value:new Float32Array(t)},uStarSpeed:{value:n},uDensity:{value:g},uHueShift:{value:_},uSpeed:{value:y},uMouse:{value:new Float32Array([N.current.x,N.current.y])},uGlowIntensity:{value:x},uSaturation:{value:S},uMouseRepulsion:{value:C},uTwinkleIntensity:{value:T},uRotationSpeed:{value:E},uRepulsionStrength:{value:w},uMouseActiveFactor:{value:0},uAutoCenterRepulsion:{value:D},uTransparent:{value:O}}});let A=new o(f,{geometry:h,program:p});function z(e){if(I.current)return;R.current=requestAnimationFrame(z),v||(p.uniforms.uTime.value=e*.001,p.uniforms.uStarSpeed.value=e*.001*n/10);let t=.05;N.current.x+=(M.current.x-N.current.x)*t,N.current.y+=(M.current.y-N.current.y)*t,F.current+=(P.current-F.current)*t,p.uniforms.uMouse.value[0]=N.current.x,p.uniforms.uMouse.value[1]=N.current.y,p.uniforms.uMouseActiveFactor.value=F.current,l.render({scene:A})}L.current=z,c.appendChild(f.canvas),I.current||(R.current=requestAnimationFrame(z));function B(e){let t=c.getBoundingClientRect(),n=(e.clientX-t.left)/t.width,r=1-(e.clientY-t.top)/t.height;M.current={x:n,y:r},P.current=1}function V(){P.current=0}return b&&(c.addEventListener(`mousemove`,B),c.addEventListener(`mouseleave`,V)),()=>{cancelAnimationFrame(R.current),L.current=null,window.removeEventListener(`resize`,m),b&&(c.removeEventListener(`mousemove`,B),c.removeEventListener(`mouseleave`,V)),c.contains(f.canvas)&&c.removeChild(f.canvas),f.getExtension(`WEBGL_lose_context`)?.loseContext()}},[e,t,n,g,_,v,y,b,x,S,C,T,E,w,D,O,k]),(0,c.useEffect)(()=>{A||!L.current||(cancelAnimationFrame(R.current),R.current=requestAnimationFrame(L.current))},[A]),(0,l.jsx)(`div`,{ref:j,className:`scene-canvas__layer`,style:{width:`100%`,height:`100%`}})}export{g as GalaxyRBCanvas};