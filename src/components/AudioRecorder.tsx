'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getAudioFileExtension, getSupportedAudioMimeType } from '@/lib/audio';
import { logger } from '@/lib/logger';

interface AudioRecorderProps {
  onTranscriptComplete: (
    transcript: string,
    audioBlob: Blob,
    duration: number
  ) => void;
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
  const recordingStartRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioMimeTypeRef = useRef<string>('');

  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

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
        },
      });

      const supportedMimeType = getSupportedAudioMimeType() || '';
      setAudioMimeType(supportedMimeType);
      audioMimeTypeRef.current = supportedMimeType;

      const mediaRecorder = new MediaRecorder(
        stream,
        supportedMimeType ? { mimeType: supportedMimeType } : undefined
      );

      streamRef.current = stream;
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      recordingStartRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        setRecordingTime(elapsed);
        if (elapsed >= maxDuration) {
          handleStop();
        }
      }, 100);

      toast.success('Kayıt başladı');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Mikrofon erişimi reddedildi');
    }
  };

  const handleStop = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const recorder = mediaRecorderRef.current;
    const stopPromise = new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
    });

    recorder.stop();
    setIsRecording(false);
    stopTimer();

    await stopPromise;
    stopStream();

    const blobType = audioMimeTypeRef.current || audioMimeType || 'audio/webm';
    const recordedBlob = new Blob(audioChunksRef.current, {
      type: blobType,
    });
    audioChunksRef.current = [];

    const duration = Math.floor((Date.now() - recordingStartRef.current) / 1000);

    setIsProcessing(true);
    try {
      const formData = new FormData();
      const extension = getAudioFileExtension(blobType);
      formData.append('audio', recordedBlob, `recording_${Date.now()}.${extension}`);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        // ignore body parsing issues and fall back to generic errors
      }

      if (!response.ok) {
        const error: any = new Error(payload?.error || 'Transcription failed');
        error.status = response.status;
        error.details = payload?.details;
        throw error;
      }

      const { transcript } = payload || {};

      logger.debug('Real Whisper transcript:', transcript);

      onTranscriptComplete(transcript, recordedBlob, duration);
    } catch (error: any) {
      console.error('Transcription error:', error);
      if (error?.status === 429) {
        toast.error(`Çok fazla istek. ${
          error?.details && typeof error.details === 'string'
            ? error.details
            : 'Lütfen bekleyin.'
        }`);
      } else {
        toast.error('Ses tanıma başarısız oldu');
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
        onClick={isRecording ? handleStop : startRecording}
        disabled={disabled || isProcessing}
        className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all duration-200
          ${isRecording ? 'bg-thy-red hover:bg-thy-darkRed animate-pulse' : 'bg-thy-red hover:bg-thy-darkRed'}
          ${(disabled || isProcessing) && 'cursor-not-allowed opacity-50'}`}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        ) : isRecording ? (
          <Square className="h-8 w-8 text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </button>

      {isRecording && (
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-thy-red">
            {formatTime(recordingTime)}
          </div>
          <div className="mt-1 text-sm text-gray-500">Max: {formatTime(maxDuration)}</div>
        </div>
      )}

      {isProcessing && <div className="text-sm text-gray-600">İşleniyor...</div>}

      {!isRecording && !isProcessing && (
        <div className="text-center text-sm text-gray-500">
          {disabled ? 'Kredi yükleyin' : 'Kayda başlamak için tıklayın'}
        </div>
      )}
    </div>
  );
}
