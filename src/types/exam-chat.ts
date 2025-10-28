/**
 * Shared interfaces and helpers for the voice-enabled exam chat experience.
 * These are consumed by hooks, components, and data services throughout
 * the Turkish Airlines English exam flow.
 */

/**
 * Base shape for any chat message rendered in the exam conversation.
 * Acts as the discriminant for the union of specific message types.
 */
export interface ChatMessage {
  /** Unique identifier, e.g. nanoid or Date.now().toString(). */
  id: string;
  /** Discriminant identifying the message kind. */
  type: "question" | "audio" | "score" | "error";
  /** Timestamp when the message was created. */
  timestamp: Date;
  /** Question number this message is associated with (1-20). */
  questionNumber: number;
}

/**
 * Message emitted when the system presents a question to the candidate.
 */
export interface QuestionMessage extends ChatMessage {
  type: "question";
  content: {
    /** Actual question prompt delivered to the candidate. */
    text: string;
    /** Optional scenario/backstory providing additional context. */
    scenario?: string;
  };
}

/**
 * Message generated when the candidate records an audio response.
 */
export interface AudioMessage extends ChatMessage {
  type: "audio";
  content: {
    /** Raw audio data captured via MediaRecorder. */
    audioBlob: Blob;
    /** Object URL created for audio playback within the UI. */
    audioUrl: string;
    /** Recording duration in seconds. */
    duration: number;
    /** Optional transcription returned by OpenAI Whisper. */
    transcription?: string;
  };
}

/**
 * Message summarising automated scoring returned by GPT evaluation.
 */
export interface ScoreMessage extends ChatMessage {
  type: "score";
  content: {
    /** Aggregate score between 0 and 100. */
    score: number;
    /** Highlighted strengths identified during evaluation. */
    strengths: string[];
    /** Suggested improvement areas. */
    improvements: string[];
    /** Full transcription of the candidate's answer. */
    transcript: string;
    /** Optional metric-specific scores (0-100). */
    fluency?: number;
    grammar?: number;
    vocabulary?: number;
    pronunciation?: number;
    relevance?: number;
  };
}

/**
 * Error types that can occur during the exam flow.
 */
export type ExamErrorType =
  | "mic_permission"
  | "network"
  | "upload"
  | "transcription"
  | "evaluation"
  | "unknown";

/**
 * Message representing an error that occurred during the exam flow.
 */
export interface ErrorMessage extends ChatMessage {
  type: "error";
  content: {
    /** Type of error that occurred. */
    errorType: ExamErrorType;
    /** Human-readable error message. */
    message: string;
    /** Optional technical error details (for debugging). */
    details?: string;
    /** Whether the error is retryable. */
    retryable: boolean;
    /** Current retry attempt (if retrying). */
    retryAttempt?: number;
    /** Maximum retry attempts allowed. */
    maxRetryAttempts?: number;
  };
}

/** Union of every chat message variant with rich content. */
export type AnyChatMessage =
  | QuestionMessage
  | AudioMessage
  | ScoreMessage
  | ErrorMessage;

/**
 * Extracts the content payload shape for a given message union or subtype.
 *
 * @example
 * type QuestionContent = ChatMessageContent<QuestionMessage>;
 */
export type ChatMessageContent<T extends AnyChatMessage = AnyChatMessage> = T extends {
  content: infer C;
}
  ? C
  : never;

/**
 * Aggregated UI state used by the upcoming `useExamChat` hook.
 */
export interface ChatState {
  /** Ordered list of chat messages displayed to the candidate. */
  messages: AnyChatMessage[];
  /** The currently active question awaiting a response. */
  currentQuestion: QuestionMessage | null;
  /** Flag indicating whether the user is recording audio. */
  isRecording: boolean;
  /** Flag indicating whether scoring/transcription is in progress. */
  isEvaluating: boolean;
  /** Supabase exam session identifier. */
  sessionId: string;
}

/**
 * Persisted exam session metadata mirrored from the database.
 */
export interface ExamSession {
  /** Supabase primary key for the session. */
  id: string;
  /** Identifier of the candidate taking the exam. */
  user_id: string;
  /** Current lifecycle status of the session. */
  status: "pending" | "in_progress" | "completed" | "exited";
  /** Question number the candidate is on. */
  current_question_number: number;
  /** Total number of questions in the exam (defaults to 20). */
  total_questions: number;
  /** Overall score for the completed exam. */
  overall_score: number | null;
  /** Credits charged to start the session. */
  credits_charged: number;
  /** Credits refunded if session was exited. */
  credits_refunded: number;
  /** Timestamp when the session started. */
  started_at: string;
  /** Timestamp when the session finished, if applicable. */
  completed_at: string | null;
  /** Creation timestamp. */
  created_at: string;
  /** Last update timestamp. */
  updated_at: string;
  /** Idempotency key for session creation. */
  idempotency_key: string | null;
}

export interface Question {
  question_number: number;
  question_text: string;
  scenario?: string | null;
}

/**
 * Type guard to identify a question message at runtime.
 */
export function isQuestionMessage(msg: ChatMessage): msg is QuestionMessage {
  return msg.type === "question";
}

/**
 * Type guard to identify an audio message at runtime.
 */
export function isAudioMessage(msg: ChatMessage): msg is AudioMessage {
  return msg.type === "audio";
}

/**
 * Type guard to identify a score message at runtime.
 */
export function isScoreMessage(msg: ChatMessage): msg is ScoreMessage {
  return msg.type === "score";
}

/**
 * Type guard to identify an error message at runtime.
 */
export function isErrorMessage(msg: ChatMessage): msg is ErrorMessage {
  return msg.type === "error";
}
