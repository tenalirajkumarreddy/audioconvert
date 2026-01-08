
import React from 'react';
import { AudioFile, AudioFormat } from '../types';
import FileItem from './FileItem';

interface ConverterProps {
  files: AudioFile[];
  onConvert: (id: string) => void;
  onRemove: (id: string) => void;
  onDownloadAll: () => void;
  onFormatChange: (id: string, format: AudioFormat) => void;
}

const Converter: React.FC<ConverterProps> = ({ 
  files, 
  onConvert, 
  onRemove, 
  onDownloadAll,
  onFormatChange
}) => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Processing Queue
          <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">{files.length} items</span>
        </h3>
        {files.length > 1 && (
           <button 
           onClick={() => files.forEach(f => f.status === 'IDLE' && onConvert(f.id))}
           className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-2 transition-colors"
         >
           Convert All
         </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {files.map((file) => (
          <FileItem 
            key={file.id} 
            file={file} 
            onConvert={() => onConvert(file.id)} 
            onRemove={() => onRemove(file.id)}
            onFormatChange={(fmt) => onFormatChange(file.id, fmt)}
          />
        ))}
      </div>
    </div>
  );
};

export default Converter;
