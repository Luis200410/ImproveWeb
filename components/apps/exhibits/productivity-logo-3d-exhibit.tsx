'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Play, Disc } from 'lucide-react'

// Verbatim, uncorrupted vector sub-paths extracted directly from public/Productivity Logo.svg
// Letters with inner counter cutouts (R, O, D) are represented as single compound path strings
// rendered with fillRule="evenodd" for 100% pixel-perfect vector accuracy.
const PRODUCTIVITY_TEXT_PATHS = [
  {
    id: "R_sub",
    label: "R",
    d: "M 277.617462 743.439697 L 277.584564 700.766602 L 306.530212 700.744324 C 309.635986 700.741943 312.203857 701.330017 314.233887 702.508667 C 316.263885 703.687256 317.77655 705.290771 318.771973 707.319092 C 319.767365 709.347412 320.266052 711.624573 320.268005 714.150635 C 320.27005 716.842285 319.640472 719.275574 318.37912 721.450562 C 317.117767 723.62561 315.224579 725.314514 312.699493 726.517334 L 321.532837 743.405884 L 310.414246 743.414429 L 302.824524 728.26416 L 287.606323 728.275879 L 287.618011 743.432007 Z M 287.60025 720.387268 L 304.309204 720.37439 C 306.131256 720.372986 307.549133 719.823242 308.562805 718.725098 C 309.576538 717.626953 310.082642 716.16687 310.081268 714.344788 C 310.080383 713.185303 309.851837 712.181274 309.395691 711.332764 C 308.939514 710.484131 308.286804 709.842773 307.437561 709.408691 C 306.588318 708.974487 305.542572 708.757935 304.300262 708.758911 L 287.591278 708.771729 Z"
  },
  {
    id: "O_sub",
    label: "O",
    d: "M 358.844421 744.169067 C 353.750946 744.172974 349.350494 743.337769 345.643005 741.663574 C 341.935486 739.989258 339.08667 737.517212 337.096436 734.247375 C 335.106262 730.977539 334.109283 726.940796 334.105591 722.137207 C 334.101837 717.292236 335.09256 713.233276 337.077728 709.960388 C 339.062897 706.687439 341.907898 704.210999 345.612854 702.531006 C 349.31778 700.009155 353.716919 700.009155 358.810364 700.005188 C 363.945251 700.001221 368.366364 700.836365 372.073883 702.51062 C 375.781403 704.184937 378.630219 706.656982 380.620422 709.926819 C 382.610657 713.196655 383.607605 717.254028 383.611359 722.09906 C 383.615021 726.902649 382.624298 730.940918 380.63916 734.213806 C 378.653961 737.486816 375.80896 739.963196 372.104034 741.643188 C 368.399139 743.32312 369.979279 744.1651 358.844421 744.169067 Z M 358.838226 736.156189 C 361.074371 736.15448 363.08252 735.863037 364.862732 735.281982 C 366.642914 734.700806 368.164063 733.850708 369.426208 732.731689 C 370.688385 731.612671 371.660431 730.224731 372.342438 728.567749 C 373.024414 726.910828 373.364594 725.026367 373.362976 722.914429 L 373.361694 721.237366 C 373.360046 719.084045 373.016937 717.189819 372.332397 715.554626 C 371.647888 713.919434 370.673676 712.543335 369.409821 711.426208 C 368.145935 710.309082 366.623474 709.461365 364.842377 708.882996 C 363.061279 708.304688 361.052673 708.016357 358.816528 708.018066 C 356.621796 708.019714 354.634338 708.311157 352.854156 708.892212 C 351.073975 709.473389 349.552826 710.323425 348.290649 711.442505 C 347.028503 712.561523 346.066772 713.939148 345.405487 715.575378 C 344.744202 717.211609 344.414368 719.106323 344.416046 721.259644 L 344.417297 722.936768 C 344.418945 725.048706 344.751678 726.932617 345.415527 728.588501 C 346.079376 730.244385 347.043213 731.630859 348.307098 732.747925 C 349.570984 733.865112 351.093414 734.712769 352.874512 735.291199 C 354.655579 735.869568 356.643463 736.157837 358.838226 736.156189 Z"
  },
  {
    id: "D_sub",
    label: "D",
    d: "M 401.521454 743.439697 L 401.488556 700.766602 L 421.738098 700.750977 C 426.583099 700.747314 430.735046 701.54126 434.194031 703.132813 C 437.653046 704.724487 440.305054 707.09314 442.150238 710.238892 C 443.995422 713.384644 444.91983 717.338562 444.923492 722.100708 C 444.927155 726.821533 444.00882 730.756165 442.168488 733.904785 C 440.328156 737.053345 437.679749 739.426086 434.223206 741.023071 C 430.766693 742.619995 426.615997 743.42041 421.770996 743.424072 Z M 411.515778 735.357056 L 421.454193 735.349365 C 423.483307 735.347778 425.305115 735.077271 426.919678 734.537659 C 428.534271 733.998108 429.910553 733.210205 431.048523 732.174072 C 432.186523 731.137939 433.06546 729.843262 433.685425 728.289917 C 434.30542 726.736511 434.614594 724.945313 434.613037 722.916199 L 434.611725 721.239136 C 434.610168 719.209961 434.298218 717.41925 433.675873 715.866821 C 433.053497 714.314453 432.172577 713.021057 431.032959 711.986694 C 429.893402 710.952271 428.5159 710.166626 426.900513 709.629517 C 425.285095 709.092407 423.46283 708.824646 421.433746 708.826233 L 411.495331 708.833862 Z"
  },
  {
    id: "U_sub",
    label: "U",
    d: "M 484.14328 744.169189 C 479.463928 744.172729 475.52948 743.451111 472.339752 742.004211 C 469.150024 740.557312 466.746643 738.447266 465.129486 735.674072 C 463.51239 732.900757 462.70224 729.505798 462.699158 725.489014 L 462.680115 700.767212 L 472.680664 700.759521 L 472.699402 725.108643 C 472.702118 728.62854 473.698059 731.350403 475.687256 733.274475 C 477.676392 735.198486 480.493011 736.159119 484.137115 736.156311 C 487.781219 736.153503 490.606689 735.188538 492.613617 733.261414 C 494.620514 731.33429 495.62262 728.61084 495.619873 725.090942 L 495.601135 700.741821 L 505.601685 700.734131 L 505.620697 725.455933 C 505.62381 729.472778 504.808563 732.868958 503.174988 735.644714 C 501.541443 738.420471 499.141327 740.53418 495.974548 741.985962 C 492.807739 743.437805 488.864075 744.165527 484.14328 744.169189 Z"
  },
  {
    id: "C_sub",
    label: "C",
    d: "M 547.290588 744.168213 C 542.114258 744.172241 537.765625 743.368103 534.244507 741.755798 C 530.723389 740.143494 528.060913 737.702393 526.25708 734.432373 C 524.453186 731.162354 523.549377 727.042786 523.545532 722.073486 C 523.539917 714.826782 525.575134 709.338379 529.651184 705.608276 C 533.727234 701.878235 539.574951 700.010315 547.194397 700.004395 C 551.459717 700.001099 555.238831 700.660767 558.531921 701.983398 C 561.825073 703.305969 564.404297 705.239868 566.269775 707.785156 C 568.135193 710.330444 569.069336 713.466553 569.072205 717.193481 L 559.195862 717.20105 C 559.194397 715.213379 558.685791 713.546997 557.670166 712.201965 C 556.654602 710.856934 555.24585 709.822754 553.44397 709.099487 C 551.64209 708.376221 549.540222 708.015503 547.138428 708.017334 C 544.239746 708.019531 541.796997 708.539063 539.810059 709.575806 C 537.823181 710.612671 536.323242 712.114868 535.310181 714.082642 C 534.29718 716.050415 533.791748 718.421509 533.793884 721.196045 L 533.795166 722.935242 C 533.797363 725.75116 534.306519 728.142151 535.322571 730.108398 C 536.338623 732.074585 537.840881 733.574524 539.829346 734.608276 C 541.817871 735.641968 544.261414 736.157715 547.160095 736.155457 C 549.686157 736.153564 551.870239 735.810181 553.712524 735.125488 C 555.554749 734.440857 556.982544 733.414856 557.996033 732.047546 C 559.009583 730.680176 559.515564 729.023438 559.514038 727.077148 L 569.141968 727.069702 C 569.144775 730.755249 568.22583 733.861694 566.38501 736.38916 C 564.544189 738.916565 561.988647 740.844116 558.718201 742.171753 C 555.447815 743.49939 551.638611 744.164917 547.290588 744.168213 Z"
  },
  {
    id: "T_sub1",
    label: "T",
    d: "M 599.412659 743.427612 L 599.386292 709.202209 L 583.174316 709.214722 L 583.167725 700.76709 L 625.65448 700.734314 L 625.661072 709.182007 L 609.448975 709.194458 L 609.475403 743.419922 Z"
  },
  {
    id: "I_sub1",
    label: "I",
    d: "M 642.161438 743.42749 L 642.12854 700.754395 L 652.12915 700.746704 L 652.161987 743.419739 Z"
  },
  {
    id: "V_sub",
    label: "V",
    d: "M 685.460693 743.42804 L 667.476501 700.768799 L 678.470886 700.760315 L 688.304382 725.785156 C 688.594727 726.44751 688.916321 727.244385 689.268982 728.175781 C 689.621704 729.1073 689.963989 730.00769 690.296021 730.877075 C 690.62793 731.746399 690.897705 732.512268 691.105225 733.174683 L 691.540039 733.174316 C 691.746643 732.55304 692.015259 731.81781 692.345886 730.968628 C 692.676514 730.119507 693.017456 729.239258 693.368774 728.328003 C 693.719971 727.416626 694.040222 726.567505 694.32959 725.780518 L 704.124451 700.74054 L 714.621887 700.732422 L 696.703491 743.419373 Z"
  },
  {
    id: "I_sub2",
    label: "I",
    d: "M 730.225464 743.42749 L 730.192566 700.754395 L 740.193115 700.746704 L 740.226013 743.419739 Z"
  },
  {
    id: "T_sub2",
    label: "T",
    d: "M 772.468689 743.427612 L 772.442322 709.202209 L 756.230286 709.214722 L 756.223755 700.76709 L 798.71051 700.734314 L 798.717041 709.182007 L 782.505005 709.194458 L 782.531372 743.419922 Z"
  },
  {
    id: "Y_sub",
    label: "Y",
    d: "M 829.56604 743.427856 L 829.552795 726.284058 L 810.836487 700.769165 L 822.576233 700.760132 L 834.639832 717.894653 L 835.074646 717.894287 L 847.111755 700.741211 L 858.29248 700.732605 L 839.615479 726.276306 L 839.628662 743.420105 Z"
  }
]

// Exact path vector for the Neon Pink Monogram P from public/Productivity Logo.svg
const PRODUCTIVITY_MONOGRAM_P = 'M 166.412201 744.447998 L 166.088974 279.477478 L 432.138092 279.250122 C 460.61441 279.225647 485.026917 285.634705 505.375977 298.476746 C 525.72522 311.318848 541.297668 329.128235 552.093872 351.905029 C 562.890076 374.681824 568.298706 401.411133 568.320007 432.093445 C 568.340942 462.324402 562.766113 489.062988 551.595154 512.310059 C 540.424011 535.557129 524.571472 553.618774 504.036652 566.49585 C 483.502014 579.372925 458.793457 585.82373 429.910278 585.848206 L 264.544952 585.989502 L 264.655029 744.363647 Z M 264.484283 498.680969 L 409.102783 498.557373 C 428.629303 498.540527 443.778503 492.662109 454.550751 480.921326 C 465.322968 469.180481 470.701569 452.932495 470.687317 432.176941 C 470.677429 418.18927 468.330383 406.4599 463.645386 396.988708 C 458.960602 387.517151 452.039978 380.191162 442.883148 375.009949 C 433.726501 369.828735 422.435974 367.24408 409.011505 367.255432 L 264.393036 367.379456 Z'

// Verbatim white letters for "IMPROVE" from public/logo.svg
const IMPROVE_LETTERS = [
  { char: 'I', x: 202, y: 401 },
  { char: 'M', x: 245, y: 401 },
  { char: 'P', x: 360, y: 401, isP: true },
  { char: 'R', x: 452, y: 401 },
  { char: 'O', x: 553, y: 401 },
  { char: 'V', x: 670, y: 401 },
  { char: 'E', x: 763, y: 401 },
]

export function ProductivityLogo3DExhibit() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'vinyl-crate-flip' | 'p-hit-slidedown' | 'black-pause' | 'reveal-3d'>('vinyl-crate-flip')
  const [isHovered, setIsHovered] = useState(false)
  const [introKey, setIntroKey] = useState(0)

  // Slow, deliberate multi-phase cinematic intro controller
  useEffect(() => {
    setPhase('vinyl-crate-flip')

    // Phase 1: Vinyl crate flipping zoom across IMPROVE (3.2 seconds)
    const t1 = setTimeout(() => {
      setPhase('p-hit-slidedown')
    }, 3200)

    // Phase 2: Lock onto P & slowly slide logo down (3.5 seconds)
    const t2 = setTimeout(() => {
      setPhase('black-pause')
    }, 6700)

    // Phase 3: Frame turns black for exactly 1.5 seconds (1.5 seconds)
    const t3 = setTimeout(() => {
      setPhase('reveal-3d')
    }, 8200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [introKey])

  // Interactive 3D mouse tilt spring physics (Active during reveal-3d phase)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), { stiffness: 140, damping: 16 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-22, 22]), { stiffness: 140, damping: 16 })
  const translateZ = useSpring(isHovered ? 30 : 0, { stiffness: 160, damping: 16 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const replayIntro = () => {
    setIntroKey(prev => prev + 1)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[1050px] lg:max-w-[1200px] aspect-[730/420] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[1400px] select-none py-2 mx-auto overflow-visible"
    >
      {/* Replay Intro Button Overlay */}
      {phase === 'reveal-3d' && (
        <button
          onClick={replayIntro}
          className="absolute -top-3 right-2 z-40 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-[#FF02E8]/30 border border-white/20 text-[11px] font-bold text-white transition-all backdrop-blur-md opacity-75 hover:opacity-100 shadow-lg"
        >
          <Disc className="w-3 h-3 text-[#FF02E8] animate-spin" />
          <span>Replay Vinyl Intro</span>
        </button>
      )}

      {/* 2D Cinematic Stage (Phases: vinyl-crate-flip, p-hit-slidedown) */}
      {phase !== 'reveal-3d' && phase !== 'black-pause' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none perspective-[1200px]">
          <svg viewBox="100 200 800 600" className="w-full h-full overflow-visible">
            
            {/* Phase 1: Slow Vinyl Crate Flipping Camera Zoom across IMPROVE */}
            {phase === 'vinyl-crate-flip' && (
              <motion.g
                initial={{ rotateX: 32, rotateY: -18, scale: 0.85, x: -180, opacity: 0 }}
                animate={{
                  rotateX: [32, 12, 0],
                  rotateY: [-18, 8, 0],
                  scale: [0.85, 1.25, 1],
                  x: [-180, -60, 0],
                  opacity: 1
                }}
                transition={{ duration: 3.2, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Vinyl Record Crate Shadow Base */}
                <ellipse cx="480" cy="480" rx="350" ry="40" fill="#FF02E8" opacity="0.15" className="blur-2xl" />

                {/* Letters of IMPROVE flipping forward slowly like vinyl record covers in a crate */}
                {IMPROVE_LETTERS.map((item, idx) => (
                  <motion.text
                    key={idx}
                    x={item.x}
                    y={item.y}
                    fontFamily="Archivo SemiExpanded, sans-serif"
                    fontSize="95"
                    fontWeight="800"
                    fill="#FFFFFF"
                    letterSpacing="-2"
                    initial={{ rotateY: -45, z: -100 - idx * 25, opacity: 0 }}
                    animate={{ rotateY: 0, z: 0, opacity: 1 }}
                    transition={{ duration: 1.4, delay: 0.2 + idx * 0.25, ease: [0.25, 1, 0.5, 1] }}
                    className="drop-shadow-[0_15px_30px_rgba(255,255,255,0.7)]"
                  >
                    {item.char}
                  </motion.text>
                ))}
              </motion.g>
            )}

            {/* Phase 2: Lock onto 'P', flash Pink #FF02E8, and SLOWLY slide down */}
            {phase === 'p-hit-slidedown' && (
              <g>
                {/* Word IMPROVE with P Glowing Neon Pink #FF02E8 */}
                {IMPROVE_LETTERS.map((item, idx) => (
                  <motion.text
                    key={idx}
                    x={item.x}
                    y={item.y}
                    fontFamily="Archivo SemiExpanded, sans-serif"
                    fontSize="95"
                    fontWeight="800"
                    fill={item.isP ? "#FF02E8" : "#FFFFFF"}
                    letterSpacing="-2"
                    initial={{ opacity: 1, scale: 1 }}
                    animate={item.isP ? {
                      scale: [1, 1.35, 1.1],
                      filter: ["drop-shadow(0 0 10px #FF02E8)", "drop-shadow(0 0 50px #FF02E8)", "drop-shadow(0 0 30px #FF02E8)"]
                    } : { opacity: 0.3 }}
                    transition={{ duration: 1.2 }}
                  >
                    {item.char}
                  </motion.text>
                ))}

                {/* Giant Monogram P slowly sliding down vertically from the P */}
                <motion.path
                  initial={{ y: -30, opacity: 0, scaleY: 0.4 }}
                  animate={{ y: 0, opacity: 1, scaleY: 1 }}
                  transition={{ duration: 2.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  fill="#FF02E8"
                  fillRule="evenodd"
                  d={PRODUCTIVITY_MONOGRAM_P}
                  className="drop-shadow-[0_0_40px_rgba(255,2,232,0.95)]"
                />

                {/* PRODUCTIVITY letters slowly sliding down into place underneath P */}
                {PRODUCTIVITY_TEXT_PATHS.map((item, idx) => (
                  <motion.path
                    key={item.id}
                    fill="#FFFFFF"
                    fillRule="evenodd"
                    d={item.d}
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.6, delay: 1.1 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="drop-shadow-[0_4px_15px_rgba(255,255,255,0.9)]"
                  />
                ))}
              </g>
            )}

          </svg>
        </div>
      )}

      {/* Phase 3: Frame Turns 100% Black for Exactly 1.5 Seconds */}
      {phase === 'black-pause' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-50 bg-black flex items-center justify-center rounded-2xl pointer-events-none"
        />
      )}

      {/* Phase 4: Slow 3D Reveal (phase === 'reveal-3d') */}
      {phase === 'reveal-3d' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, z: -150 }}
          animate={{ opacity: 1, scale: 1, z: 0 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            rotateX,
            rotateY,
            translateZ,
            transformStyle: 'preserve-3d'
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Ambient Backlight Halo Glow in Signature #FF02E8 */}
          <div className="absolute inset-0 bg-[#FF02E8]/25 blur-[90px] rounded-full pointer-events-none -z-10" />

          {/* 3D Depth Layer 3 (Back Volumetric Extrusion Glow) */}
          <motion.div
            style={{ transform: 'translateZ(-45px)' }}
            className="absolute inset-0 filter blur-xl opacity-60 pointer-events-none"
          >
            <svg viewBox="140 250 730 510" className="w-full h-full overflow-visible">
              <path fill="#FF02E8" fillRule="evenodd" d={PRODUCTIVITY_MONOGRAM_P} />
            </svg>
          </motion.div>

          {/* 3D Depth Layer 2 (Middle Dark 3D Bevel Extrusion) */}
          <div
            style={{ transform: 'translateZ(-22px)' }}
            className="absolute inset-0 opacity-75 pointer-events-none"
          >
            <svg viewBox="140 250 730 510" className="w-full h-full overflow-visible">
              <path fill="#8A007A" fillRule="evenodd" d={PRODUCTIVITY_MONOGRAM_P} />
            </svg>
          </div>

          {/* 3D Depth Layer 1 (Front Surface with Slow 3D Letter Entrance) */}
          <motion.div
            style={{ transform: 'translateZ(10px)' }}
            className="relative w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
          >
            <svg viewBox="140 250 730 510" className="w-full h-full overflow-visible">

              {/* 1. Official Neon Pink P Monogram */}
              <motion.path
                initial={{ scale: 0.8, opacity: 0, z: -150 }}
                animate={{ scale: 1, opacity: 1, z: 0 }}
                transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                fill="#FF02E8"
                fillRule="evenodd"
                d={PRODUCTIVITY_MONOGRAM_P}
                className="drop-shadow-[0_0_25px_rgba(255,2,232,0.95)]"
              />

              {/* 2. Official White Letter-by-Letter Slow Entrance */}
              {PRODUCTIVITY_TEXT_PATHS.map((item, idx) => (
                <motion.path
                  key={item.id}
                  fill="#FFFFFF"
                  fillRule="evenodd"
                  d={item.d}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: 30,
                    z: -60
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    z: 0
                  }}
                  transition={{
                    opacity: { duration: 1.2, delay: 0.4 + idx * 0.1, ease: 'easeOut' },
                    scale: { duration: 1.4, delay: 0.4 + idx * 0.1, ease: [0.16, 1, 0.3, 1] },
                    y: { duration: 1.2, delay: 0.4 + idx * 0.1, ease: 'easeOut' }
                  }}
                  className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)]"
                />
              ))}
            </svg>
          </motion.div>

        </motion.div>
      )}

    </div>
  )
}
