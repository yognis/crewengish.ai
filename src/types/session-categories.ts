/**
 * Session category types for the 5-session exam system
 */

export type SessionCategory =
  | 'introduction'     // Session 1
  | 'aviation'         // Session 2
  | 'situational'      // Session 3
  | 'cultural'         // Session 4
  | 'professional';    // Session 5

export interface SessionConfig {
  sessionNumber: 1 | 2 | 3 | 4 | 5;
  category: SessionCategory;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Medium-Hard' | 'Hard';
  questionCount: 5;
  duration: string; // e.g., "5-10 minutes"
  icon: string; // emoji or icon identifier
  unlockRequirement: {
    requiresSession?: number;
    minScore?: number;
  };
}

export const SESSION_CONFIGS: SessionConfig[] = [
  {
    sessionNumber: 1,
    category: 'introduction',
    title: 'Introduction & Personal',
    description: 'Personal background, daily routine, hobbies',
    difficulty: 'Easy',
    questionCount: 5,
    duration: '5-10 minutes',
    icon: '👋',
    unlockRequirement: {}, // Always unlocked
  },
  {
    sessionNumber: 2,
    category: 'aviation',
    title: 'Aviation & Professional',
    description: 'Job responsibilities, safety, procedures',
    difficulty: 'Medium',
    questionCount: 5,
    duration: '5-10 minutes',
    icon: '✈️',
    unlockRequirement: {
      requiresSession: 1,
      minScore: 60,
    },
  },
  {
    sessionNumber: 3,
    category: 'situational',
    title: 'Situational & Problem-Solving',
    description: 'Handling challenges, decision-making',
    difficulty: 'Medium',
    questionCount: 5,
    duration: '5-10 minutes',
    icon: '🤔',
    unlockRequirement: {
      requiresSession: 2,
      minScore: 65,
    },
  },
  {
    sessionNumber: 4,
    category: 'cultural',
    title: 'Cultural & International',
    description: 'Cross-cultural communication, destinations',
    difficulty: 'Medium-Hard',
    questionCount: 5,
    duration: '5-10 minutes',
    icon: '🌍',
    unlockRequirement: {
      requiresSession: 3,
      minScore: 70,
    },
  },
  {
    sessionNumber: 5,
    category: 'professional',
    title: 'Career & Professional Development',
    description: 'Future goals, leadership, industry knowledge',
    difficulty: 'Hard',
    questionCount: 5,
    duration: '5-10 minutes',
    icon: '📈',
    unlockRequirement: {
      requiresSession: 4,
      minScore: 70,
    },
  },
];

export function getSessionConfig(sessionNumber: number | SessionCategory): SessionConfig | undefined {
  if (typeof sessionNumber === 'number') {
    return SESSION_CONFIGS.find((s) => s.sessionNumber === sessionNumber);
  } else {
    return SESSION_CONFIGS.find((s) => s.category === sessionNumber);
  }
}

export function getCategoryDisplayName(category: SessionCategory): string {
  const config = getSessionConfig(category);
  return config?.title || category;
}

