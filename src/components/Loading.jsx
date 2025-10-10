import React from "react";

export default function Loader({ fullScreen = false, size = "w-16 h-16" }) {
  const circle = (
    <div
      className={`
        ${size}
        rounded-full
        bg-gradient-to-r from-[var(--blue)] via-[var(--lightblue)] to-[var(--white)]
        animate-pulse
        shadow-lg shadow-[var(--blue)]/40
      `}
    ></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
        {circle}
      </div>
    );
  }

  return <div className="flex items-center justify-center">{circle}</div>;
}
