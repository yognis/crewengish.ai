"use client";

import { AlertCircle, MicOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface MicPermissionErrorProps {
  onRetry: () => void;
  className?: string;
}

/**
 * MicPermissionError displays a helpful error message when microphone
 * permission is denied, with browser-specific instructions.
 */
export function MicPermissionError({
  onRetry,
  className = "",
}: MicPermissionErrorProps) {
  const [browser, setBrowser] = useState<"chrome" | "safari" | "firefox" | "other">("other");
  const [device, setDevice] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    // Detect browser
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
      setBrowser("chrome");
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      setBrowser("safari");
    } else if (userAgent.includes("firefox")) {
      setBrowser("firefox");
    }

    // Detect device
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDevice("ios");
    } else if (/android/.test(userAgent)) {
      setDevice("android");
    }
  }, []);

  const getInstructions = () => {
    if (device === "ios") {
      return (
        <ol className="mt-3 space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2 font-semibold">1.</span>
            <span>Safari &apos;Ayarlar&apos; &gt; &apos;Gizlilik ve Güvenlik&apos; &gt; &apos;Mikrofon&apos;</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">2.</span>
            <span>Bu siteye mikrofon erişimi izni verin</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">3.</span>
            <span>Sayfayı yenileyin ve tekrar deneyin</span>
          </li>
        </ol>
      );
    }

    if (device === "android") {
      return (
        <ol className="mt-3 space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2 font-semibold">1.</span>
            <span>Chrome menü (⋮) &gt; &apos;Ayarlar&apos; &gt; &apos;Site ayarları&apos;</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">2.</span>
            <span>&apos;Mikrofon&apos; seçeneğini bulun ve izin verin</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">3.</span>
            <span>Sayfayı yenileyin ve tekrar deneyin</span>
          </li>
        </ol>
      );
    }

    // Desktop instructions
    if (browser === "chrome") {
      return (
        <ol className="mt-3 space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2 font-semibold">1.</span>
            <span>Adres çubuğunun solundaki kilit ikonuna tıklayın</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">2.</span>
            <span>&apos;Site ayarları&apos; &gt; &apos;Mikrofon&apos; &gt; &apos;İzin ver&apos;</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">3.</span>
            <span>Sayfayı yenileyin</span>
          </li>
        </ol>
      );
    }

    if (browser === "safari") {
      return (
        <ol className="mt-3 space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2 font-semibold">1.</span>
            <span>Safari &gt; &apos;Tercihler&apos; &gt; &apos;Web Siteleri&apos; &gt; &apos;Mikrofon&apos;</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">2.</span>
            <span>Bu siteye &apos;İzin Ver&apos; seçeneğini seçin</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">3.</span>
            <span>Sayfayı yenileyin</span>
          </li>
        </ol>
      );
    }

    if (browser === "firefox") {
      return (
        <ol className="mt-3 space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2 font-semibold">1.</span>
            <span>Adres çubuğunun solundaki bilgi ikonuna tıklayın</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">2.</span>
            <span>&apos;İzinler&apos; &gt; &apos;Mikrofon&apos; &gt; Engeli kaldırın</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">3.</span>
            <span>Sayfayı yenileyin</span>
          </li>
        </ol>
      );
    }

    return (
      <p className="mt-3 text-sm">
        Tarayıcınızın ayarlarından bu siteye mikrofon erişimi izni verip
        sayfayı yenileyin.
      </p>
    );
  };

  return (
    <div
      className={`rounded-bubble border-2 border-error bg-score-poor p-6 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
            <MicOff className="h-6 w-6 text-error" aria-hidden="true" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-error" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-score-poor-text">
              Mikrofon İzni Gerekli
            </h3>
          </div>

          <p className="mt-2 text-score-poor-text">
            Sesli cevap verebilmek için tarayıcınızdan mikrofon kullanma izni
            almanız gerekiyor.
          </p>

          {getInstructions()}

          <button
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-lg bg-thy-red px-6 py-3 font-semibold text-white transition-colors hover:bg-thy-darkRed focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2"
            aria-label="Mikrofon izni için tekrar dene"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
}
