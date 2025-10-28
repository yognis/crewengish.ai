"use client";

import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";

interface NetworkErrorProps {
  onRetry: () => void;
  className?: string;
  message?: string;
}

/**
 * NetworkError displays when internet connection is lost or unstable.
 * Shows offline indicator and retry button.
 */
export function NetworkError({
  onRetry,
  className = "",
  message = "İnternet bağlantınız kesildi veya çok yavaş.",
}: NetworkErrorProps) {
  return (
    <div
      className={`rounded-bubble border-2 border-warning bg-score-fair p-6 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <WifiOff className="h-6 w-6 text-warning" aria-hidden="true" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-score-fair-text">
              Bağlantı Sorunu
            </h3>
          </div>

          <p className="mt-2 text-score-fair-text">{message}</p>

          <div className="mt-3 rounded-lg bg-warning/10 p-3">
            <p className="text-sm text-score-fair-text">
              <strong>Kontrol edin:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-score-fair-text">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Wi-Fi veya mobil veri bağlantınız açık mı?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>İnternet sinyaliniz güçlü mü?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Başka sitelere erişebiliyor musunuz?</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-lg bg-thy-red px-6 py-3 font-semibold text-white transition-colors hover:bg-thy-darkRed focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2"
            aria-label="Bağlantıyı tekrar dene"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
}
