
import React from 'react';
import { AudioFile, FileStatus, SUPPORTED_FORMATS, AudioFormat } from '../types';
import StatusBadge from './StatusBadge';

interface FileItemProps {
  file: AudioFile;
  onConvert: () => void;
  onRemove: () => void;
  onFormatChange: (format: AudioFormat) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onConvert, onRemove, onFormatChange }) => {
  const isProcessing = [FileStatus.UPLOADING, FileStatus.CONVERTING].includes(file.status);
  const isDone = file.status === FileStatus.COMPLETED;
  
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgress = () => {
    if (file.status === FileStatus.UPLOADING) return file.uploadProgress;
    if (file.status === FileStatus.CONVERTING) return file.convertProgress;
    if (isDone) return 100;
    return 0;
  };

  return (
    <div className={`glass-panel p-4 rounded-2xl flex flex-col gap-3 transition-all ${isProcessing ? 'border-blue-500/30' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate pr-4">{file.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500">{formatSize(file.size)}</span>
              <span className="text-zinc-700">•</span>
              <StatusBadge status={file.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isProcessing && !isDone && (
            <div className="flex items-center bg-zinc-800 rounded-lg p-1 border border-zinc-700">
              <span className="text-[10px] px-2 text-zinc-500 font-bold uppercase">To</span>
              <select 
                value={file.targetFormat}
                onChange={(e) => onFormatChange(e.target.value as AudioFormat)}
                className="bg-transparent text-sm font-semibold outline-none focus:ring-0 cursor-pointer pr-2"
              >
                {SUPPORTED_FORMATS.map(fmt => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {file.status === FileStatus.IDLE && (
              <button 
                onClick={onConvert}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Convert
              </button>
            )}

            {isDone && file.resultUrl && (
              <a 
                href={file.resultUrl} 
                download={`${file.name.split('.').slice(0, -1).join('.')}.${file.targetFormat}`}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              >
                Download
              </a>
            )}

            {!isProcessing && (
              <button 
                onClick={onRemove}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="w-full mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
              {file.status === FileStatus.UPLOADING ? 'Uploading to server...' : 'Converting format...'}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold">{getProgress()}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ease-out ${file.status === FileStatus.UPLOADING ? 'bg-blue-500' : 'bg-indigo-500'}`}
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      )}

      {file.aiDescription && (
        <div className="mt-1 flex items-start gap-2 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 animate-in fade-in zoom-in-95">
          <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">AI</div>
          <p className="text-xs text-blue-200/80 leading-relaxed italic">
            "{file.aiDescription}"
          </p>
        </div>
      )}
    </div>
  );
};

export default FileItem;
