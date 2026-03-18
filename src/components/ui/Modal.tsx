'use client';

import React, { useEffect, useRef, useCallback, useId } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullscreen?: boolean;
}

export function Modal({ isOpen, onClose, title, children, fullscreen = false }: ModalProps) {
  const historyPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle browser back button for fullscreen modals
  useEffect(() => {
    if (!fullscreen || !isOpen) return;

    window.history.pushState({ modal: true }, '');
    historyPushedRef.current = true;

    const handlePopState = () => {
      historyPushedRef.current = false;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (historyPushedRef.current) {
        historyPushedRef.current = false;
        window.history.replaceState(null, '');
      }
    };
  }, [isOpen, fullscreen]);

  if (!isOpen) return null;

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[150] animate-fade-in" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white w-full h-full overflow-hidden flex flex-col animate-fade-in">
          {title && (
            <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b border-border/60 bg-gradient-to-r from-white via-surface/20 to-white">
              <h2 id={titleId} className="text-xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="text-muted hover:text-foreground hover:bg-surface/50 rounded-lg p-2 transition-all duration-200 text-3xl leading-none w-10 h-10 flex items-center justify-center"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
          )}
          <div className="p-4 md:p-8 lg:p-10 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-none md:rounded-2xl shadow-2xl max-w-lg w-full h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col border-0 md:border border-border/50 animate-fade-in">
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-gradient-to-r from-white to-surface/30">
            <h2 id={titleId} className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
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
