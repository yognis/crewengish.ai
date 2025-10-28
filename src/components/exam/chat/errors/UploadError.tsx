"use client";

import { Upload, RefreshCw, SkipForward, AlertCircle } from "lucide-react";

interface UploadErrorProps {
  onRetry: () => void;
  onSkip?: () => void;
  currentAttempt?: number;
  maxAttempts?: number;
  className?: string;
  isRetrying?: boolean;
}

/**
 * UploadError displays when audio file upload fails.
 * Shows retry progress with exponential backoff and skip option as last resort.
 */
export function UploadError({
  onRetry,
  onSkip,
  currentAttempt = 1,
  maxAttempts = 3,
  className = "",
  isRetrying = false,
}: UploadErrorProps) {
  const showSkipOption = currentAttempt >= maxAttempts && onSkip;
  const progress = (currentAttempt / maxAttempts) * 100;

  return (
    <div
      className={`rounded-bubble border-2 border-error bg-score-poor p-6 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
            <Upload className="h-6 w-6 text-error" aria-hidden="true" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-error" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-score-poor-text">
              Yükleme Başarısız
            </h3>
          </div>

          <p className="mt-2 text-score-poor-text">
            Ses kaydınız sunucuya yüklenemedi. Lütfen tekrar deneyin.
          </p>

          {/* Retry Progress Bar */}
          {maxAttempts > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-score-poor-text">
                <span>Deneme {currentAttempt}/{maxAttempts}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-score-poor-border">
                <div
                  className="h-full bg-error transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Possible Causes */}
          <div className="mt-4 rounded-lg bg-error/10 p-3">
            <p className="text-sm font-semibold text-score-poor-text">
              Olası nedenler:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-score-poor-text">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>İnternet bağlantınız yavaş veya kesintili</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Dosya boyutu çok büyük olabilir</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Sunucu geçici olarak yoğun</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-thy-red px-6 py-3 font-semibold text-white transition-colors hover:bg-thy-darkRed focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Yüklemeyi tekrar dene"
            >
              <RefreshCw
                className={`h-5 w-5 ${isRetrying ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {isRetrying ? "Deneniyor..." : "Tekrar Dene"}
            </button>

            {showSkipOption && (
              <button
                onClick={onSkip}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-thy-gray bg-white px-6 py-3 font-semibold text-thy-gray transition-colors hover:bg-thy-lightGray focus:outline-none focus:ring-2 focus:ring-thy-gray focus:ring-offset-2"
                aria-label="Bu soruyu atla"
              >
                <SkipForward className="h-5 w-5" aria-hidden="true" />
                Atla
              </button>
            )}
          </div>

          {showSkipOption && (
            <p className="mt-3 text-xs text-score-poor-text">
              ⚠️ Atlarsanız bu soru için puan alamazsınız.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
