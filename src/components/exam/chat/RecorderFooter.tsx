"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Mic, RefreshCw } from "lucide-react";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface RecorderFooterProps {
  onSubmit: (audioBlob: Blob) => void | Promise<void>;
  disabled?: boolean;
}

export default function RecorderFooter({
  onSubmit,
  disabled = false,
}: RecorderFooterProps) {
  const {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    error,
  } = useAudioRecorder();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasRecording = useMemo(() => !!audioBlob, [audioBlob]);

  useEffect(() => {
    if (!audioBlob || isRecording) return;

    const submit = async () => {
      setIsSubmitting(true);
      try {
        await onSubmit(audioBlob);
        clearRecording();
      } catch (err) {
        console.error("[RecorderFooter] Submit error:", err);
      } finally {
        setIsSubmitting(false);
      }
    };

    submit();
  }, [audioBlob, isRecording, onSubmit, clearRecording]);

  const handleStartRecording = async () => {
    if (disabled || isRecording || isSubmitting) return;
    await startRecording();
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    stopRecording();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-50 bg-white shadow-lg"
      role="region"
      aria-label="Ses kaydı kontrolleri"
    >
      <div className="border-t border-gray-200 bg-white p-4 pb-safe">
        <div className="mx-auto max-w-4xl space-y-3">
          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {!isRecording && !isSubmitting && !hasRecording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={disabled}
              className="flex w-full max-w-xl items-center justify-center gap-2 rounded-lg bg-thy-red py-4 px-6 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 hover:bg-thy-red/90 focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2 sm:mx-auto"
              aria-label="Ses kaydını başlat"
            >
              <Mic className="h-5 w-5" aria-hidden="true" />
              <span className="text-base">Konuşmaya Başla</span>
            </button>
          ) : null}

          {isRecording ? (
            <div className="space-y-3" role="status" aria-live="polite">
              <div className="flex items-center justify-center gap-3 text-thy-red">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-thy-red/10">
                  <Mic className="h-6 w-6 animate-pulse" aria-hidden="true" />
                </span>
                <div className="text-center">
                  <p className="text-sm font-medium">Kayıt ediliyor...</p>
                  <p
                    className="font-mono text-xl font-bold tracking-wide"
                    aria-label={`Kayıt süresi ${formatDuration(duration)}`}
                  >
                    {formatDuration(duration)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full rounded-lg border-2 border-thy-red py-3 px-6 font-semibold text-thy-red transition hover:bg-thy-red/10 focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2"
                aria-label="Kaydı durdur ve gönder"
              >
                ⏸️ Durdur ve Gönder
              </button>
            </div>
          ) : null}

          {isSubmitting && (
            <div
              className="flex items-center justify-center gap-2 text-gray-600"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="text-sm">Değerlendiriliyor...</span>
            </div>
          )}

          {hasRecording && !isRecording && !isSubmitting && (
            <div
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
              role="status"
              aria-live="polite"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Kayıt hazır, gönderiliyor...
                </p>
                <p className="text-xs text-gray-500">
                  {formatDuration(duration)} süre
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearRecording();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2"
                aria-label="Kaydı sil ve tekrar kaydet"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Tekrar Kaydet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}