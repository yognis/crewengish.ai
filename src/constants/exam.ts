export const EXAM_CONSTANTS = {
  // Question limits
  MAX_QUESTIONS: 20,
  MIN_QUESTIONS: 1,

  // Recording time limits (seconds)
  MAX_RECORDING_TIME_SECONDS: 90,
  MIN_RECORDING_TIME_SECONDS: 5,

  // Upload settings
  UPLOAD_RETRY_ATTEMPTS: 3,
  UPLOAD_TIMEOUT_MS: 30000, // 30 seconds

  // Rate limiting
  RATE_LIMIT_REQUESTS: 10,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute

  // Audio settings
  AUDIO_SAMPLE_RATE: 44100,
  AUDIO_BIT_RATE: 128000,
} as const;

export type ExamConstants = typeof EXAM_CONSTANTS;