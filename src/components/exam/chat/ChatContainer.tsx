"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Loader2, MessageCircle } from "lucide-react";

import type { ChatMessage } from "@/types/exam-chat";

interface ChatContainerProps {
  messages: ChatMessage[];
  children: React.ReactNode;
  isLoading?: boolean;
}

const SCROLL_THRESHOLD_PX = 100;

/**
 * ChatContainer is the scrollable region that displays the chat transcript
 * between the candidate and the AI proctor. It keeps the viewport pinned to
 * the latest message while respecting manual scroll when the user reviews
 * earlier content.
 */
export default function ChatContainer({
  messages,
  children,
  isLoading = false,
}: ChatContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const messageCount = messages.length;

  const shouldAutoScroll = useMemo(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    return distanceFromBottom <= SCROLL_THRESHOLD_PX;
  }, [messageCount]);

  useEffect(() => {
    if (!shouldAutoScroll) return;

    const anchor = bottomAnchorRef.current;
    if (!anchor) return;

    anchor.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messageCount, shouldAutoScroll]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6"
      role="log"
      aria-label="Sınav sohbet geçmişi"
      aria-live="polite"
      aria-atomic="false"
      style={{
        minHeight: "50vh",
        height: "100%",
        maxHeight: "100dvh",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
      }}
    >
      {messages.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
          <div className="flex flex-col items-center gap-3 text-center">
            <MessageCircle className="h-10 w-10" aria-hidden="true" />
            <p className="text-base font-medium">Sınav başlamak üzere...</p>
            <p className="text-sm text-gray-500">
              Lütfen yönlendirmeleri takip edin ve mikrofonunuzu hazırlayın.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col space-y-4">
          {children}
        </div>
      )}

      {isLoading && (
        <div className="flex w-full justify-center py-6" role="status">
          <Loader2 className="h-6 w-6 animate-spin text-thy-red" aria-hidden="true" />
          <span className="sr-only">Cevap hazırlanıyor...</span>
        </div>
      )}

      <div ref={bottomAnchorRef} aria-hidden="true" />
    </div>
  );
}
