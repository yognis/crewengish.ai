# THY English Speaking Test Simulator

A rapid-prototyped speaking test preparation platform for Turkish Airlines employees, built using the proven business model from CrewCoach.ai.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Speech-to-Text**: OpenAI Whisper
- **AI Evaluation**: OpenAI GPT-4
- **State Management**: Zustand
- **Hosting**: Vercel (recommended)

## 📋 Features

### Core Features (MVP)
- ✅ User authentication (Supabase Auth)
- ✅ Credit-based system (purchase → practice model)
- ✅ Real-time audio recording
- ✅ Accurate speech-to-text (optimized for Turkish-accented English)
- ✅ AI-powered scoring on 4 criteria:
  - Fluency & Coherence (25%)
  - Grammar Accuracy (25%)
  - Vocabulary Range (25%)
  - Pronunciation (25%)
- ✅ Instant feedback in Turkish
- ✅ Aviation/corporate English question bank
- ✅ Test history and progress tracking

### Question Categories
- Personal & Introduction
- Aviation Operations
- Customer Service
- Emergency Situations
- Teamwork & Communication

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
cd thy-speaking-test
npm install
```

### 2. Environment Variables

Create `.env.local` file:

```bash
cp env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for speech-to-text and AI evaluation)
OPENAI_API_KEY=your_openai_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `database.sql`
4. Run the query

This will create:
- `profiles` table (user data with credits)
- `test_sessions` table (test attempts)
- `test_responses` table (individual question responses)
- `credit_transactions` table (credit purchase/usage history)
- Storage bucket for audio recordings
- Row Level Security policies
- Helper functions (auto-create profile, deduct credits)

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
thy-speaking-test/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts    # OpenAI Whisper speech-to-text
│   │   └── evaluate/route.ts      # OpenAI GPT-4 scoring
│   ├── test/
│   │   └── page.tsx               # Main test interface
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   └── AudioRecorder.tsx          # Mic recording component
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── database.types.ts          # TypeScript types
│   └── questions.ts               # Question bank
├── store/
│   └── appStore.ts                # Zustand global state
├── database.sql                   # Database schema
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 🎯 Development Priorities

### Phase 1: MVP (Week 1-2) ✅
- [x] Project scaffolding
- [x] Database schema
- [x] Audio recording component
- [x] OpenAI Whisper integration
- [x] OpenAI GPT-4 evaluation
- [x] Basic UI flow

### Phase 2: Polish (Week 3-4)
- [ ] Authentication UI (login/signup)
- [ ] Credit purchase flow (Stripe integration)
- [ ] User dashboard (test history, scores)
- [ ] Results visualization
- [ ] Mobile responsiveness
- [ ] Error handling improvements

### Phase 3: Launch Prep (Week 5-6)
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Performance optimization
- [ ] User testing with THY employees
- [ ] Final bug fixes
- [ ] Deploy to production

## 🔧 Configuration Notes

### OpenAI Whisper Settings
Current configuration in `/api/transcribe/route.ts`:
- Model: `whisper-1`
- Language: `en` (English)
- Response format: `json`
- Audio format: WebM/Opus (16kHz sample rate)

**For Turkish-accented English**, OpenAI's Whisper model performs exceptionally well with multi-accent recognition. The model is specifically trained to handle non-native English speakers and performs well with aviation terminology out of the box.

### OpenAI GPT-4 Evaluation
Current configuration in `/api/evaluate/route.ts`:
- Model: `gpt-4o`
- Temperature: `0.3` (consistent scoring)
- JSON response format
- Feedback in Turkish

### Credit System
- New users: 3 free credits (welcome bonus)
- 1 credit = 1 full test (5 questions)
- Credits deducted after test completion
- Transaction history tracked

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

Vercel automatically handles:
- Next.js optimizations
- Edge functions
- Automatic SSL
- CDN distribution

### Environment Variables in Vercel

Add all variables from `.env.local` in:
Settings → Environment Variables

## 🎨 Design System

### Colors
- **THY Red**: `#E30A17` (primary brand)
- **Dark Red**: `#B80813` (hover states)
- **Gray**: `#4A4A4A` (text)
- **Light Gray**: `#F5F5F5` (backgrounds)

### Components
Reusable classes in `globals.css`:
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Card container
- `.input` - Form input

## 📊 Database Schema Overview

### profiles
User information and credit balance

### test_sessions
Each test attempt with overall scores

### test_responses
Individual question responses with audio + scores

### credit_transactions
Complete audit trail of all credit movements

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Audio files stored with user-scoped paths
- API keys stored in environment variables
- Service role key only used server-side

## 📈 Metrics to Track

- User signups
- Credits purchased
- Tests completed
- Average scores by category
- Speech recognition accuracy
- User retention
- Time to complete test

## 🐛 Known Limitations (MVP)

- No payment integration yet (manual credit top-up)
- Basic error handling
- No email notifications
- Limited analytics
- No mobile app (web-only)

## 🤝 Contributing

This is a rapid prototype. Priority is shipping fast and iterating based on user feedback.

## 📝 License

Proprietary - Turkish Airlines Employee Use Only

---

**Built with the rapid prototyping philosophy: Ship fast, iterate faster.**









