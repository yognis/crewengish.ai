"use client";

import React, { useMemo } from "react";
import { CheckCircle, Star, Target } from "lucide-react";

import { cn } from "@/lib/utils";

import ChatMessage from "./ChatMessage";

interface ScoreCardProps {
  score: number;
  strengths: string[];
  improvements: string[];
  transcript: string;
}

function getScoreTheme(score: number) {
  if (score >= 80) {
    return {
      bg: "bg-score-excellent",
      border: "border-score-excellent-border",
      text: "text-score-excellent-text",
      label: "Excellent",
    };
  }
  if (score >= 60) {
    return {
      bg: "bg-score-good",
      border: "border-score-good-border",
      text: "text-score-good-text",
      label: "Good",
    };
  }
  if (score >= 40) {
    return {
      bg: "bg-score-fair",
      border: "border-score-fair-border",
      text: "text-score-fair-text",
      label: "Fair",
    };
  }
  return {
    bg: "bg-score-poor",
    border: "border-score-poor-border",
    text: "text-score-poor-text",
    label: "Needs Work",
  };
}

/**
 * ScoreCard visualises the GPT evaluation results with colour-coded feedback,
 * highlighting key strengths, suggested improvements, and the generated transcript.
 */
function ScoreCard({
  score,
  strengths,
  improvements,
  transcript,
}: ScoreCardProps) {
  const theme = useMemo(() => getScoreTheme(score), [score]);

  const safeStrengths =
    strengths.length > 0 ? strengths : ["No strengths provided."];
  const safeImprovements =
    improvements.length > 0 ? improvements : ["No improvements provided."];

  return (
    <ChatMessage type="system">
      <div
        className={cn(
          theme.bg,
          "max-w-2xl rounded-xl border-2 p-4 shadow-md sm:p-6",
          theme.border,
        )}
      >
        <div className="mb-4 flex items-center gap-3">
          <Star className={cn("h-7 w-7", theme.text, "fill-current")} />
          <div>
            <p className={cn("text-3xl font-bold", theme.text)}>
              {score}/100
            </p>
            <p className="text-xs text-gray-600">{theme.label}</p>
          </div>
        </div>

        <div className="my-4 border-t border-gray-200" />

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="text-base font-semibold">Strengths</h4>
          </div>
          <ul className="space-y-1 text-sm text-green-700">
            {safeStrengths.map((strength, index) => (
              <li key={`${strength}-${index}`}>- {strength}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            <h4 className="text-base font-semibold">Improvements</h4>
          </div>
          <ul className="space-y-1 text-sm text-orange-700">
            {safeImprovements.map((improvement, index) => (
              <li key={`${improvement}-${index}`}>- {improvement}</li>
            ))}
          </ul>
        </div>

        <details className="mt-4 rounded-lg bg-white/60 p-3 transition hover:bg-white/80">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700">
            Transcript
          </summary>
          <blockquote className="mt-2 border-l-2 border-gray-300 pl-4 text-sm italic text-gray-600">
            "{transcript}"
          </blockquote>
        </details>
      </div>
    </ChatMessage>
  );
}

export default React.memo(ScoreCard);
