
import React, { useState } from 'react';
import { AudioFile, FileStatus, SUPPORTED_FORMATS, AudioFormat } from '../types';
import StatusBadge from './StatusBadge';

interface FileItemProps {
  file: AudioFile;
  onConvert: () => void;
  onRemove: () => void;
  onFormatChange: (format: AudioFormat) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onConvert, onRemove, onFormatChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isProcessing = [FileStatus.UPLOADING, FileStatus.CONVERTING].includes(file.status);
  const isDone = file.status === FileStatus.COMPLETED;
  
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getProgress = () => {
    if (file.status === FileStatus.UPLOADING) return file.uploadProgress;
    if (file.status === FileStatus.CONVERTING) return file.convertProgress;
    if (isDone) return 100;
    return 0;
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`glass-panel p-5 rounded-2xl flex flex-col gap-4 transition-all duration-300 ${isProcessing ? 'border-blue-500/20 ring-1 ring-blue-500/10' : ''} ${isDone ? 'border-green-500/10' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={togglePlayback}
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            {isPlaying ? (
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <audio 
            ref={audioRef} 
            src={URL.createObjectURL(file.originalFile)} 
            onEnded={() => setIsPlaying(false)}
            className="hidden" 
          />

          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate pr-4 text-white">{file.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-zinc-500">{formatSize(file.size)}</span>
              <span className="text-zinc-800">|</span>
              <StatusBadge status={file.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isProcessing && !isDone && (
            <div className="flex items-center bg-zinc-900 rounded-xl p-1.5 border border-zinc-800">
              <span className="text-[9px] px-2 text-zinc-500 font-bold uppercase tracking-widest">To</span>
              <select 
                value={file.targetFormat}
                onChange={(e) => onFormatChange(e.target.value as AudioFormat)}
                className="bg-transparent text-xs font-bold outline-none focus:ring-0 cursor-pointer pr-2 appearance-none text-blue-500"
              >
                {SUPPORTED_FORMATS.map(fmt => (
                  <option key={fmt} value={fmt} className="bg-zinc-900">{fmt.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {file.status === FileStatus.IDLE && (
              <button 
                onClick={onConvert}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Start
              </button>
            )}

            {isDone && file.resultUrl && (
              <a 
                href={file.resultUrl} 
                download={`${file.name.split('.').slice(0, -1).join('.')}.${file.targetFormat}`}
                className="bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
              >
                Download
              </a>
            )}

            {!isProcessing && (
              <button 
                onClick={onRemove}
                className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/5"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {file.status === FileStatus.UPLOADING ? 'Uploading...' : 'Processing Engine...'}
              </span>
            </div>
            <span className="text-[10px] text-blue-400 font-black tabular-nums">{Math.round(getProgress())}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ease-out shadow-sm ${file.status === FileStatus.UPLOADING ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      )}

      {file.aiDescription && (
        <div className="flex items-start gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="mt-0.5 w-5 h-5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311L4.5 14.877a.75.75 0 01-1.28-.53V4.125a.75.75 0 011.28-.53l1.3 1.3.311-.313a5.5 5.5 0 018.141 8.141l.311.312a.75.75 0 01-.53 1.28h-9.75a.75.75 0 01-.53-1.28l.313-.311z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[11px] text-blue-200/70 leading-relaxed font-medium italic">
            AI Insight: "{file.aiDescription}"
          </p>
        </div>
      )}
    </div>
  );
};

export default FileItem;
