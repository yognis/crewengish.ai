export interface Question {
  id: string;
  category: 'personal' | 'aviation' | 'customer_service' | 'emergency' | 'teamwork';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  question: string;
  suggestedDuration: number; // in seconds
  tips?: string;
}

export const questionBank: Question[] = [
  // Personal & Introduction
  {
    id: 'p1',
    category: 'personal',
    difficulty: 'basic',
    question: 'Can you introduce yourself and tell us about your current role at Turkish Airlines?',
    suggestedDuration: 60,
    tips: 'Include your name, department, years of experience, and main responsibilities.',
  },
  {
    id: 'p2',
    category: 'personal',
    difficulty: 'basic',
    question: 'Why did you choose to work in the aviation industry?',
    suggestedDuration: 45,
  },
  {
    id: 'p3',
    category: 'personal',
    difficulty: 'intermediate',
    question: 'Describe a typical day in your role at Turkish Airlines.',
    suggestedDuration: 90,
  },

  // Aviation Operations
  {
    id: 'a1',
    category: 'aviation',
    difficulty: 'intermediate',
    question: 'Explain the pre-flight safety briefing procedures to a new colleague.',
    suggestedDuration: 90,
    tips: 'Use clear aviation terminology and step-by-step instructions.',
  },
  {
    id: 'a2',
    category: 'aviation',
    difficulty: 'advanced',
    question: 'What are the most important factors to consider when dealing with turbulence during a flight?',
    suggestedDuration: 90,
  },
  {
    id: 'a3',
    category: 'aviation',
    difficulty: 'intermediate',
    question: 'How do you ensure compliance with safety regulations during boarding?',
    suggestedDuration: 60,
  },

  // Customer Service
  {
    id: 'c1',
    category: 'customer_service',
    difficulty: 'intermediate',
    question: 'A passenger is upset because their luggage is missing. How would you handle this situation?',
    suggestedDuration: 90,
    tips: 'Show empathy, explain procedures, and offer solutions.',
  },
  {
    id: 'c2',
    category: 'customer_service',
    difficulty: 'basic',
    question: 'How do you greet passengers when they board the aircraft?',
    suggestedDuration: 45,
  },
  {
    id: 'c3',
    category: 'customer_service',
    difficulty: 'advanced',
    question: 'Describe how you would handle a passenger who refuses to comply with safety instructions.',
    suggestedDuration: 90,
  },
  {
    id: 'c4',
    category: 'customer_service',
    difficulty: 'intermediate',
    question: 'A passenger asks about connecting flight information. What information would you provide?',
    suggestedDuration: 60,
  },

  // Emergency Situations
  {
    id: 'e1',
    category: 'emergency',
    difficulty: 'advanced',
    question: 'What are the steps you would take if a passenger experiences a medical emergency during the flight?',
    suggestedDuration: 120,
    tips: 'Cover assessment, communication with crew, passenger care, and documentation.',
  },
  {
    id: 'e2',
    category: 'emergency',
    difficulty: 'advanced',
    question: 'Explain the evacuation procedures in case of an emergency landing.',
    suggestedDuration: 120,
  },
  {
    id: 'e3',
    category: 'emergency',
    difficulty: 'intermediate',
    question: 'How would you communicate with passengers during unexpected delays or diversions?',
    suggestedDuration: 75,
  },

  // Teamwork & Communication
  {
    id: 't1',
    category: 'teamwork',
    difficulty: 'intermediate',
    question: 'Describe a situation where you had to work with a difficult team member. How did you handle it?',
    suggestedDuration: 90,
  },
  {
    id: 't2',
    category: 'teamwork',
    difficulty: 'basic',
    question: 'What makes effective communication important in your role?',
    suggestedDuration: 60,
  },
  {
    id: 't3',
    category: 'teamwork',
    difficulty: 'advanced',
    question: 'How do you coordinate with ground staff and pilots to ensure smooth operations?',
    suggestedDuration: 90,
  },
  {
    id: 't4',
    category: 'teamwork',
    difficulty: 'intermediate',
    question: 'Give an example of when you had to adapt your communication style for different audiences.',
    suggestedDuration: 75,
  },
];

// Helper function to get random questions
export function getRandomQuestions(count: number, difficulty?: Question['difficulty']): Question[] {
  let pool = [...questionBank];
  
  if (difficulty) {
    pool = pool.filter(q => q.difficulty === difficulty);
  }
  
  // Shuffle and return
  return pool
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

// Helper function to get questions by category
export function getQuestionsByCategory(category: Question['category']): Question[] {
  return questionBank.filter(q => q.category === category);
}

