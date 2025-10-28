"use client";

import { EXAM_CONSTANTS } from "@/constants/exam";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  AudioMessage,
  ChatMessage,
  QuestionMessage,
  ScoreMessage,
  ErrorMessage,
  ExamErrorType,
} from "@/types/exam-chat";

interface UseExamChatProps {
  sessionId: string;
  initialMessages?: ChatMessage[];
}

interface UseExamChatReturn {
  messages: ChatMessage[];
  isEvaluating: boolean;
  currentQuestionNumber: number;
  addQuestion: (
    questionNumber: number,
    text: string,
    scenario?: string,
  ) => void;
  addAudioResponse: (
    audioBlob: Blob,
    audioUrl: string,
    duration: number,
    transcription?: string,
  ) => void;
  addScore: (
    score: number,
    strengths: string[],
    improvements: string[],
    transcript: string,
  ) => void;
  addError: (
    errorType: ExamErrorType,
    message: string,
    options?: {
      details?: string;
      retryable?: boolean;
      retryAttempt?: number;
      maxRetryAttempts?: number;
    },
  ) => void;
  clearMessages: () => void;
  clearErrors: () => void;
  getLastMessage: () => ChatMessage | undefined;
  getMessagesByType: (type: ChatMessage["type"]) => ChatMessage[];
  setEvaluating: (value: boolean) => void;
}

/**
 * useExamChat orchestrates the transient chat state for the voice-based exam.
 * It offers helpers to append questions, user audio, and AI scores while
 * tracking the current question number and evaluation state.
 */
export function useExamChat({
  sessionId,
  initialMessages = [],
}: UseExamChatProps): UseExamChatReturn {
  const dedupedInitialMessages = useMemo<ChatMessage[]>(() => {
    if (initialMessages.length === 0) return [];
    const seen = new Set<string>();
    return initialMessages.filter((message) => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  }, [initialMessages]);

  const deriveInitialQuestionNumber = useCallback(() => {
    const lastQuestion = [...dedupedInitialMessages]
      .reverse()
      .find((message) => message.type === "question") as
      | QuestionMessage
      | undefined;
    if (lastQuestion) {
      return lastQuestion.questionNumber;
    }
    if (dedupedInitialMessages.length > 0) {
      return dedupedInitialMessages[dedupedInitialMessages.length - 1]
        .questionNumber;
    }
    return EXAM_CONSTANTS.MIN_QUESTIONS;
  }, [dedupedInitialMessages]);

  const [messages, setMessages] =
    useState<ChatMessage[]>(dedupedInitialMessages);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(
    deriveInitialQuestionNumber,
  );

  const lastProcessedMessageIdRef = useRef<string | null>(null);

  const addQuestion = useCallback(
    (questionNumber: number, text: string, scenario?: string) => {
      if (
        !Number.isFinite(questionNumber) ||
        questionNumber < EXAM_CONSTANTS.MIN_QUESTIONS
      ) {
        console.warn("[useExamChat] Invalid question number provided.");
        return;
      }
      if (!text.trim()) {
        console.warn("[useExamChat] Question text cannot be empty.");
        return;
      }

      const newMessage: QuestionMessage = {
        id: `question-${questionNumber}-${Date.now()}`,
        type: "question",
        timestamp: new Date(),
        questionNumber,
        content: { text, scenario },
      };

      setMessages((prev) => [...prev, newMessage]);
      setCurrentQuestionNumber(questionNumber);
      setIsEvaluating(false);
    },
    [],
  );

  const addAudioResponse = useCallback(
    (
      audioBlob: Blob,
      audioUrl: string,
      duration: number,
      transcription?: string,
    ) => {
      if (!(audioBlob instanceof Blob)) {
        console.warn("[useExamChat] audioBlob must be a Blob instance.");
        return;
      }
      if (!audioUrl) {
        console.warn("[useExamChat] audioUrl is required.");
        return;
      }
      if (
        !Number.isFinite(duration) ||
        duration < EXAM_CONSTANTS.MIN_RECORDING_TIME_SECONDS
      ) {
        console.warn(
          `[useExamChat] duration must be >= ${EXAM_CONSTANTS.MIN_RECORDING_TIME_SECONDS} seconds.`,
        );
        return;
      }

      const newMessage: AudioMessage = {
        id: `audio-${currentQuestionNumber}-${Date.now()}`,
        type: "audio",
        timestamp: new Date(),
        questionNumber: currentQuestionNumber,
        content: { audioBlob, audioUrl, duration, transcription },
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsEvaluating(true);
    },
    [currentQuestionNumber],
  );

  const addScore = useCallback(
    (
      score: number,
      strengths: string[],
      improvements: string[],
      transcript: string,
    ) => {
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        console.warn("[useExamChat] score must be between 0 and 100.");
        return;
      }

      const newMessage: ScoreMessage = {
        id: `score-${currentQuestionNumber}-${Date.now()}`,
        type: "score",
        timestamp: new Date(),
        questionNumber: currentQuestionNumber,
        content: {
          score,
          strengths,
          improvements,
          transcript,
        },
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsEvaluating(false);
    },
    [currentQuestionNumber],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentQuestionNumber(EXAM_CONSTANTS.MIN_QUESTIONS);
    setIsEvaluating(false);
    lastProcessedMessageIdRef.current = null;
  }, []);

  const getLastMessage = useCallback(() => {
    if (messages.length === 0) return undefined;
    return messages[messages.length - 1];
  }, [messages]);

  const getMessagesByType = useCallback(
    (type: ChatMessage["type"]) => {
      return messages.filter((message) => message.type === type);
    },
    [messages],
  );

  const setEvaluating = useCallback((value: boolean) => {
    setIsEvaluating(value);
  }, []);

  const addError = useCallback(
    (
      errorType: ExamErrorType,
      message: string,
      options?: {
        details?: string;
        retryable?: boolean;
        retryAttempt?: number;
        maxRetryAttempts?: number;
      },
    ) => {
      const newMessage: ErrorMessage = {
        id: `error-${currentQuestionNumber}-${Date.now()}`,
        type: "error",
        timestamp: new Date(),
        questionNumber: currentQuestionNumber,
        content: {
          errorType,
          message,
          details: options?.details,
          retryable: options?.retryable ?? true,
          retryAttempt: options?.retryAttempt,
          maxRetryAttempts: options?.maxRetryAttempts ?? 3,
        },
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsEvaluating(false);
    },
    [currentQuestionNumber],
  );

  const clearErrors = useCallback(() => {
    setMessages((prev) => prev.filter((msg) => msg.type !== "error"));
  }, []);

  useEffect(() => {
    if (sessionId) {
      return;
    }
    console.warn("[useExamChat] sessionId is missing.");
  }, [sessionId]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    if (lastMessage.id === lastProcessedMessageIdRef.current) return;

    lastProcessedMessageIdRef.current = lastMessage.id;

    if (lastMessage.type === "score") {
      setCurrentQuestionNumber((prev) =>
        Math.min(prev + 1, EXAM_CONSTANTS.MAX_QUESTIONS),
      );
      setIsEvaluating(false);
    }
  }, [messages]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG_EXAM_CHAT !== "true") {
      return;
    }
    console.debug("[useExamChat] messages:", messages.length);
    console.debug("[useExamChat] currentQuestionNumber:", currentQuestionNumber);
    console.debug("[useExamChat] isEvaluating:", isEvaluating);
  }, [messages, currentQuestionNumber, isEvaluating]);

  return {
    messages,
    isEvaluating,
    currentQuestionNumber,
    addQuestion,
    addAudioResponse,
    addScore,
    addError,
    clearMessages,
    clearErrors,
    getLastMessage,
    getMessagesByType,
    setEvaluating,
  };
}

export type { UseExamChatProps, UseExamChatReturn };
