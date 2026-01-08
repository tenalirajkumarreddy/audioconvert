
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Converter from './components/Converter';
import { AudioFile, FileStatus, AudioFormat } from './types';
import { analyzeAudio } from './services/geminiService';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: AudioFile[] = Array.from(selectedFiles).map((file: File) => ({
      id: Math.random().toString(36).substring(7),
      originalFile: file,
      name: file.name,
      size: file.size,
      status: FileStatus.IDLE,
      uploadProgress: 0,
      convertProgress: 0,
      targetFormat: 'mp3',
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateFile = (id: string, updates: Partial<AudioFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const startConversion = async (id: string) => {
    const fileItem = files.find((f) => f.id === id);
    if (!fileItem || fileItem.status !== FileStatus.IDLE) return;

    // 1. Upload Phase
    updateFile(id, { status: FileStatus.UPLOADING, uploadProgress: 0 });
    const uploadInterval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const next = Math.min(f.uploadProgress + Math.random() * 20, 100);
          return { ...f, uploadProgress: next };
        }
        return f;
      }));
    }, 150);

    await new Promise(r => setTimeout(r, 1200));
    clearInterval(uploadInterval);
    updateFile(id, { status: FileStatus.UPLOADED, uploadProgress: 100 });

    // 2. Conversion Phase + AI Analysis
    updateFile(id, { status: FileStatus.CONVERTING, convertProgress: 0 });
    
    // Non-blocking AI analysis
    analyzeAudio(fileItem.originalFile).then((desc) => {
      updateFile(id, { aiDescription: desc });
    });

    const convertInterval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const next = Math.min(f.convertProgress + Math.random() * 15, 100);
          return { ...f, convertProgress: next };
        }
        return f;
      }));
    }, 200);

    await new Promise(r => setTimeout(r, 2000));
    clearInterval(convertInterval);

    // Create result
    const mockBlob = new Blob([fileItem.originalFile], { type: `audio/${fileItem.targetFormat}` });
    const resultUrl = URL.createObjectURL(mockBlob);

    updateFile(id, { 
      status: FileStatus.COMPLETED, 
      convertProgress: 100,
      resultUrl 
    });
  };

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.resultUrl) URL.revokeObjectURL(file.resultUrl);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === FileStatus.COMPLETED && f.resultUrl);
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    for (const file of completedFiles) {
      try {
        const response = await fetch(file.resultUrl!);
        const blob = await response.blob();
        const baseName = file.name.split('.').slice(0, -1).join('.');
        zip.file(`${baseName}.${file.targetFormat}`, blob);
      } catch (e) {
        console.error("Failed to add file to zip:", file.name, e);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SonicShift_Export_${new Date().toISOString().slice(0,10)}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFormatChange = (id: string, format: AudioFormat) => {
    updateFile(id, { targetFormat: format });
  };

  return (
    <div className="min-h-screen pb-32">
      <Header />
      <main className="max-w-4xl mx-auto px-6 mt-12">
        <div className="flex flex-col gap-10">
          <section 
            className="glass-panel p-16 rounded-[40px] border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center transition-all hover:border-blue-500/40 group relative overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                const event = { target: { files: e.dataTransfer.files } } as any;
                handleFileSelect(event);
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <input
              type="file"
              id="fileInput"
              className="hidden"
              multiple
              accept="audio/*,video/mp4"
              onChange={handleFileSelect}
              ref={fileInputRef}
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer flex flex-col items-center gap-6 text-center z-10"
            >
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all duration-500 ring-1 ring-blue-500/20 shadow-2xl shadow-blue-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Drop audio files here</h2>
                <p className="text-zinc-400 font-medium max-w-xs mx-auto leading-relaxed">
                  Support for MP3, WAV, M4A, MP4 (Video), and M4R formats. 
                  <span className="text-blue-500 block mt-1">Up to 100MB per file.</span>
                </p>
              </div>
            </label>
          </section>

          {files.length > 0 && (
            <Converter
              files={files}
              onConvert={startConversion}
              onRemove={removeFile}
              onDownloadAll={downloadAll}
              onFormatChange={handleFormatChange}
            />
          )}
        </div>
      </main>

      {/* Persistent Call-to-Action Bar */}
      {files.some(f => f.status === FileStatus.COMPLETED) && (
        <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <button
            onClick={downloadAll}
            className="bg-white text-black font-bold py-4 px-12 rounded-full shadow-2xl shadow-white/5 flex items-center gap-4 transition-all hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a3.375 3.375 0 003.375 3.375h9.75a3.375 3.375 0 003.375-3.375V16.5a.75.75 0 011.5 0v2.25a4.875 4.875 0 01-4.875 4.875h-9.75A4.875 4.875 0 012.25 18.75V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Download Export Bundle
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
