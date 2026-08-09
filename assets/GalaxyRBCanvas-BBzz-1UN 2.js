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
`,f=165,p=.5;function m({focal:e=[.5,.5],rotation:t=[1,0],starSpeed:n=.5,density:m=1,hueShift:h=f,disableAnimation:g=!1,speed:_=1,mouseInteraction:v=!0,glowIntensity:y=.35,saturation:b=p,mouseRepulsion:x=!0,repulsionStrength:S=2,twinkleIntensity:C=.3,rotationSpeed:w=.1,autoCenterRepulsion:T=0,transparent:E=!0,dpr:D,paused:O=!1}){let k=(0,c.useRef)(null),A=(0,c.useRef)({x:.5,y:.5}),j=(0,c.useRef)({x:.5,y:.5}),M=(0,c.useRef)(0),N=(0,c.useRef)(0),P=(0,c.useRef)(O);P.current=O;let F=(0,c.useRef)(null),I=(0,c.useRef)(0);return(0,c.useEffect)(()=>{let c=k.current;if(!c)return;let l=new i({alpha:E,premultipliedAlpha:!1,dpr:D}),f=l.gl;E?(f.enable(f.BLEND),f.blendFunc(f.SRC_ALPHA,f.ONE_MINUS_SRC_ALPHA),f.clearColor(0,0,0,0)):f.clearColor(0,0,0,1);let p;function O(){l.setSize(c.offsetWidth,c.offsetHeight),p&&(p.uniforms.uResolution.value=new a(f.canvas.width,f.canvas.height,f.canvas.width/f.canvas.height))}window.addEventListener(`resize`,O,!1),O();let L=new s(f);p=new r(f,{vertex:u,fragment:d,uniforms:{uTime:{value:0},uResolution:{value:new a(f.canvas.width,f.canvas.height,f.canvas.width/f.canvas.height)},uFocal:{value:new Float32Array(e)},uRotation:{value:new Float32Array(t)},uStarSpeed:{value:n},uDensity:{value:m},uHueShift:{value:h},uSpeed:{value:_},uMouse:{value:new Float32Array([j.current.x,j.current.y])},uGlowIntensity:{value:y},uSaturation:{value:b},uMouseRepulsion:{value:x},uTwinkleIntensity:{value:C},uRotationSpeed:{value:w},uRepulsionStrength:{value:S},uMouseActiveFactor:{value:0},uAutoCenterRepulsion:{value:T},uTransparent:{value:E}}});let R=new o(f,{geometry:L,program:p});function z(e){if(P.current)return;I.current=requestAnimationFrame(z),g||(p.uniforms.uTime.value=e*.001,p.uniforms.uStarSpeed.value=e*.001*n/10);let t=.05;j.current.x+=(A.current.x-j.current.x)*t,j.current.y+=(A.current.y-j.current.y)*t,N.current+=(M.current-N.current)*t,p.uniforms.uMouse.value[0]=j.current.x,p.uniforms.uMouse.value[1]=j.current.y,p.uniforms.uMouseActiveFactor.value=N.current,l.render({scene:R})}F.current=z,c.appendChild(f.canvas),P.current||(I.current=requestAnimationFrame(z));function B(e){let t=c.getBoundingClientRect(),n=(e.clientX-t.left)/t.width,r=1-(e.clientY-t.top)/t.height;A.current={x:n,y:r},M.current=1}function V(){M.current=0}return v&&(c.addEventListener(`mousemove`,B),c.addEventListener(`mouseleave`,V)),()=>{cancelAnimationFrame(I.current),F.current=null,window.removeEventListener(`resize`,O),v&&(c.removeEventListener(`mousemove`,B),c.removeEventListener(`mouseleave`,V)),c.contains(f.canvas)&&c.removeChild(f.canvas),f.getExtension(`WEBGL_lose_context`)?.loseContext()}},[e,t,n,m,h,g,_,v,y,b,x,C,w,S,T,E,D]),(0,c.useEffect)(()=>{O||!F.current||(cancelAnimationFrame(I.current),I.current=requestAnimationFrame(F.current))},[O]),(0,l.jsx)(`div`,{ref:k,style:{width:`100%`,height:`100%`}})}export{m as GalaxyRBCanvas};