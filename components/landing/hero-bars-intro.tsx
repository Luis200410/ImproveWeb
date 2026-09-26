"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface HeroBarItem {
  id: string;
  letterKey: string;
  color: string;
  x: number;
  width: number;
  stoneY: number;
  stoneHeight: number;
  paths: string[];
}

// Exact letters and spacing extracted directly from public/FilledWeb.svg (ViewBox: 80 500 2860 880)
export const HERO_FILLED_WEB_ITEMS: HeroBarItem[] = [
  {
    id: "letter-I",
    letterKey: "I",
    color: "#cc0000",
    x: 113.9,
    width: 99.2,
    stoneY: 748.5,
    stoneHeight: 465.0,
    paths: [
      "M 114.259842 1213.482422 L 113.934723 748.670532 L 212.787125 748.586548 L 213.112244 1213.39856 Z",
    ],
  },
  {
    id: "letter-M",
    letterKey: "M",
    color: "#6f1bd3",
    x: 245.6,
    width: 550.9,
    stoneY: 748.5,
    stoneHeight: 465.0,
    paths: [
      "M 245.974731 1213.447998 L 245.623993 748.985107 L 409.931122 748.855835 L 489.608643 979.334717 C 492.264893 987.445435 495.474854 997.696655 499.238525 1010.08844 C 503.002136 1022.480225 506.876404 1034.984497 510.861145 1047.601563 C 514.845886 1060.218506 518.166931 1071.483643 520.824646 1081.397461 L 526.124817 1081.393188 C 528.326721 1072.827881 531.189819 1062.571777 534.714417 1050.625122 C 538.239014 1038.678223 541.873596 1026.393555 545.618225 1013.770386 C 549.363098 1001.147278 552.998535 989.876648 556.524536 979.958069 L 635.190674 748.678833 L 796.185242 748.552002 L 796.536011 1213.015137 L 690.531433 1213.098389 L 690.347717 969.71167 C 690.337158 955.739502 690.546692 940.978394 690.976746 925.428345 C 691.406738 909.878174 691.837585 895.793091 692.269897 883.172729 C 692.701965 870.552124 692.915833 861.3125 692.911499 855.453125 L 687.611145 855.457397 C 685.849365 861.768555 683.316284 870.784912 680.012634 882.506226 C 676.70874 894.227417 673.18457 906.399414 669.439758 919.022583 C 665.694885 931.64563 662.280151 942.690674 659.195496 952.158264 L 567.301208 1213.195435 L 470.572052 1213.271484 L 377.620789 952.379639 C 374.521454 942.466309 371.090424 931.651978 367.327179 919.936157 C 363.563965 908.220703 360.242523 896.617432 357.362885 885.126221 C 354.483246 873.635132 351.715485 863.834351 349.059204 855.723633 L 343.75882 855.727661 C 344.207397 864.741699 344.65744 875.783691 345.108948 888.854248 C 345.560638 901.924805 345.9021 915.558472 346.133698 929.755981 C 346.365143 943.953369 346.485687 957.362 346.495392 969.982178 L 346.679138 1213.368774 Z",
    ],
  },
  {
    id: "letter-P",
    letterKey: "P",
    color: "#ff02e8",
    x: 830.1,
    width: 402.3,
    stoneY: 748.5,
    stoneHeight: 465.0,
    paths: [
      "M 830.412231 1216.447998 L 830.088989 751.477417 L 1096.138062 751.250122 C 1124.61438 751.225708 1149.026855 757.634644 1169.375977 770.476807 C 1189.72522 783.318848 1205.297729 801.128296 1216.093872 823.905029 C 1226.890015 846.681763 1232.298706 873.411133 1232.319946 904.093384 C 1232.340942 934.324341 1226.766113 961.062988 1215.595093 984.310059 C 1204.42395 1007.557129 1188.571533 1025.618774 1168.036621 1038.49585 C 1147.501953 1051.373047 1122.793457 1057.82373 1093.910278 1057.848145 L 928.544922 1057.989502 L 928.655029 1216.363647 Z M 928.484314 970.680969 L 1073.102783 970.557373 C 1092.629272 970.540527 1107.778564 964.662109 1118.550781 952.921326 C 1129.322998 941.180542 1134.701538 924.932495 1134.687256 904.17688 C 1134.677368 890.189331 1132.330322 878.459839 1127.645386 868.98877 C 1122.960571 859.51709 1116.039917 852.191162 1106.883179 847.01001 C 1097.726563 841.828735 1086.435913 839.244019 1073.011475 839.255493 L 928.393005 839.379395 Z",
    ],
  },
  {
    id: "letter-R",
    letterKey: "R",
    color: "#2254f5",
    x: 1260.1,
    width: 427.8,
    stoneY: 748.5,
    stoneHeight: 465.0,
    paths: [
      "M 1260.465454 1216.424072 L 1260.145386 751.469116 L 1541.927368 751.226196 C 1572.161621 751.200073 1597.159302 757.608032 1616.921265 770.450073 C 1636.68335 783.292114 1651.409058 800.763184 1661.099243 822.863037 C 1670.789429 844.963501 1675.643921 869.774536 1675.662964 897.297607 C 1675.683105 926.625366 1669.553711 953.137878 1657.27478 976.836365 C 1644.99585 1000.53479 1626.565918 1018.936646 1601.984253 1032.042358 L 1687.975952 1216.05542 L 1579.737915 1216.14856 L 1505.852905 1051.075562 L 1357.705688 1051.203369 L 1357.819458 1216.340088 Z M 1357.646484 965.25116 L 1520.306152 965.110718 C 1538.043579 965.09552 1551.846191 959.105103 1561.714478 947.139893 C 1571.582886 935.174683 1576.51001 919.265869 1576.496338 899.413574 C 1576.487671 886.779907 1574.262939 875.840454 1569.822266 866.594849 C 1565.38147 857.349121 1559.027466 850.361206 1550.760376 845.630737 C 1542.493042 840.900513 1532.312622 838.540283 1520.218994 838.550903 L 1357.559448 838.691284 Z",
    ],
  },
  {
    id: "letter-O",
    letterKey: "O",
    color: "#43b752",
    x: 1687.7,
    width: 455.7,
    stoneY: 748.5,
    stoneHeight: 465.0,
    paths: [
      "M 1915.494385 1213.447754 C 1868.611206 1213.489136 1828.107178 1204.697754 1793.981079 1187.073364 C 1759.85498 1169.449219 1733.632813 1143.427002 1715.313599 1109.006104 C 1696.994629 1074.585571 1687.818115 1032.093018 1687.784058 981.527588 C 1687.749756 930.526001 1696.868774 887.799438 1715.141357 853.346558 C 1733.414063 818.893555 1759.601196 792.824829 1793.703491 775.140625 C 1827.805786 757.456299 1868.297852 748.593506 1915.181152 748.552002 C 1962.445557 748.510376 2003.140259 757.301392 2037.266357 774.925781 C 2071.392334 792.550293 2097.614746 818.572388 2115.933594 852.993164 C 2134.252686 887.41394 2143.429443 930.124146 2143.463867 981.125793 C 2143.497803 1031.691406 2134.378662 1074.199951 2116.105957 1108.652832 C 2097.833252 1143.106079 2071.64624 1169.174316 2037.543945 1186.858887 C 2003.44165 1204.543091 1962.758789 1213.406006 1915.494385 1213.447754 Z M 1915.437622 1129.099487 C 1936.020508 1129.081299 1954.504639 1126.013916 1970.890625 1119.896729 C 1987.276611 1113.779419 2001.278198 1104.831055 2012.895752 1093.05127 C 2024.513184 1081.271484 2033.460693 1066.660645 2039.738037 1049.218872 C 2046.015625 1031.776978 2049.146973 1011.940369 2049.131836 989.708984 L 2049.119873 972.054871 C 2049.104736 949.387451 2045.946533 929.447754 2039.645752 912.234985 C 2033.344971 895.022095 2024.37793 880.536133 2012.744385 868.776611 C 2001.111084 857.017456 1987.097534 848.093628 1970.703369 842.005493 C 1954.309204 835.917236 1935.820923 832.881958 1915.238037 832.900269 C 1895.036377 832.918213 1876.742676 835.985352 1860.356689 842.102905 C 1843.970825 848.219971 1829.969238 857.168213 1818.351685 868.94812 C 1806.734131 880.728027 1797.881958 895.229492 1791.794922 912.453369 C 1785.707886 929.677124 1782.671997 949.62262 1782.687378 972.289551 L 1782.699219 989.944092 C 1782.714233 1012.175293 1785.776855 1032.006226 1791.887329 1049.437256 C 1797.997681 1066.868286 1806.869385 1081.463257 1818.502808 1093.222656 C 1830.136353 1104.981934 1844.149902 1113.905518 1860.544067 1119.993896 C 1876.938354 1126.082031 1895.23584 1129.117432 1915.437622 1129.099487 Z",
    ],
  },
  {
    id: "letter-V",
    letterKey: "V",
    color: "#ff6900",
    x: 2167.2,
    width: 320.5,
    stoneY: 748.5,
    stoneHeight: 465.0,
    paths: [
      // Left bar of "II"
      "M 2167.557617 1215.736084 L 2167.231934 750.924316 L 2266.234375 750.839966 L 2266.560059 1215.6521 Z",
      // Right bar of "II"
      "M 2388.741455 1215.736084 L 2388.416016 750.924316 L 2487.418213 750.839966 L 2487.743896 1215.6521 Z",
    ],
  },
  {
    id: "letter-E",
    letterKey: "E",
    color: "#efb219",
    x: 2517.2,
    width: 391.6,
    stoneY: 748.5,
    stoneHeight: 465.0,
    paths: [
      "M 2517.515381 1216.144043 L 2517.187988 751.647705 L 2904.12207 751.321533 L 2904.183838 839.217407 L 2616.764893 839.459839 L 2616.833008 936.145386 L 2870.874268 935.931152 L 2870.935303 1022.474854 L 2616.894043 1022.689026 L 2616.968506 1128.164185 L 2908.714111 1127.918213 L 2908.775879 1215.814209 Z",
    ],
  },
];

export default function HeroBarsIntro() {
  // Kinetic Sequence Stages:
  // 1. 'stones'   (0ms - 2200ms): Logo stones plunge in from top (0.55s) and hold steadily in place
  // 2. 'dropping' (2200ms - 2900ms): The stones drop downwards out of frame like heavy falling blocks
  // 3. 'revealed' (2600ms): The authentic letters emerge in place with the exact spacing of FilledWeb.svg
  // 4. 'vCollided' (3800ms): After a deliberate hold where "I M P R O | | E" is read,
  //    the two orange bars accelerate inwards, strike together at the base, and their heads whip back into "V"
  const [animationStage, setAnimationStage] = useState<"stones" | "dropping" | "revealed">("stones");
  const [isVCollided, setIsVCollided] = useState<boolean>(false);
  const [replayKey, setReplayKey] = useState<number>(0);
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  useEffect(() => {
    setAnimationStage("stones");
    setIsVCollided(false);

    // Step 1: Stones hold steadily in place after landing, then plunge down through bottom at 2200ms
    const timer1 = setTimeout(() => {
      setAnimationStage("dropping");
    }, 2200);

    // Step 2: As stones drop, authentic letters emerge in place
    const timer2 = setTimeout(() => {
      setAnimationStage("revealed");
    }, 2600);

    // Step 3: After letters are fully viewed, the two "I I" bars collide in a smooth, cinematic, physical motion
    const timer3 = setTimeout(() => {
      setIsVCollided(true);
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [replayKey]);

  const handleHeroClick = () => {
    setReplayKey((k) => k + 1);
  };

  return (
    <section
      onClick={handleHeroClick}
      className="relative w-full h-[92vh] min-h-[640px] max-h-[1140px] bg-black text-white flex flex-col justify-center items-center overflow-hidden select-none cursor-pointer"
      title="Click anywhere to replay animation"
    >
      {/* 
        Significantly Enlarged Monumental Container:
        Spans nearly the entire width and height of the viewport so IMPROVE is grand, bold, and commanding.
      */}
      <div className="relative w-full max-w-[96vw] xl:max-w-[1600px] 2xl:max-w-[1780px] h-[78vh] min-h-[520px] max-h-[860px] flex items-center justify-center px-2 sm:px-4 md:px-6">
        
        {/* 
          Unified SVG Canvas:
          Uses the exact coordinate space and authentic spacing from public/FilledWeb.svg!
          Both the dropping stones and the revealed letters share the exact same mathematical grid.
        */}
        <svg
          key={`canvas-${replayKey}`}
          viewBox="80 500 2860 880"
          className="w-full h-auto max-h-[72vh] sm:max-h-[76vh] md:max-h-[82vh] overflow-visible select-none pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 
            Layer 1: The 7 Falling Logo Stones
            - Take the EXACT horizontal slots and spacing of the letters from FilledWeb.svg
            - Crisp, flat, 100% solid logo colors with ZERO white shadows and sharp unrounded edges
            - Plunge down from top of the screen to the place of the letters
            - Hold in place to show the logo
            - Plunge downwards out of the frame like falling stones
          */}
          <g id="falling-stones-layer">
            {HERO_FILLED_WEB_ITEMS.map((item, idx) => {
              const enterDelay = idx * 0.035;
              const dropDelay = idx * 0.04;

              return (
                <AnimatePresence key={`stone-${item.id}`}>
                  {animationStage !== "revealed" && (
                    <motion.g
                      initial={{ y: -1600, opacity: 0 }}
                      animate={
                        animationStage === "stones"
                          ? {
                              y: 0,
                              opacity: 1,
                              transition: {
                                duration: 0.55,
                                delay: enterDelay,
                                ease: [0.16, 1, 0.3, 1],
                              },
                            }
                          : {
                              // Drop downwards out of frame
                              y: 1600,
                              opacity: [1, 1, 0],
                              transition: {
                                duration: 0.7,
                                delay: dropDelay,
                                ease: [0.55, 0.055, 0.675, 0.19], // Heavy gravity acceleration drop
                              },
                            }
                      }
                      exit={{ y: 1600, opacity: 0 }}
                    >
                      {item.letterKey === "V" ? (
                        <>
                          <rect
                            x={2167.2}
                            y={item.stoneY}
                            width={99.3}
                            height={item.stoneHeight}
                            fill={item.color}
                            stroke="none"
                          />
                          <rect
                            x={2388.4}
                            y={item.stoneY}
                            width={99.3}
                            height={item.stoneHeight}
                            fill={item.color}
                            stroke="none"
                          />
                        </>
                      ) : (
                        <rect
                          x={item.x}
                          y={item.stoneY}
                          width={item.width}
                          height={item.stoneHeight}
                          fill={item.color}
                          stroke="none"
                        />
                      )}
                    </motion.g>
                  )}
                </AnimatePresence>
              );
            })}
          </g>

          {/* 
            Layer 2: The Monumental Letters
            - Exact letter paths and kerning from public/FilledWeb.svg
            - Flat, authentic brand colors (no white shadows, no blur)
            - Emerge as stones plunge through bottom
            - In position 6 ("V"), the two orange bars "| |" start separated,
              then deliberately accelerate inwards, strike with physical recoil, and form the "V"
          */}
          <g id="revealed-letters-layer">
            {HERO_FILLED_WEB_ITEMS.map((item, idx) => {
              const isHovered = hoveredLetter === item.id;
              const isVColumn = item.letterKey === "V";

              return (
                <motion.g
                  key={`letter-group-${item.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={
                    animationStage === "revealed"
                      ? {
                          opacity: 1,
                          scale: isHovered ? 1.03 : 1,
                          transition: {
                            duration: 0.45,
                            delay: idx * 0.03,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                      : { opacity: 0, scale: 0.95 }
                  }
                  style={{
                    transformOrigin: `${item.x + item.width / 2}px 982px`,
                  }}
                  className="pointer-events-auto cursor-pointer"
                  onMouseEnter={() => setHoveredLetter(item.id)}
                  onMouseLeave={() => setHoveredLetter(null)}
                >
                  {!isVColumn ? (
                    // Letters: I, M, P, R, O, E
                    item.paths.map((pathD, pIdx) => (
                      <path
                        key={`path-${item.id}-${pIdx}`}
                        d={pathD}
                        fill={item.color}
                        stroke="none"
                      />
                    ))
                  ) : (
                    // Letter "V" (Second Brain Pillar):
                    // Starts as two distinct parallel bars "| |" at the exact positions in FilledWeb.svg
                    // Vertex is at (2327.5px, 1215.7px)
                    // Slow, deliberate physical collision:
                    // Wind-up -> accelerate inwards -> base collision -> heads whip back outward -> settle into "V"
                    <g id="letter-V-colliding">
                      {/* 
                        Left Bar of "II":
                        Vertex pivot: bottom-right corner at (2266.6px, 1215.7px).
                        Rushes right by +60.9px to hit vertex, head whips back to -18° before settling at -14.5°.
                      */}
                      <motion.g
                        animate={
                          isVCollided
                            ? {
                                x: [0, -25, 62, 60.9],
                                rotate: [0, 0, -18, -14.5],
                                transition: {
                                  duration: 2.2, // Slow, deliberate, clearly readable and cinematic
                                  times: [0, 0.25, 0.70, 1],
                                  ease: [0.22, 1, 0.36, 1],
                                },
                              }
                            : {
                                x: 0,
                                rotate: 0,
                              }
                        }
                        style={{ transformOrigin: "2266.6px 1215.7px" }}
                      >
                        <path d={item.paths[0]} fill={item.color} stroke="none" />
                      </motion.g>

                      {/* 
                        Right Bar of "II":
                        Vertex pivot: bottom-left corner at (2388.7px, 1215.7px).
                        Rushes left by -60.9px to hit vertex, head whips back to +18° before settling at +14.5°.
                      */}
                      <motion.g
                        animate={
                          isVCollided
                            ? {
                                x: [0, 25, -62, -60.9],
                                rotate: [0, 0, 18, 14.5],
                                transition: {
                                  duration: 2.2, // Slow, deliberate, clearly readable and cinematic
                                  times: [0, 0.25, 0.70, 1],
                                  ease: [0.22, 1, 0.36, 1],
                                },
                              }
                            : {
                                x: 0,
                                rotate: 0,
                              }
                        }
                        style={{ transformOrigin: "2388.7px 1215.7px" }}
                      >
                        <path d={item.paths[1]} fill={item.color} stroke="none" />
                      </motion.g>
                    </g>
                  )}
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}


