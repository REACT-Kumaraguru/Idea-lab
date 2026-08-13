import React, { useEffect, useRef, useState } from 'react';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";

const AmbientBackground = ({ height = "fixed inset-0" }) => {
  const videoA = useRef(null);
  const videoB = useRef(null);
  const [activeVideo, setActiveVideo] = useState('A');

  useEffect(() => {
    const vA = videoA.current;
    const vB = videoB.current;
    if (!vA || !vB) return;

    const interval = setInterval(() => {
      const current = activeVideo === 'A' ? vA : vB;
      const inactive = activeVideo === 'A' ? vB : vA;

      if (current && current.duration && current.currentTime >= current.duration - 1.2) {
        inactive.currentTime = 0;
        inactive.play().catch(() => {});
        setActiveVideo((prev) => (prev === 'A' ? 'B' : 'A'));
      }
    }, 200);

    return () => clearInterval(interval);
  }, [activeVideo]);

  return (
    <div className={`fixed inset-0 ${height} z-0 overflow-hidden pointer-events-none select-none bg-[#0a0809]`}>
      <video
        ref={videoA}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-125 saturate-90 transition-opacity duration-1000 ease-in-out ${
          activeVideo === 'A' ? 'opacity-100' : 'opacity-0'
        }`}
        src={VIDEO_SRC}
      />
      <video
        ref={videoB}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-125 saturate-90 transition-opacity duration-1000 ease-in-out ${
          activeVideo === 'B' ? 'opacity-100' : 'opacity-0'
        }`}
        src={VIDEO_SRC}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0809]/50 via-[#0a0809]/65 to-[#0a0809]/70" />
      <div className="absolute inset-0 serene-rainbow-overlay opacity-30" />
      <div className="absolute inset-0 spectral-prism-shimmer opacity-20" />
    </div>
  );
};

export default AmbientBackground;
