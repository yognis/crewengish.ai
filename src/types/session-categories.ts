import {
  SESSION_CONFIGS as BASE_SESSION_CONFIGS,
  type SessionCategory,
  type SessionConfig as SharedSessionConfig,
} from '@/shared/exam-config';

export type { SessionCategory } from '@/shared/exam-config';
export { getCategoryDisplayName } from '@/shared/exam-config';

export interface SessionUnlockRequirement {
  requiresSession?: number;
  minScore?: number;
}

export interface SessionConfig extends SharedSessionConfig {
  icon: string;
  questionCount: number;
  unlockRequirement: SessionUnlockRequirement;
}

const SESSION_ICONS: Record<SessionCategory, string> = {
  introduction: '👋',
  aviation: '✈️',
  situational: '🤔',
  cultural: '🌍',
  professional: '📈',
};

export const SESSION_CONFIGS: SessionConfig[] = BASE_SESSION_CONFIGS.map((config) => ({
  ...config,
  icon: SESSION_ICONS[config.category],
  questionCount: 5,
  unlockRequirement:
    config.sessionNumber === 1
      ? {}
      : {
          requiresSession: config.sessionNumber - 1,
          minScore: config.unlockThreshold,
        },
}));

export function getSessionConfig(identifier: number | SessionCategory): SessionConfig | undefined {
  if (typeof identifier === 'number') {
    return SESSION_CONFIGS.find((config) => config.sessionNumber === identifier);
  }
  return SESSION_CONFIGS.find((config) => config.category === identifier);
}

