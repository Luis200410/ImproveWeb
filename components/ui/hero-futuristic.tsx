'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { Mesh } from 'three';

import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add
} from 'three/tsl';

const DEFAULT_TEXTUREMAP = 'https://i.postimg.cc/XYwvXN8D/img-4.png';
const DEFAULT_DEPTHMAP = 'https://i.postimg.cc/2SHKQh2q/raw-4.webp';

extend(THREE as any);

// Post Processing component
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    const postProcessing = new THREE.PostProcessing(gl as any);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    // Create the scanning effect uniform
    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    // Create a red overlay that follows the scan line
    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(1, 0, 0).mul(oneMinus(scanLine)).mul(0.4);

    // Mix the original scene with the red overlay
    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
    );

    // Add bloom effect after scan effect
    const final = withScanEffect.add(bloomPass);

    postProcessing.outputNode = final;

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    // Animate the scan line from top to bottom
    progressRef.current.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    render.renderAsync();
  }, 1);

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = ({ textureSrc = DEFAULT_TEXTUREMAP, depthSrc = DEFAULT_DEPTHMAP }: { textureSrc?: string; depthSrc?: string }) => {
  const [rawMap, depthMap] = useTexture([textureSrc, depthSrc]);

  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.01;

    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap;

    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = dot.mul(flow).mul(vec3(10, 0, 0));

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    if (meshRef.current && 'material' in meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as any;
      if ('opacity' in mat) {
        mat.opacity = THREE.MathUtils.lerp(
          mat.opacity,
          visible ? 1 : 0,
          0.07
        );
      }
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  const scaleFactor = 0.40;
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export interface HeroFuturisticProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  textureUrl?: string;
  depthUrl?: string;
  onExploreClick?: () => void;
  badgeText?: string;
}

export function HeroFuturistic({
  title = 'Build Your Dreams',
  subtitle = 'AI-powered creativity for the next generation.',
  ctaText = 'Scroll to explore',
  textureUrl = DEFAULT_TEXTUREMAP,
  depthUrl = DEFAULT_DEPTHMAP,
  onExploreClick,
  badgeText,
}: HeroFuturisticProps) {
  const [mounted, setMounted] = useState(false);
  const titleWords = title.split(' ');
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
  }, [titleWords.length]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 800);
      return () => clearTimeout(timeout);
    }
  }, [visibleWords, titleWords.length]);

  return (
    <div className="relative h-svh w-full overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* Overlay Typography & Content */}
      <div className="h-svh uppercase items-center w-full absolute z-[60] pointer-events-none px-6 md:px-10 flex justify-center flex-col text-center">
        {badgeText && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs tracking-widest font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {badgeText}
          </div>
        )}

        <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold tracking-tight">
          <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-6 overflow-hidden text-white">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={index < visibleWords ? 'animate-fade-in' : ''}
                style={{
                  animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                  opacity: index < visibleWords ? 1 : 0,
                  transition: 'opacity 0.5s ease-out'
                }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-4 overflow-hidden text-neutral-300 font-bold max-w-3xl">
          <div
            className={subtitleVisible ? 'animate-fade-in-subtitle' : ''}
            style={{
              animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
              opacity: subtitleVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-out'
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onExploreClick}
        className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 z-[70] inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs md:text-sm uppercase font-mono tracking-widest hover:bg-white hover:text-black transition-all duration-300 group shadow-2xl"
        style={{ animationDelay: '2.2s' }}
      >
        <span>{ctaText}</span>
        <span className="transition-transform group-hover:translate-y-1">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12L11 17L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      {/* 3D WebGPU Canvas - Client Mounted Guard */}
      {mounted && (
        <Canvas
          flat
          gl={async (props) => {
            const renderer = new THREE.WebGPURenderer(props as any);
            await renderer.init();
            return renderer;
          }}
        >
          <PostProcessing fullScreenEffect={true} />
          <Scene textureSrc={textureUrl} depthSrc={depthUrl} />
        </Canvas>
      )}
    </div>
  );
}

export default HeroFuturistic;
