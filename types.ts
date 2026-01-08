
export enum FileStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  CONVERTING = 'CONVERTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type AudioFormat = 'mp3' | 'wav' | 'm4a' | 'mp4' | 'm4r' | 'ogg' | 'aac';

export interface AudioFile {
  id: string;
  originalFile: File;
  name: string;
  size: number;
  status: FileStatus;
  uploadProgress: number;
  convertProgress: number;
  targetFormat: AudioFormat;
  resultUrl?: string;
  aiDescription?: string;
}

export const SUPPORTED_FORMATS: AudioFormat[] = ['mp3', 'wav', 'm4a', 'mp4', 'm4r', 'ogg', 'aac'];
