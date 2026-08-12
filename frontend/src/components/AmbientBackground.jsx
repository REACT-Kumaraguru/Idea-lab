import React from 'react';

const AmbientBackground = ({ height = "fixed inset-0" }) => {
  return (
    <div className={`fixed inset-0 ${height} z-0 overflow-hidden pointer-events-none select-none`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-125 saturate-90 transition-transform duration-10000 ease-out"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0809]/50 via-[#0a0809]/65 to-[#0a0809]/70" />
      <div className="absolute inset-0 serene-rainbow-overlay opacity-30" />
      <div className="absolute inset-0 spectral-prism-shimmer opacity-20" />
    </div>
  );
};

export default AmbientBackground;
