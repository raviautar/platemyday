'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Camera, Upload, X, Check, RotateCcw, ImagePlus, ScanSearch, AlertCircle } from 'lucide-react';

interface ImageIngredientScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onIngredientsDetected: (ingredients: string[]) => void;
}

type ScannerPhase = 'capture' | 'analyzing' | 'review';
type CaptureMode = 'camera' | 'upload';

const MAX_IMAGES = 10;
const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.8;
const MAX_RETRIES = 3;

function compressImage(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

function captureFrameFromVideo(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  let { videoWidth: width, videoHeight: height } = video;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

async function extractIngredients(
  images: string[],
): Promise<{ ingredients: string[] }> {
  const res = await fetch('/api/extract-ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export function ImageIngredientScanner({
  isOpen,
  onClose,
  onIngredientsDetected,
}: ImageIngredientScannerProps) {
  const [mode, setMode] = useState<CaptureMode>('camera');
  const [phase, setPhase] = useState<ScannerPhase>('capture');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const retryCountRef = useRef(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setCameraError(
        'Camera access denied. You can still upload photos from your gallery.',
      );
      setMode('upload');
    }
  }, []);

  useEffect(() => {
    if (isOpen && mode === 'camera' && phase === 'capture') {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode, phase, startCamera, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImages([]);
    setDetectedIngredients([]);
    setSelectedIngredients(new Set());
    setError(null);
    setPhase('capture');
    setMode('camera');
    setCameraError(null);
    retryCountRef.current = 0;
    onClose();
  }, [stopCamera, onClose]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !cameraReady) return;
    if (capturedImages.length >= MAX_IMAGES) return;

    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const dataUrl = captureFrameFromVideo(videoRef.current);
    setCapturedImages((prev) => [...prev, dataUrl]);
  }, [cameraReady, capturedImages.length]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remaining = MAX_IMAGES - capturedImages.length;
      const selected = Array.from(files).slice(0, remaining);

      try {
        const compressed = await Promise.all(selected.map(compressImage));
        setCapturedImages((prev) => [...prev, ...compressed]);
      } catch {
        setError('Some images could not be processed. Please try different photos.');
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [capturedImages.length],
  );

  const removeImage = useCallback((index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (capturedImages.length === 0) return;

    stopCamera();
    setPhase('analyzing');
    setError(null);
    retryCountRef.current = 0;

    const attemptExtract = async (): Promise<void> => {
      try {
        const { ingredients } = await extractIngredients(capturedImages);

        if (ingredients.length === 0) {
          setError(
            'No food ingredients detected. Try taking clearer, closer photos of your ingredients.',
          );
          setPhase('capture');
          return;
        }

        setDetectedIngredients(ingredients);
        setSelectedIngredients(new Set(ingredients));
        setPhase('review');
      } catch (err) {
        retryCountRef.current += 1;
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = 1000 * Math.pow(2, retryCountRef.current - 1);
          await new Promise((r) => setTimeout(r, delay));
          return attemptExtract();
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to analyze images. Please try again.',
        );
        setPhase('capture');
      }
    };

    await attemptExtract();
  }, [capturedImages, stopCamera]);

  const toggleIngredient = useCallback((ingredient: string) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selected = detectedIngredients.filter((i) =>
      selectedIngredients.has(i),
    );
    if (selected.length > 0) {
      onIngredientsDetected(selected);
    }
    handleClose();
  }, [detectedIngredients, selectedIngredients, onIngredientsDetected, handleClose]);

  const selectAll = useCallback(() => {
    setSelectedIngredients(new Set(detectedIngredients));
  }, [detectedIngredients]);

  const deselectAll = useCallback(() => {
    setSelectedIngredients(new Set());
  }, []);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Scan Ingredients" fullscreen>
      <div className="md:max-w-2xl md:mx-auto w-full h-full flex flex-col">
        {/* Analyzing state */}
        {phase === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ScanSearch className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Analyzing {capturedImages.length} photo{capturedImages.length !== 1 ? 's' : ''}...
              </p>
              <p className="text-sm text-muted">
                Identifying all food ingredients
              </p>
            </div>
            <LoadingSpinner />
          </div>
        )}

        {/* Review state */}
        {phase === 'review' && (
          <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Found {detectedIngredients.length} ingredient{detectedIngredients.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Select all
                </button>
                <span className="text-border">|</span>
                <button
                  onClick={deselectAll}
                  className="text-xs text-muted hover:text-foreground font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto -mx-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-1">
                {detectedIngredients.map((ingredient) => {
                  const selected = selectedIngredients.has(ingredient);
                  return (
                    <button
                      key={ingredient}
                      onClick={() => toggleIngredient(ingredient)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-left ${
                        selected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-white text-muted hover:border-primary/30'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="truncate">{ingredient}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => {
                  setPhase('capture');
                  setError(null);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold h-auto rounded-xl border-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedIngredients.size === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-bold h-auto rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Add {selectedIngredients.size} ingredient{selectedIngredients.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}

        {/* Capture state */}
        {phase === 'capture' && (
          <div className="flex-1 flex flex-col gap-4">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 bg-surface/60 rounded-xl">
              <button
                onClick={() => setMode('camera')}
                disabled={!!cameraError}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'camera'
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                } ${cameraError ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Camera className="w-4 h-4" />
                Camera
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setMode('upload');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'upload'
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>

            {/* Camera viewfinder */}
            {mode === 'camera' && (
              <div className="relative flex-1 min-h-0">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {flashEffect && (
                    <div className="absolute inset-0 bg-white/80 animate-in fade-in duration-100" />
                  )}
                  {!cameraReady && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>

                {/* Shutter button */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={handleCapture}
                    disabled={!cameraReady || capturedImages.length >= MAX_IMAGES}
                    className="w-16 h-16 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm shadow-lg active:scale-90 transition-transform disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center"
                    aria-label="Take photo"
                  >
                    <div className="w-12 h-12 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload zone */}
            {mode === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={capturedImages.length >= MAX_IMAGES}
                  className="flex flex-col items-center gap-3 px-8 py-10 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all text-center disabled:opacity-40"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ImagePlus className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Select photos
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Choose up to {MAX_IMAGES - capturedImages.length} images
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Thumbnail strip */}
            {capturedImages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted">
                    {capturedImages.length} / {MAX_IMAGES} photos
                  </p>
                  {mode === 'upload' && capturedImages.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Add more
                    </button>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {capturedImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border shadow-sm group"
                    >
                      <img
                        src={img}
                        alt={`Captured ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze button */}
            <div className="pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={capturedImages.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-bold h-auto rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <ScanSearch className="w-5 h-5" />
                Analyze {capturedImages.length > 0
                  ? `${capturedImages.length} photo${capturedImages.length !== 1 ? 's' : ''}`
                  : 'photos'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
