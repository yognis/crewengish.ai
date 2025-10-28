"use client";

import { Brain, RefreshCw, SkipForward, AlertCircle } from "lucide-react";

interface EvaluationErrorProps {
  onRetry: () => void;
  onSkip?: () => void;
  className?: string;
  isRetrying?: boolean;
  errorType?: "ai_unavailable" | "transcription_failed" | "api_error";
}

/**
 * EvaluationError displays when AI evaluation fails.
 * Shows specific error messages and recovery options.
 */
export function EvaluationError({
  onRetry,
  onSkip,
  className = "",
  isRetrying = false,
  errorType = "ai_unavailable",
}: EvaluationErrorProps) {
  const getErrorMessage = () => {
    switch (errorType) {
      case "transcription_failed":
        return {
          title: "Ses Tanıma Başarısız",
          description:
            "Sesiniz anlaşılabilir şekilde kaydedilemedi. Lütfen daha net konuşarak tekrar deneyin.",
          tips: [
            "Sessiz bir ortamda olduğunuzdan emin olun",
            "Mikrofona yakın ve net konuşun",
            "Arka plan gürültüsünü azaltın",
          ],
        };
      case "api_error":
        return {
          title: "Sistem Hatası",
          description:
            "Beklenmeyen bir hata oluştu. Lütfen bir süre bekleyip tekrar deneyin.",
          tips: [
            "Birkaç saniye bekleyin",
            "İnternet bağlantınızı kontrol edin",
            "Sorun devam ederse destek ekibine başvurun",
          ],
        };
      default:
        return {
          title: "AI Değerlendirme Başarısız",
          description:
            "OpenAI servisi geçici olarak kullanılamıyor. Bu genellikle birkaç dakika içinde düzelir.",
          tips: [
            "Birkaç dakika bekleyip tekrar deneyin",
            "OpenAI servisleri yoğunluk nedeniyle geçici olarak yanıt veremeyebilir",
            "Sorun devam ederse bir sonraki soruya geçebilirsiniz",
          ],
        };
    }
  };

  const { title, description, tips } = getErrorMessage();

  return (
    <div
      className={`rounded-bubble border-2 border-error bg-score-poor p-6 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
            <Brain className="h-6 w-6 text-error" aria-hidden="true" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-error" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-score-poor-text">
              {title}
            </h3>
          </div>

          <p className="mt-2 text-score-poor-text">{description}</p>

          {/* Tips */}
          <div className="mt-4 rounded-lg bg-error/10 p-3">
            <p className="text-sm font-semibold text-score-poor-text">
              Öneriler:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-score-poor-text">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-thy-red px-6 py-3 font-semibold text-white transition-colors hover:bg-thy-darkRed focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Değerlendirmeyi tekrar dene"
            >
              <RefreshCw
                className={`h-5 w-5 ${isRetrying ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {isRetrying ? "Deneniyor..." : "Tekrar Dene"}
            </button>

            {onSkip && (
              <button
                onClick={onSkip}
                disabled={isRetrying}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-thy-gray bg-white px-6 py-3 font-semibold text-thy-gray transition-colors hover:bg-thy-lightGray focus:outline-none focus:ring-2 focus:ring-thy-gray focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Sonraki soruya geç"
              >
                <SkipForward className="h-5 w-5" aria-hidden="true" />
                Sonraki Soruya Geç
              </button>
            )}
          </div>

          {onSkip && (
            <p className="mt-3 text-xs text-score-poor-text">
              ⚠️ Sonraki soruya geçerseniz bu soru için puan alamazsınız.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
