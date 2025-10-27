'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, RotateCcw, Play, Pause, AlertCircle } from 'lucide-react';

import { getSupportedAudioMimeType } from '@/lib/audio';

interface ExamAudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number;
  disabled?: boolean;
}

type RecorderState = 'idle' | 'recording' | 'review';

export function ExamAudioRecorder({
  onRecordingComplete,
  maxDuration = 120,
  disabled = false,
}: ExamAudioRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioMimeTypeRef = useRef<string>('');

  useEffect(() => {
    return () => {
      stopRecording(true);
      stopVisualizer();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyserRef.current?.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#EF233C';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, []);

  const stopVisualizer = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    analyserRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    analyserRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
  };

  const startRecording = async () => {
    if (disabled || state === 'recording') return;
    setError(null);
    try {
      if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
        setError('Tarayıcınız ses kaydını desteklemiyor.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });

      streamRef.current = stream;
      const supportedMimeType = getSupportedAudioMimeType() || '';
      setAudioMimeType(supportedMimeType);
      audioMimeTypeRef.current = supportedMimeType;
      const mediaRecorder = new MediaRecorder(
        stream,
        supportedMimeType ? { mimeType: supportedMimeType } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      startVisualizer();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) return;
        const blobType = audioMimeTypeRef.current || audioMimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        const url = URL.createObjectURL(blob);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setPendingBlob(blob);
        setState('review');
      };

      mediaRecorder.start();
      setState('recording');
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev + 1 >= maxDuration) {
            stopRecording();
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Recorder error:', err);
      setError('Mikrofona erişilemedi. Lütfen izin verdiğinizden emin olun.');
    }
  };

  const stopRecording = (skipStateUpdate = false) => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    stopVisualizer();

    if (!skipStateUpdate) {
      setState('review');
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setTimer(0);
    setState('idle');
    setError(null);
    setPendingBlob(null);
    setIsPlaying(false);
  };

  const togglePlayback = async () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formattedTime = new Date(timer * 1000).toISOString().substring(14, 19);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={state === 'recording' ? () => stopRecording() : startRecording}
          disabled={disabled}
          className={`flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition ${
            state === 'recording'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-thy-red hover:bg-thy-darkRed'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {state === 'recording' ? (
            <Square className="h-10 w-10 text-white" />
          ) : (
            <Mic className="h-10 w-10 text-white" />
          )}
        </button>

        <div className="text-center">
          <p className="text-3xl font-mono font-semibold text-gray-900">{formattedTime}</p>
          <p className="text-sm text-gray-500">Max {maxDuration} sn</p>
        </div>
      </div>

      <canvas ref={canvasRef} width={600} height={120} className="w-full rounded-xl bg-gray-100" />

      {state === 'review' && audioUrl && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Kaydı Önizle</p>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="rounded-full border border-gray-200 p-3 text-gray-700 hover:bg-gray-50"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-thy-red transition-all"
                  style={{ width: `${Math.min((timer / maxDuration) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Kaydınızı dinledikten sonra yeniden kaydedebilirsiniz.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={resetRecording}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Yeniden Kaydet
            </button>
            <button
              onClick={() => pendingBlob && onRecordingComplete(pendingBlob)}
              disabled={!pendingBlob}
              className="flex flex-1 items-center justify-center rounded-lg bg-thy-red px-4 py-2 text-sm font-semibold text-white shadow hover:bg-thy-darkRed disabled:cursor-not-allowed disabled:bg-gray-200"
            >
              Kaydı Onayla
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
