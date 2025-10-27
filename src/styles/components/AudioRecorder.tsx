'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getAudioFileExtension, getSupportedAudioMimeType } from '@/lib/audio';

interface AudioRecorderProps {
  onTranscriptComplete: (transcript: string, audioBlob: Blob, duration: number) => void;
  maxDuration?: number;
  disabled?: boolean;
}

export default function AudioRecorder({
  onTranscriptComplete,
  maxDuration = 120,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioMimeType, setAudioMimeType] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioMimeTypeRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
        toast.error('Tarayıcınız ses kaydını desteklemiyor.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });

      const supportedMimeType = getSupportedAudioMimeType() || '';
      setAudioMimeType(supportedMimeType);
      audioMimeTypeRef.current = supportedMimeType;

      const mediaRecorder = new MediaRecorder(
        stream,
        supportedMimeType ? { mimeType: supportedMimeType } : undefined
      );

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = audioMimeTypeRef.current || audioMimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        stream.getTracks().forEach(track => track.stop());
        await processRecording(audioBlob, duration);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
        
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

      toast.success('Kayıt başladı');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Mikrofon erişimi reddedildi');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processRecording = async (audioBlob: Blob, duration: number) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      const extension = getAudioFileExtension(audioBlob.type);
      formData.append('audio', audioBlob, `recording_${Date.now()}.${extension}`);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        // ignore parse errors and use generic fallback
      }

      if (!response.ok) {
        const error: any = new Error(payload?.error || 'Transcription failed');
        error.status = response.status;
        error.details = payload?.details;
        throw error;
      }

      const { transcript } = payload || {};
      
      if (!transcript || transcript.trim().length === 0) {
        toast.error('Konuşma algılanamadı. Lütfen tekrar deneyin.');
        setIsProcessing(false);
        setRecordingTime(0);
        return;
      }

      onTranscriptComplete(transcript, audioBlob, duration);
      toast.success('Kayıt işlendi');
    } catch (error: any) {
      console.error('Processing error:', error);
      if (error?.status === 429) {
        toast.error(`Çok fazla istek. ${
          error?.details && typeof error.details === 'string'
            ? error.details
            : 'Lütfen bekleyin.'
        }`);
      } else {
        toast.error('Kayıt işlenirken hata oluştu');
      }
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isProcessing}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-lg
          ${isRecording 
            ? 'bg-thy-red hover:bg-thy-darkRed animate-pulse' 
            : 'bg-thy-red hover:bg-thy-darkRed'
          }
          ${(disabled || isProcessing) && 'opacity-50 cursor-not-allowed'}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isRecording ? (
          <Square className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>

      {isRecording && (
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-thy-red">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Max: {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center">
          <div className="text-sm text-gray-600">İşleniyor...</div>
        </div>
      )}

      {!isRecording && !isProcessing && (
        <div className="text-center text-sm text-gray-500">
          {disabled ? 'Kredi yükleyin' : 'Kayda başlamak için tıklayın'}
        </div>
      )}
    </div>
  );
}
