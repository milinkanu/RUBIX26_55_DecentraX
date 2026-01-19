import React from 'react';

export function Link({ href, active, onClick, children }) {
  const baseClasses = "text-white transition-colors duration-200";
  const activeClasses = active ? "text-yellow-400" : "hover:text-yellow-400";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${activeClasses}`}
    >
      {children}
    </button>
  );
}