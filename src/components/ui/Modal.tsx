'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullscreen?: boolean;
}

export function Modal({ isOpen, onClose, title, children, fullscreen = false }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 animate-fade-in">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
          onClick={onClose}
        />
        <div className="relative bg-white w-full h-full overflow-hidden flex flex-col animate-fade-in">
          {title && (
            <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-border/60 bg-gradient-to-r from-white via-surface/20 to-white">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h2>
              <button 
                onClick={onClose} 
                className="text-muted hover:text-foreground hover:bg-surface/50 rounded-lg p-2 transition-all duration-200 text-3xl leading-none w-10 h-10 flex items-center justify-center"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
          )}
          <div className="p-6 md:p-8 lg:p-10 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-border/50 animate-fade-in">
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-gradient-to-r from-white to-surface/30">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-muted hover:text-foreground hover:bg-surface/50 rounded-lg p-1.5 transition-all duration-200 text-2xl leading-none w-8 h-8 flex items-center justify-center"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
