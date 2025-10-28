"use client";

import React from "react";

import ChatMessage from "./ChatMessage";

interface QuestionBubbleProps {
  questionNumber: number;
  text: string;
  scenario?: string;
}

/**
 * QuestionBubble renders AI prompts within the chat, including optional
 * contextual scenarios that can be expanded by the candidate.
 */
function QuestionBubble({
  questionNumber,
  text,
  scenario,
}: QuestionBubbleProps) {
  return (
    <ChatMessage type="ai">
      <div className="rounded-bubble rounded-tl-none border border-chat-ai-border bg-chat-ai p-4 shadow-sm">
        <span className="mb-2 inline-block rounded-md bg-thy-red px-2 py-1 text-xs font-semibold text-white">
          Soru {questionNumber}
        </span>
        <p className="text-base leading-relaxed text-chat-ai-text">{text}</p>
        {scenario && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-thy-red">
              {"\u{1F4DD} Senaryo"}
            </summary>
            <p className="mt-2 pl-4 text-sm italic text-gray-600">{scenario}</p>
          </details>
        )}
      </div>
    </ChatMessage>
  );
}

export default React.memo(QuestionBubble);
