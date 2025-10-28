import React from "react";

export default function Loader({ fullScreen = false, size = "w-30 h-30" }) {
  const logo = (
    <img
      src="/logo.png"
      alt="Loading..."
      className={`${size} animate-bounce drop-shadow-lg`}
    />
  );

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        fullScreen ? "bg-black backdrop-blur-sm z-50" : "bg-transparent"
      }`}
    >
      {logo}
    </div>
  );
}
