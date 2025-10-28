"use client";

import React, { useMemo } from "react";
import { Mic } from "lucide-react";

import ChatMessage from "./ChatMessage";

interface AudioBubbleProps {
  audioUrl: string;
  duration: number;
  transcription?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * AudioBubble displays the candidate's recorded response within the chat.
 * Playback and waveform visualisations will be added in a later iteration.
 */
function AudioBubble({
  audioUrl,
  duration,
  transcription,
}: AudioBubbleProps) {
  const formattedDuration = useMemo(() => formatDuration(duration), [duration]);

  return (
    <ChatMessage type="user">
      <div className="rounded-bubble rounded-tr-none bg-chat-user p-4 text-chat-user-text shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-90">
          Your Answer
        </p>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white md:h-10 md:w-10">
            <Mic className="h-5 w-5" aria-hidden />
            <span className="sr-only">Recorded audio</span>
          </span>
          <span className="text-sm font-medium">{formattedDuration}</span>
          <span className="text-xs opacity-75">🎙️ Recorded</span>
        </div>
        {transcription && (
          <p className="mt-2 text-xs italic opacity-75">📝 {transcription}</p>
        )}
        <p className="mt-3 text-[11px] uppercase tracking-wide text-white/60">
          Audio playback coming soon
        </p>
        <span className="sr-only">Audio URL: {audioUrl}</span>
      </div>
    </ChatMessage>
  );
}

export default React.memo(AudioBubble);

