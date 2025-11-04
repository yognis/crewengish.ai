export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          department: 'pilot' | 'cabin_crew' | 'ground_staff' | 'other';
          credits: number;
          phone: string | null;
          terms_accepted: boolean;
          kvkk_accepted: boolean;
          age_verified: boolean;
          marketing_consent: boolean;
          terms_accepted_at: string | null;
          kvkk_accepted_at: string | null;
          marketing_consent_at: string | null;
          consent_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          department: 'pilot' | 'cabin_crew' | 'ground_staff' | 'other';
          credits?: number;
          phone?: string | null;
          terms_accepted?: boolean;
          kvkk_accepted?: boolean;
          age_verified?: boolean;
          marketing_consent?: boolean;
          terms_accepted_at?: string | null;
          kvkk_accepted_at?: string | null;
          marketing_consent_at?: string | null;
          consent_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          department?: 'pilot' | 'cabin_crew' | 'ground_staff' | 'other';
          credits?: number;
          phone?: string | null;
          terms_accepted?: boolean;
          kvkk_accepted?: boolean;
          age_verified?: boolean;
          marketing_consent?: boolean;
          terms_accepted_at?: string | null;
          kvkk_accepted_at?: string | null;
          marketing_consent_at?: string | null;
          consent_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      test_sessions: {
        Row: {
          id: string;
          user_id: string;
          test_type: 'full_test' | 'quick_practice' | 'custom';
          status: 'in_progress' | 'completed' | 'abandoned';
          overall_score: number | null;
          fluency_score: number | null;
          grammar_score: number | null;
          vocabulary_score: number | null;
          pronunciation_score: number | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_type: 'full_test' | 'quick_practice' | 'custom';
          status?: 'in_progress' | 'completed' | 'abandoned';
          overall_score?: number | null;
          fluency_score?: number | null;
          grammar_score?: number | null;
          vocabulary_score?: number | null;
          pronunciation_score?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: 'in_progress' | 'completed' | 'abandoned';
          overall_score?: number | null;
          fluency_score?: number | null;
          grammar_score?: number | null;
          vocabulary_score?: number | null;
          pronunciation_score?: number | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      test_responses: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          question_text: string;
          audio_url: string;
          transcript: string;
          score: number;
          feedback: string;
          duration_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          question_text: string;
          audio_url: string;
          transcript: string;
          score: number;
          feedback: string;
          duration_seconds: number;
          created_at?: string;
        };
        Update: {
          transcript?: string;
          score?: number;
          feedback?: string;
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'purchase' | 'usage' | 'refund' | 'bonus';
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: 'purchase' | 'usage' | 'refund' | 'bonus';
          description: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      exam_sessions: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'in_progress' | 'completed' | 'exited';
          total_questions: number;
          current_question_number: number;
          overall_score: number | null;
          credits_charged: number;
          credits_refunded: number;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          idempotency_key: string | null;
          session_category: 'introduction' | 'aviation' | 'situational' | 'cultural' | 'professional' | null;
          session_number: number | null;
          category_display_name: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'exited';
          total_questions?: number;
          current_question_number?: number;
          overall_score?: number | null;
          credits_charged?: number;
          credits_refunded?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          idempotency_key?: string | null;
          session_category?: 'introduction' | 'aviation' | 'situational' | 'cultural' | 'professional' | null;
          session_number?: number | null;
          category_display_name?: string | null;
        };
        Update: {
          status?: 'pending' | 'in_progress' | 'completed' | 'exited';
          total_questions?: number;
          current_question_number?: number;
          overall_score?: number | null;
          credits_charged?: number;
          credits_refunded?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          idempotency_key?: string | null;
          session_category?: 'introduction' | 'aviation' | 'situational' | 'cultural' | 'professional' | null;
          session_number?: number | null;
          category_display_name?: string | null;
        };
        Relationships: [];
      };
      exam_questions: {
        Row: {
          id: string;
          session_id: string;
          question_number: number;
          question_text: string;
          question_context: string | null;
          audio_url: string | null;
          transcription: string | null;
          scores: Json | null;
          overall_score: number | null;
          feedback: string | null;
          strengths: string[] | null;
          improvements: string[] | null;
          submitted_at: string | null;
          scored_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_number: number;
          question_text: string;
          question_context?: string | null;
          audio_url?: string | null;
          transcription?: string | null;
          scores?: Json | null;
          overall_score?: number | null;
          feedback?: string | null;
          strengths?: string[] | null;
          improvements?: string[] | null;
          submitted_at?: string | null;
          scored_at?: string | null;
          created_at?: string;
        };
        Update: {
          question_number?: number;
          question_text?: string;
          question_context?: string | null;
          audio_url?: string | null;
          transcription?: string | null;
          scores?: Json | null;
          overall_score?: number | null;
          feedback?: string | null;
          strengths?: string[] | null;
          improvements?: string[] | null;
          submitted_at?: string | null;
          scored_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      consent_audit: {
        Row: {
          id: number;
          user_id: string;
          consent_type: 'terms' | 'kvkk' | 'age' | 'marketing' | 'data_transfer' | 'special_category';
          given: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          consent_type: 'terms' | 'kvkk' | 'age' | 'marketing' | 'data_transfer' | 'special_category';
          given: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          // Audit log is append-only, no updates allowed
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

