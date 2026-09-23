"use client";

import type { CSSProperties } from "react";
import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Zap, Lock, Apple } from "lucide-react";
import Link from "next/link";

const SANS = "'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif";
const DISPLAY = "'Inter', 'Helvetica Neue', 'Arial Black', sans-serif";
const INK = "#FFFFFF";

/* Inline film-grain noise overlay */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* High-Impact Productivity Power Words orbiting around the top stage */
const PHRASES = ["HABITS", "GOALS", "SESSIONS", "HABITS", "GOALS", "SESSIONS"];
const LOOP = 22; // seconds for one full 360° orbit
const RING_N = PHRASES.length;
const RING_STEP = 360 / RING_N;
const RING_R = 680; // px radius of the word ring
const PERSP = 2200; // px perspective distance

const MANIFESTO =
  "WE TURN HUMAN NEUROSCIENCE INTO ZERO-WILLPOWER SOFTWARE THAT LOCKS YOUR FOCUS AND PROTECTS YOUR TIME.";

const TICK_LABELS = ["EXECUTION", "SYSTEM", "SHIELD", "HABITS"];

/* ═══════════════════════ Procedural 3D Jellyfish ═══════════════════════ */

function useTime() {
  const t = useRef({ value: 0 });
  useFrame((s) => (t.current.value = s.clock.elapsedTime));
  return t.current;
}

const BELL_VERT = /* glsl */ `
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
  void main(){
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const BELL_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
  }

  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N,V),0.0), 2.4);

    float h = clamp((vPos.y + 0.40)/1.40, 0.0, 1.0);
    float ang = atan(vPos.z, vPos.x);

    vec3 top  = vec3(1.00, 0.01, 0.91); // Signature Neon Pink #FF02E8
    vec3 mid  = vec3(0.60, 0.15, 0.85);
    vec3 edge = vec3(0.35, 0.20, 0.95);
    vec3 col = mix(edge, mid, smoothstep(0.0,0.5,h));
    col = mix(col, top, smoothstep(0.45,1.0,h));

    float ribs = abs(fract(ang/(2.0*3.14159265)*18.0) - 0.5) * 2.0;
    float ribLine = smoothstep(0.80, 0.99, ribs);
    float ribMask = smoothstep(0.98,0.55,h) * smoothstep(-0.02,0.22,h);
    col *= 1.0 - ribLine * 0.55 * ribMask;

    float backw = gl_FrontFacing ? 1.0 : 0.0;

    float band = smoothstep(0.34, 0.02, h);
    float spots = noise(vec2(ang*7.0, h*12.0));
    float wart = smoothstep(0.58, 0.86, spots) * band;
    col = mix(col, vec3(0.30,0.05,0.25), wart*0.85*backw);

    col += fres * vec3(0.90, 0.10, 0.85);
    col += (1.0 - fres) * vec3(0.20,0.05,0.30) * (0.5 + 0.5*h);

    float alpha = 0.45 + fres*0.45 + ribLine*ribMask*0.22 + wart*0.35*backw;
    alpha *= mix(0.30, 1.0, backw);
    alpha = clamp(alpha, 0.0, 0.96);
    gl_FragColor = vec4(col, alpha);
  }
`;

function Bell({ time }: { time: { value: number } }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BELL_VERT,
        fragmentShader: BELL_FRAG,
        uniforms: { uTime: time },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [time]
  );
  return (
    <mesh material={mat} scale={[1, 0.84, 1]}>
      <sphereGeometry args={[1, 160, 160, 0, Math.PI * 2, 0, 1.98]} />
    </mesh>
  );
}

function Glow() {
  return (
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial
        color={"#ff02e8"}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

const STRAND_VERT = /* glsl */ `
  uniform float uTime; uniform float uLen; uniform float uPhase; uniform float uAmp; uniform float uFreq;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    vec3 p = position;
    float k = clamp(-p.y / uLen, 0.0, 1.0);
    float amp = k*k*uAmp;
    p.x += sin(uTime*1.5 + k*uFreq + uPhase) * amp;
    p.z += cos(uTime*1.2 + k*uFreq*0.9 + uPhase*1.3) * amp;
    vK = k;
    vWorldY = (modelMatrix * vec4(p,1.0)).y;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const STRAND_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uTop; uniform vec3 uTip; uniform float uOpacity; uniform vec2 uFade; uniform vec2 uFadeTop;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)),0.0), 1.6);
    float vis = smoothstep(uFade.x, uFade.y, vWorldY)
              * smoothstep(uFadeTop.y, uFadeTop.x, vWorldY);
    vec3 col = mix(uTop, uTip, vK) + fres*0.25;
    float alpha = ((1.0 - vK*0.92) * uOpacity + fres*0.12) * vis;
    gl_FragColor = vec4(col, clamp(alpha,0.0,1.0));
  }
`;

function strandGeometry(length: number, thickness: number, curl: number) {
  const seg = 40;
  const radial = 6;
  const spine: THREE.Vector3[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    spine.push(new THREE.Vector3(Math.sin(t * 3) * curl * t, -t * length, Math.cos(t * 2) * curl * t));
  }
  const curve = new THREE.CatmullRomCurve3(spine);
  const frames = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const p = curve.getPointAt(t);
    const r = thickness * (1 - Math.pow(t, 0.75));
    const Nf = frames.normals[i];
    const Bf = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      pos.push(
        p.x + (c * Nf.x + s * Bf.x) * r,
        p.y + (c * Nf.y + s * Bf.y) * r,
        p.z + (c * Nf.z + s * Bf.z) * r
      );
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Strand({
  time,
  angle,
  radius,
  yOffset,
  length,
  thickness,
  curl,
  amp,
  freq,
  phase,
  top,
  tip,
  opacity,
}: {
  time: { value: number };
  angle: number;
  radius: number;
  yOffset: number;
  length: number;
  thickness: number;
  curl: number;
  amp: number;
  freq: number;
  phase: number;
  top: string;
  tip: string;
  opacity: number;
}) {
  const geometry = useMemo(() => strandGeometry(length, thickness, curl), [length, thickness, curl]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STRAND_VERT,
        fragmentShader: STRAND_FRAG,
        uniforms: {
          uTime: time,
          uLen: { value: length },
          uPhase: { value: phase },
          uAmp: { value: amp },
          uFreq: { value: freq },
          uTop: { value: new THREE.Color(top) },
          uTip: { value: new THREE.Color(tip) },
          uOpacity: { value: opacity },
          uFade: { value: new THREE.Vector2(-1.85, -0.7) },
          uFadeTop: { value: new THREE.Vector2(-0.62, -0.22) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [time, length, phase, amp, freq, top, tip, opacity]
  );
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return <mesh geometry={geometry} material={mat} position={[x, yOffset, z]} />;
}

function Jelly({ loop }: { loop: number }) {
  const time = useTime();
  const grp = useRef<THREE.Group>(null!);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    grp.current.rotation.y = -(t / loop) * Math.PI * 2;
    grp.current.position.y = Math.sin(t * 0.6) * 0.08;
    const k = Math.sin(t * 1.7);
    grp.current.scale.set(1 + k * 0.05, 1 - k * 0.06, 1 + k * 0.05);
  });

  const tentacles = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({ angle: (i / 28) * Math.PI * 2, phase: i * 0.5 })),
    []
  );
  const arms = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({ angle: (i / 8) * Math.PI * 2, phase: i * 1.0 + 0.4 })),
    []
  );

  return (
    <group ref={grp}>
      <Bell time={time} />
      <Glow />
      {tentacles.map((s, i) => (
        <Strand
          key={`t${i}`}
          time={time}
          angle={s.angle}
          radius={0.82}
          yOffset={-0.25}
          length={4.2}
          thickness={0.016}
          curl={0.05}
          amp={0.5}
          freq={7.0}
          phase={s.phase}
          top={"#ff02e8"}
          tip={"#f3d9f0"}
          opacity={0.55}
        />
      ))}
      {arms.map((s, i) => (
        <Strand
          key={`a${i}`}
          time={time}
          angle={s.angle}
          radius={0.22}
          yOffset={-0.1}
          length={2.0}
          thickness={0.07}
          curl={0.14}
          amp={0.32}
          freq={10.0}
          phase={s.phase}
          top={"#ff02e8"}
          tip={"#e79fd8"}
          opacity={0.72}
        />
      ))}
    </group>
  );
}

export function Jellyfish3D({ loop = 20 }: { loop?: number }) {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ width: "100%", height: "100%" }} />;

  return (
    <Canvas
      flat
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6], fov: 34 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={1} />
      <Jelly loop={loop} />
    </Canvas>
  );
}

/* ═══════════════════════ Center Official Productivity Logo Design ═══════════════════════
   The official Productivity logo (Monogram P + PRODUCTIVITY vector letters) rendered
   in the center hub so the 3D orbiting productivity words ("EXECUTION", "FOCUS",
   "INTEGRITY", "ULTRADIAN", "SYSTEMS", "HABITS") continuously sweep through behind it. ─────────── */

const PRODUCTIVITY_MONOGRAM_P = 'M 166.412201 744.447998 L 166.088974 279.477478 L 432.138092 279.250122 C 460.61441 279.225647 485.026917 285.634705 505.375977 298.476746 C 525.72522 311.318848 541.297668 329.128235 552.093872 351.905029 C 562.890076 374.681824 568.298706 401.411133 568.320007 432.093445 C 568.340942 462.324402 562.766113 489.062988 551.595154 512.310059 C 540.424011 535.557129 524.571472 553.618774 504.036652 566.49585 C 483.502014 579.372925 458.793457 585.82373 429.910278 585.848206 L 264.544952 585.989502 L 264.655029 744.363647 Z M 264.484283 498.680969 L 409.102783 498.557373 C 428.629303 498.540527 443.778503 492.662109 454.550751 480.921326 C 465.322968 469.180481 470.701569 452.932495 470.687317 432.176941 C 470.677429 418.18927 468.330383 406.4599 463.645386 396.988708 C 458.960602 387.517151 452.039978 380.191162 442.883148 375.009949 C 433.726501 369.828735 422.435974 367.24408 409.011505 367.255432 L 264.393036 367.379456 Z';

const PRODUCTIVITY_TEXT_PATHS = [
  { id: "R_sub", d: "M 277.617462 743.439697 L 277.584564 700.766602 L 306.530212 700.744324 C 309.635986 700.741943 312.203857 701.330017 314.233887 702.508667 C 316.263885 703.687256 317.77655 705.290771 318.771973 707.319092 C 319.767365 709.347412 320.266052 711.624573 320.268005 714.150635 C 320.27005 716.842285 319.640472 719.275574 318.37912 721.450562 C 317.117767 723.62561 315.224579 725.314514 312.699493 726.517334 L 321.532837 743.405884 L 310.414246 743.414429 L 302.824524 728.26416 L 287.606323 728.275879 L 287.618011 743.432007 Z M 287.60025 720.387268 L 304.309204 720.37439 C 306.131256 720.372986 307.549133 719.823242 308.562805 718.725098 C 309.576538 717.626953 310.082642 716.16687 310.081268 714.344788 C 310.080383 713.185303 309.851837 712.181274 309.395691 711.332764 C 308.939514 710.484131 308.286804 709.842773 307.437561 709.408691 C 306.588318 708.974487 305.542572 708.757935 304.300262 708.758911 L 287.591278 708.771729 Z" },
  { id: "O_sub", d: "M 358.844421 744.169067 C 353.750946 744.172974 349.350494 743.337769 345.643005 741.663574 C 341.935486 739.989258 339.08667 737.517212 337.096436 734.247375 C 335.106262 730.977539 334.109283 726.940796 334.105591 722.137207 C 334.101837 717.292236 335.09256 713.233276 337.077728 709.960388 C 339.062897 706.687439 341.907898 704.210999 345.612854 702.531006 C 349.31778 700.009155 353.716919 700.009155 358.810364 700.005188 C 363.945251 700.001221 368.366364 700.836365 372.073883 702.51062 C 375.781403 704.184937 378.630219 706.656982 380.620422 709.926819 C 382.610657 713.196655 383.607605 717.254028 383.611359 722.09906 C 383.615021 726.902649 382.624298 730.940918 380.63916 734.213806 C 378.653961 737.486816 375.80896 739.963196 372.104034 741.643188 C 368.399139 743.32312 369.979279 744.1651 358.844421 744.169067 Z M 358.838226 736.156189 C 361.074371 736.15448 363.08252 735.863037 364.862732 735.281982 C 366.642914 734.700806 368.164063 733.850708 369.426208 732.731689 C 370.688385 731.612671 371.660431 730.224731 372.342438 728.567749 C 373.024414 726.910828 373.364594 725.026367 373.362976 722.914429 L 373.361694 721.237366 C 373.360046 719.084045 373.016937 717.189819 372.332397 715.554626 C 371.647888 713.919434 370.673676 712.543335 369.409821 711.426208 C 368.145935 710.309082 366.623474 709.461365 364.842377 708.882996 C 363.061279 708.304688 361.052673 708.016357 358.816528 708.018066 C 356.621796 708.019714 354.634338 708.311157 352.854156 708.892212 C 351.073975 709.473389 352.854156 710.323425 348.290649 711.442505 C 347.028503 712.561523 346.066772 713.939148 345.405487 715.575378 C 344.744202 717.211609 344.414368 719.106323 344.416046 721.259644 L 344.417297 722.936768 C 344.418945 725.048706 344.751678 726.932617 345.415527 728.588501 C 346.079376 730.244385 347.043213 731.630859 348.307098 732.747925 C 349.570984 733.865112 351.093414 734.712769 352.874512 735.291199 C 354.655579 735.869568 356.643463 736.157837 358.838226 736.156189 Z" },
  { id: "D_sub", d: "M 401.521454 743.439697 L 401.488556 700.766602 L 421.738098 700.750977 C 426.583099 700.747314 430.735046 701.54126 434.194031 703.132813 C 437.653046 704.724487 440.305054 707.09314 442.150238 710.238892 C 443.995422 713.384644 444.91983 717.338562 444.923492 722.100708 C 444.927155 726.821533 444.00882 730.756165 442.168488 733.904785 C 440.328156 737.053345 437.679749 739.426086 434.223206 741.023071 C 430.766693 742.619995 426.615997 743.42041 421.770996 743.424072 Z M 411.515778 735.357056 L 421.454193 735.349365 C 423.483307 735.347778 425.305115 735.077271 426.919678 734.537659 C 428.534271 733.998108 429.910553 733.210205 431.048523 732.174072 C 432.186523 731.137939 433.06546 729.843262 433.685425 728.289917 C 434.30542 726.736511 434.614594 724.945313 434.613037 722.916199 L 434.611725 721.239136 C 434.610168 719.209961 434.298218 717.41925 433.675873 715.866821 C 433.053497 714.314453 432.172577 713.021057 431.032959 711.986694 C 429.893402 710.952271 428.5159 710.166626 426.900513 709.629517 C 425.285095 709.092407 423.46283 708.824646 421.433746 708.826233 L 411.495331 708.833862 Z" },
  { id: "U_sub", d: "M 484.14328 744.169189 C 479.463928 744.172729 475.52948 743.451111 472.339752 742.004211 C 469.150024 740.557312 466.746643 738.447266 465.129486 735.674072 C 463.51239 732.900757 462.70224 729.505798 462.699158 725.489014 L 462.680115 700.767212 L 472.680664 700.759521 L 472.699402 725.108643 C 472.702118 728.62854 473.698059 731.350403 475.687256 733.274475 C 477.676392 735.198486 480.493011 736.159119 484.137115 736.156311 C 487.781219 736.153503 490.606689 735.188538 492.613617 733.261414 C 494.620514 731.33429 495.62262 728.61084 495.619873 725.090942 L 495.601135 700.741821 L 505.601685 700.734131 L 505.620697 725.455933 C 505.62381 729.472778 504.808563 732.868958 503.174988 735.644714 C 501.541443 738.420471 499.141327 740.53418 495.974548 741.985962 C 492.807739 743.437805 488.864075 744.165527 484.14328 744.169189 Z" },
  { id: "C_sub", d: "M 547.290588 744.168213 C 542.114258 744.172241 537.765625 743.368103 534.244507 741.755798 C 530.723389 740.143494 528.060913 737.702393 526.25708 734.432373 C 524.453186 731.162354 523.549377 727.042786 523.545532 722.073486 C 523.539917 714.826782 525.575134 709.338379 529.651184 705.608276 C 533.727234 701.878235 539.574951 700.010315 547.194397 700.004395 C 551.459717 700.001099 555.238831 700.660767 558.531921 701.983398 C 561.825073 703.305969 564.404297 705.239868 566.269775 707.785156 C 568.135193 710.330444 569.069336 713.466553 569.072205 717.193481 L 559.195862 717.20105 C 559.194397 715.213379 558.685791 713.546997 557.670166 712.201965 C 556.654602 710.856934 555.24585 709.822754 553.44397 709.099487 C 551.64209 708.376221 549.540222 708.015503 547.138428 708.017334 C 544.239746 708.019531 541.796997 708.539063 539.810059 709.575806 C 537.823181 710.612671 536.323242 712.114868 535.310181 714.082642 C 534.29718 716.050415 533.791748 718.421509 533.793884 721.196045 L 533.795166 722.935242 C 533.797363 725.75116 534.306519 728.142151 535.322571 730.108398 C 536.338623 732.074585 537.840881 733.574524 539.829346 734.608276 C 541.817871 735.641968 544.261414 736.157715 547.160095 736.155457 C 549.686157 736.153564 551.870239 735.810181 553.712524 735.125488 C 555.554749 734.440857 556.982544 733.414856 557.996033 732.047546 C 559.009583 730.680176 559.515564 729.023438 559.514038 727.077148 L 569.141968 727.069702 C 569.144775 730.755249 568.22583 733.861694 566.38501 736.38916 C 564.544189 738.916565 561.988647 740.844116 558.718201 742.171753 C 555.447815 743.49939 551.638611 744.164917 547.290588 744.168213 Z" },
  { id: "T_sub1", d: "M 599.412659 743.427612 L 599.386292 709.202209 L 583.174316 709.214722 L 583.167725 700.76709 L 625.65448 700.734314 L 625.661072 709.182007 L 609.448975 709.194458 L 609.475403 743.419922 Z" },
  { id: "I_sub1", d: "M 642.161438 743.42749 L 642.12854 700.754395 L 652.12915 700.746704 L 652.161987 743.419739 Z" },
  { id: "V_sub", d: "M 685.460693 743.42804 L 667.476501 700.768799 L 678.470886 700.760315 L 688.304382 725.785156 C 688.594727 726.44751 688.916321 727.244385 689.268982 728.175781 C 689.621704 729.1073 689.963989 730.00769 690.296021 730.877075 C 690.62793 731.746399 690.897705 732.512268 691.105225 733.174683 L 691.540039 733.174316 C 691.746643 732.55304 692.015259 731.81781 692.345886 730.968628 C 692.676514 730.119507 693.017456 729.239258 693.368774 728.328003 C 693.719971 727.416626 694.040222 726.567505 694.32959 725.780518 L 704.124451 700.74054 L 714.621887 700.732422 L 696.703491 743.419373 Z" },
  { id: "I_sub2", d: "M 730.225464 743.42749 L 730.192566 700.754395 L 740.193115 700.746704 L 740.226013 743.419739 Z" },
  { id: "T_sub2", d: "M 772.468689 743.427612 L 772.442322 709.202209 L 756.230286 709.214722 L 756.223755 700.76709 L 798.71051 700.734314 L 798.717041 709.182007 L 782.505005 709.194458 L 782.531372 743.419922 Z" },
  { id: "Y_sub", d: "M 829.56604 743.427856 L 829.552795 726.284058 L 810.836487 700.769165 L 822.576233 700.760132 L 834.639832 717.894653 L 835.074646 717.894287 L 847.111755 700.741211 L 858.29248 700.732605 L 839.615479 726.276306 L 839.628662 743.420105 Z" }
];

function ImproveLogoCenterDesign() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none z-30">
      {/* Official Productivity Logo SVG (Monogram P + PRODUCTIVITY vector paths) scaled to fit frame */}
      <svg
        viewBox="140 250 730 510"
        className="w-full max-w-[500px] sm:max-w-[620px] h-auto overflow-visible"
      >
        {/* 1. Official Neon Pink Monogram P (Shadowless) */}
        <path
          fill="#FF02E8"
          fillRule="evenodd"
          d={PRODUCTIVITY_MONOGRAM_P}
        />

        {/* 2. Official White PRODUCTIVITY Letter Paths (Shadowless) */}
        {PRODUCTIVITY_TEXT_PATHS.map((item) => (
          <path
            key={item.id}
            fill="#FFFFFF"
            fillRule="evenodd"
            d={item.d}
          />
        ))}
      </svg>
    </div>
  );
}

function SideRuler({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        [side]: "1.4vh",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.1vh",
        height: "56vh",
        justifyContent: "center",
        pointerEvents: "none",
      } as CSSProperties}
    >
      {Array.from({ length: 13 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i % 4 === 0 ? "1.4vh" : "0.7vh",
            height: 1,
            background: "rgba(255,255,255,0.25)",
          }}
        />
      ))}
      <span
        style={{
          position: "absolute",
          [side]: "-2.4vh",
          writingMode: "vertical-rl",
          transform: side === "left" ? "rotate(180deg)" : "none",
          fontFamily: SANS,
          fontSize: "0.95vh",
          fontWeight: 600,
          letterSpacing: "0.35em",
          color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
        } as CSSProperties}
      >
        {TICK_LABELS.join(" · ")}
      </span>
    </div>
  );
}

/* ═══════════════════════ Default Export Component ═══════════════════════ */

export function Component() {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-black/60 text-white border border-zinc-800")}>
      <h1 className="text-2xl font-bold mb-2">Component Example</h1>
      <h2 className="text-xl font-semibold">{count}</h2>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-zinc-800 rounded" onClick={() => setCount((prev) => prev - 1)}>-</button>
        <button className="px-3 py-1 bg-[#FF02E8] rounded" onClick={() => setCount((prev) => prev + 1)}>+</button>
      </div>
    </div>
  );
}

/* Main Hero Orbiting Component exported for Productivity Showcase */
export default function JellyfishDrift({ centerMode = "logo" }: { centerMode?: "logo" | "jellyfish" }) {
  return (
    <section
      suppressHydrationWarning
      className="jelly-loop"
      style={{
        position: "relative",
        height: "80vh",
        width: "100%",
        overflow: "hidden",
        background:
          "radial-gradient(125% 120% at 50% 28%, #0C0714 0%, #07050A 46%, #050307 74%, #020104 100%)",
        fontFamily: SANS,
      }}
    >
      <style>{JELLY_CSS}</style>

      {/* ── Giant 3D Orbiting Word Ring — Choreographed 3D stage.
            Words rotate in center (0s-1.5s), rise slowly over 5.2s, reaching top position (-22vh) at 6.7s. ─────────── */}
      <motion.div
        initial={{ y: "0vh", opacity: 0 }}
        animate={{ y: "-22vh", opacity: 1 }}
        transition={{
          y: { duration: 5.2, delay: 1.5, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 1.2, delay: 0.2, ease: "easeOut" },
        }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          perspective: `${PERSP}px`,
          perspectiveOrigin: "50% 18%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          className="jelly-stage"
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            animation: `jelly-orbit ${LOOP}s linear infinite`,
            willChange: "transform",
          }}
        >
          {PHRASES.map((p, i) => (
            <span
              key={`${p}-${i}`}
              className="jelly-phrase"
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: "22vh",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                whiteSpace: "nowrap",
                color: "rgba(255,255,255,0.85)",
                opacity: 0,
                transform: `rotateY(${(i * RING_STEP).toFixed(2)}deg) translateZ(${RING_R}px) rotateY(180deg) translateY(0vh)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                animation: `jelly-fade ${LOOP}s linear ${(
                  (-LOOP * ((RING_N - i) % RING_N)) / RING_N -
                  LOOP / 2
                ).toFixed(3)}s infinite`,
                willChange: "opacity",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: `jelly-rise ${LOOP}s linear ${(
                    (-LOOP * ((RING_N - i) % RING_N)) / RING_N -
                    LOOP / 2
                  ).toFixed(3)}s infinite`,
                  willChange: "transform",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: "scaleX(0.85)",
                    transformOrigin: "center",
                    textShadow: "0 0 24px rgba(255,2,232,0.25)",
                  }}
                >
                  {p}
                </span>
              </span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Floating Ambient Sparks ────────────────────────────────────────── */}
      {[
        { left: "22%", size: "0.9vh", delay: "0s", dur: "13s" },
        { left: "71%", size: "1.4vh", delay: "4s", dur: "16s" },
        { left: "58%", size: "0.7vh", delay: "8s", dur: "11s" },
        { left: "38%", size: "1.1vh", delay: "6s", dur: "15s" },
      ].map((b, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-4vh",
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: "rgba(255,2,232,0.4)",
            boxShadow: "0 0 12px rgba(255,2,232,0.7)",
            zIndex: 15,
            animation: `jelly-bubble ${b.dur} linear ${b.delay} infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* ── Center Hub: App Logo Design (Letters) or 3D Jellyfish
            Bigger & closer to letters: Logo starts at 2.0s, glides down slowly over 5.5s to land at 7.5s. ──── */}
      <motion.div
        initial={{ y: "-40vh", opacity: 0 }}
        animate={{ y: "-5vh", opacity: 1 }}
        transition={{ duration: 5.5, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          left: "50%",
          top: "43%",
          x: "-50%",
          y: "-50%",
          width: "min(50vh, 68vw)",
          height: "50vh",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {centerMode === "logo" ? (
          <ImproveLogoCenterDesign />
        ) : (
          <Jellyfish3D loop={LOOP} />
        )}
      </motion.div>



      {/* ── Side Rulers ────────────────────────────────────────────────────── */}
      <SideRuler side="left" />
      <SideRuler side="right" />

      {/* ── Micro Graphics ─────────────────────────────────────────────────── */}
      {[
        { left: "12%", top: "30%", size: 6, dur: "17s", delay: "0s" },
        { left: "86%", top: "62%", size: 5, dur: "21s", delay: "-6s" },
        { left: "78%", top: "26%", size: 4, dur: "14s", delay: "-3s" },
      ].map((s, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: "#FF02E8",
            zIndex: 35,
            animation: `jelly-mark ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}



      {/* ── Film grain overlay ────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 60,
          pointerEvents: "none",
          backgroundImage: `url("${GRAIN}")`,
          backgroundSize: "140px 140px",
          opacity: 0.05,
          mixBlendMode: "overlay",
        }}
      />
    </section>
  );
}

/* Keyframe animations */
const JELLY_CSS = `
@keyframes jelly-orbit{
  from{transform:rotateY(0deg)}
  to{transform:rotateY(-360deg)}
}

@keyframes jelly-fade{
  0%{opacity:1}
  10%{opacity:1}
  21%{opacity:0}
  79%{opacity:0}
  90%{opacity:1}
  100%{opacity:1}
}

@keyframes jelly-rise{
  0%{transform:translateY(0)}
  21%{transform:translateY(0)}
  50%{transform:translateY(32vh)}
  78%{transform:translateY(32vh);animation-timing-function:ease-out}
  87%{transform:translateY(0)}
  100%{transform:translateY(0)}
}

@keyframes jelly-manifesto{
  0%,74%{opacity:0;transform:translateY(-50%) translateX(2vw)}
  81%{opacity:1;transform:translateY(-50%) translateX(0)}
  92%{opacity:1;transform:translateY(-50%) translateX(0)}
  98%,100%{opacity:0;transform:translateY(-50%) translateX(2vw)}
}

@keyframes jelly-mark{
  0%,100%{transform:translate(0,0)}
  50%{transform:translate(-1.4vw,2vh)}
}

@keyframes jelly-bubble{
  0%{transform:translateY(0) translateX(0);opacity:0}
  12%{opacity:.7}
  80%{opacity:.5}
  100%{transform:translateY(-108vh) translateX(2vh);opacity:0}
}

@keyframes jelly-caption{
  0%{opacity:0}
  4%,28%{opacity:1}
  33%,100%{opacity:0}
}

@media (prefers-reduced-motion: reduce){
  .jelly-loop *{
    animation-duration:.001ms !important;
    animation-iteration-count:1 !important;
  }
  .jelly-loop .jelly-stage{
    animation:none !important;
    transform:rotateY(0deg) !important;
  }
  .jelly-loop .jelly-phrase{
    animation:none !important;
    opacity:0 !important;
  }
  .jelly-loop .jelly-phrase:first-of-type{
    opacity:1 !important;
  }
}
`;
