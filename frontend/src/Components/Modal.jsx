import React from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'w-[320px]',
    md: 'w-[420px]',
    lg: 'w-[560px]',
  }[size] || 'w-[420px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a192f]/70 backdrop-blur-sm">
      <div className={`${sizeClass} bg-[#0a192f] border border-[#233554] rounded-xl p-6 shadow-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#f1faee] tracking-widest uppercase">{title}</h2>
          <button onClick={onClose} className="text-[#e63946] font-bold text-lg">X</button>
        </div>
        {children}
      </div>
    </div>
  );
}
