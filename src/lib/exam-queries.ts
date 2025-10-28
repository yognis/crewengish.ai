"use server";

import { EXAM_CONSTANTS } from "@/constants/exam";
import { createClient } from "@/lib/supabase/server";
import type { ExamSession, Question } from "@/types/exam-chat";

interface EvaluationResult {
  score: number;
  strengths: string[];
  improvements: string[];
  transcript: string;
}

/**
 * Fetch exam session details for the provided session identifier.
 */
export async function getExamSession(
  sessionId: string,
): Promise<ExamSession | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("[getExamSession] Error:", error);
    return null;
  }

  return data as ExamSession;
}

/**
 * Retrieve the current question number for the session. Returns 1 when unknown.
 */
export async function getCurrentQuestionNumber(
  sessionId: string,
): Promise<number> {
  const session = await getExamSession(sessionId);
  return session?.current_question_number ?? EXAM_CONSTANTS.MIN_QUESTIONS;
}

/**
 * Update session progress, adjusting the question number and timestamp.
 */
export async function updateSessionProgress(
  sessionId: string,
  questionNumber: number,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exam_sessions")
    .update({
      current_question_number: questionNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("[updateSessionProgress] Error:", error);
  }
}

/**
 * Fetch the next question in sequence for the given session.
 */
export async function getNextQuestion(sessionId: string): Promise<{
  questionNumber: number;
  text: string;
  scenario?: string;
} | null> {
  const currentNumber = await getCurrentQuestionNumber(sessionId);

  if (currentNumber > EXAM_CONSTANTS.MAX_QUESTIONS) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("exam_questions")
    .select("*")
    .eq("session_id", sessionId)
    .eq("question_number", currentNumber)
    .single()) as {
    data: {
      question_number: number;
      question_text: string;
      question_context: string | null;
    } | null;
    error: any;
  };

  if (error) {
    console.error("[getNextQuestion] Error:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    questionNumber: data.question_number,
    text: data.question_text,
    scenario: data.question_context || undefined,
  };
}

/**
 * Retrieve all questions and scenarios associated with a session.
 */
export async function getAllSessionQuestions(
  sessionId: string,
): Promise<Question[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_questions")
    .select("question_number, question_text, question_context")
    .eq("session_id", sessionId)
    .order("question_number", { ascending: true });

  if (error) {
    console.error("[getAllSessionQuestions] Error:", error);
    return [];
  }

  return (data || []).map(row => ({
    question_number: row.question_number,
    question_text: row.question_text,
    scenario: row.question_context
  }));
}

/**
 * Upload the audio recording to Supabase storage and return its public URL.
 */
export async function uploadAudioFile(
  sessionId: string,
  questionNumber: number,
  audioBlob: Blob,
): Promise<string | null> {
  const supabase = await createClient();

  const timestamp = Date.now();
  const filename = `${sessionId}/question-${questionNumber}-${timestamp}.webm`;

  const { error: uploadError } = await supabase.storage
    .from("exam-audio")
    .upload(filename, audioBlob, {
      contentType: "audio/webm",
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadAudioFile] Error:", uploadError);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("exam-audio")
    .getPublicUrl(filename);

  return publicUrlData.publicUrl ?? null;
}

/**
 * Invoke the Supabase Edge function to evaluate the audio response.
 */
export async function evaluateAudioResponse(
  sessionId: string,
  questionNumber: number,
  questionText: string,
  audioUrl: string,
): Promise<EvaluationResult | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.functions.invoke("exam-chat", {
      body: {
        action: "EVALUATE_ANSWER",
        sessionId,
        questionNumber,
        questionText,
        audioUrl,
      },
    });

    if (error) {
      console.error("[evaluateAudioResponse] Error:", error);
      return null;
    }

    return {
      score: data?.score ?? 0,
      strengths: data?.strengths ?? [],
      improvements: data?.improvements ?? [],
      transcript: data?.transcript ?? "",
    };
  } catch (err) {
    console.error("[evaluateAudioResponse] Exception:", err);
    return null;
  }
}

/**
 * Persist the submitted response and generated evaluation in the database.
 */
export async function saveExamResponse(
  sessionId: string,
  questionNumber: number,
  audioUrl: string,
  evaluation: EvaluationResult,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exam_questions")
    .update({
      audio_url: audioUrl,
      transcription: evaluation.transcript,
      overall_score: evaluation.score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      submitted_at: new Date().toISOString(),
      scored_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId)
    .eq("question_number", questionNumber);

  if (error) {
    console.error("[saveExamResponse] Error:", error);
    return false;
  }

  return true;
}

/**
 * Upload, evaluate, save, and update session progress in one flow.
 */
export async function submitAnswer(
  sessionId: string,
  questionNumber: number,
  questionText: string,
  audioBlob: Blob,
): Promise<{
  success: boolean;
  evaluation?: EvaluationResult;
  error?: string;
}> {
  try {
    const audioUrl = await uploadAudioFile(
      sessionId,
      questionNumber,
      audioBlob,
    );
    if (!audioUrl) {
      return { success: false, error: "Failed to upload audio" };
    }

    const evaluation = await evaluateAudioResponse(
      sessionId,
      questionNumber,
      questionText,
      audioUrl,
    );
    if (!evaluation) {
      return { success: false, error: "Failed to evaluate answer" };
    }

    const saved = await saveExamResponse(
      sessionId,
      questionNumber,
      audioUrl,
      evaluation,
    );
    if (!saved) {
      return { success: false, error: "Failed to save response" };
    }

    await updateSessionProgress(sessionId, questionNumber + 1);

    return { success: true, evaluation };
  } catch (err) {
    console.error("[submitAnswer] Exception:", err);
    return { success: false, error: "Unexpected error occurred" };
  }
}
