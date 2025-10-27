import { logger } from './logger';

/**
 * Determine the best supported audio MIME type for MediaRecorder.
 * Priority order: WebM -> MP4 -> MP3 -> WAV.
 */
export function getSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    logger.warn('MediaRecorder is not available in this environment');
    return '';
  }

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mpeg',
    'audio/wav',
  ];

  for (const type of types) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        logger.info('Using audio MIME type:', type);
        return type;
      }
    } catch {
      // Some browsers throw when checking experimental codecs; ignore and continue.
    }
  }

  logger.warn('No explicitly supported audio MIME type found, using browser default');
  return '';
}

/**
 * Map MIME types to reasonable filename extensions.
 */
export function getAudioFileExtension(mimeType: string): string {
  const normalized = (mimeType || '').toLowerCase();

  if (normalized.includes('webm')) return 'webm';
  if (normalized.includes('mp4') || normalized.includes('m4a')) return 'm4a';
  if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3';
  if (normalized.includes('wav')) return 'wav';

  return 'webm';
}
