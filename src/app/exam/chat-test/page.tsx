"use client";

import { useCallback, useState } from "react";

import AudioBubble from "@/components/exam/chat/AudioBubble";
import ChatContainer from "@/components/exam/chat/ChatContainer";
import QuestionBubble from "@/components/exam/chat/QuestionBubble";
import RecorderFooter from "@/components/exam/chat/RecorderFooter";
import ScoreCard from "@/components/exam/chat/ScoreCard";
import type { AnyChatMessage, ChatMessage } from "@/types/exam-chat";
import {
  isAudioMessage,
  isQuestionMessage,
  isScoreMessage,
} from "@/types/exam-chat";

const mockMessages: AnyChatMessage[] = [
  {
    id: "1",
    type: "question",
    timestamp: new Date("2025-01-15T10:00:00"),
    questionNumber: 1,
    content: {
      text: "Why do you want to work at Turkish Airlines?",
      scenario:
        "You are in a job interview. Demonstrate your passion for aviation and customer service.",
    },
  },
  {
    id: "2",
    type: "audio",
    timestamp: new Date("2025-01-15T10:00:30"),
    questionNumber: 1,
    content: {
      audioBlob: new Blob(),
      audioUrl: "blob:mock",
      duration: 23,
      transcription:
        "Turkish Airlines is a world-class airline with excellent service and modern fleet. I am passionate about aviation and would love to be part of this prestigious team.",
    },
  },
  {
    id: "3",
    type: "score",
    timestamp: new Date("2025-01-15T10:00:35"),
    questionNumber: 1,
    content: {
      score: 85,
      strengths: [
        "Clear and confident pronunciation",
        "Good use of aviation vocabulary",
        "Well-structured answer",
      ],
      improvements: [
        "Could add more specific examples",
        "Speak slightly slower for clarity",
      ],
      transcript:
        "Turkish Airlines is a world-class airline with excellent service and modern fleet. I am passionate about aviation and would love to be part of this prestigious team.",
    },
  },
  {
    id: "4",
    type: "question",
    timestamp: new Date("2025-01-15T10:01:00"),
    questionNumber: 2,
    content: {
      text: "Describe a challenging situation you faced at work.",
      scenario: "Focus on problem-solving and teamwork skills.",
    },
  },
  {
    id: "5",
    type: "audio",
    timestamp: new Date("2025-01-15T10:01:45"),
    questionNumber: 2,
    content: {
      audioBlob: new Blob(),
      audioUrl: "blob:mock",
      duration: 45,
      transcription:
        "Once I had to handle an upset customer. I listened carefully and found a solution that satisfied everyone.",
    },
  },
  {
    id: "6",
    type: "score",
    timestamp: new Date("2025-01-15T10:01:50"),
    questionNumber: 2,
    content: {
      score: 72,
      strengths: ["Good example provided", "Demonstrated empathy"],
      improvements: [
        "Provide more details about the solution",
        "Use more advanced vocabulary",
        "Explain the outcome more clearly",
      ],
      transcript:
        "Once I had to handle an upset customer. I listened carefully and found a solution that satisfied everyone.",
    },
  },
  {
    id: "7",
    type: "question",
    timestamp: new Date("2025-01-15T10:02:00"),
    questionNumber: 3,
    content: {
      text: "How do airplanes stay in the air?",
      scenario: "Explain this technical concept in simple terms to a passenger.",
    },
  },
];

export default function ChatTestPage() {
  const [messages] = useState<AnyChatMessage[]>(mockMessages);
  const handleRecorderSubmit = useCallback(async (audioBlob: Blob) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("[ChatTest] Audio submitted:", audioBlob.size);
    }
  }, []);

  const renderMessage = (msg: ChatMessage) => {
    if (isQuestionMessage(msg)) {
      return (
        <QuestionBubble
          key={msg.id}
          questionNumber={msg.questionNumber}
          text={msg.content.text}
          scenario={msg.content.scenario}
        />
      );
    }

    if (isAudioMessage(msg)) {
      return (
        <AudioBubble
          key={msg.id}
          audioUrl={msg.content.audioUrl}
          duration={msg.content.duration}
          transcription={msg.content.transcription}
        />
      );
    }

    if (isScoreMessage(msg)) {
      return (
        <ScoreCard
          key={msg.id}
          score={msg.content.score}
          strengths={msg.content.strengths}
          improvements={msg.content.improvements}
          transcript={msg.content.transcript}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-thy-red sm:text-xl">
              Chat Test · Soru 3/20
            </h1>
            <span className="text-sm text-gray-500">
              15 Ocak 2025 · 10:02
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-thy-red transition-all"
              style={{ width: "15%" }}
            />
          </div>
        </div>
      </header>

      <ChatContainer messages={messages}>{messages.map(renderMessage)}</ChatContainer>

      <RecorderFooter onSubmit={handleRecorderSubmit} />
    </div>
  );
}
