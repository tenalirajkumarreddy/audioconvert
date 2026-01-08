
import React, { useState, useCallback, useRef } from 'react';
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

    // Fix: Explicitly type 'file' as 'File' to resolve 'unknown' property access errors (lines 17, 20, 21)
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
    if (!fileItem) return;

    // 1. Upload Phase (Simulated)
    updateFile(id, { status: FileStatus.UPLOADING, uploadProgress: 0 });
    for (let p = 0; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 150));
      updateFile(id, { uploadProgress: p });
    }
    updateFile(id, { status: FileStatus.UPLOADED });

    // 2. Conversion Phase (Simulated + AI Analysis)
    updateFile(id, { status: FileStatus.CONVERTING, convertProgress: 0 });
    
    // Start AI analysis in background
    analyzeAudio(fileItem.originalFile).then((desc) => {
      updateFile(id, { aiDescription: desc });
    });

    for (let p = 0; p <= 100; p += 5) {
      await new Promise((r) => setTimeout(r, 100));
      updateFile(id, { convertProgress: p });
    }

    // Create mock converted blob for download
    const mockBlob = new Blob([fileItem.originalFile], { type: `audio/${fileItem.targetFormat}` });
    const resultUrl = URL.createObjectURL(mockBlob);

    updateFile(id, { 
      status: FileStatus.COMPLETED, 
      resultUrl 
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === FileStatus.COMPLETED && f.resultUrl);
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    for (const file of completedFiles) {
      const response = await fetch(file.resultUrl!);
      const blob = await response.blob();
      const ext = file.targetFormat;
      const baseName = file.name.split('.').slice(0, -1).join('.');
      zip.file(`${baseName}.${ext}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sonicshift_converted_${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFormatChange = (id: string, format: AudioFormat) => {
    updateFile(id, { targetFormat: format });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="flex flex-col gap-6">
          <section className="glass-panel p-10 rounded-3xl border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center transition-all hover:border-blue-500/50 group">
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
              className="cursor-pointer flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Select Audio Files</h2>
                <p className="text-zinc-500 mt-1">MP3, WAV, M4A, MP4 (Audio), and M4R supported</p>
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

      {/* Persistent Call-to-Action */}
      {files.some(f => f.status === FileStatus.COMPLETED) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <button
            onClick={downloadAll}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full shadow-2xl shadow-blue-500/20 flex items-center gap-3 transition-all transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a3.375 3.375 0 003.375 3.375h9.75a3.375 3.375 0 003.375-3.375V16.5a.75.75 0 011.5 0v2.25a4.875 4.875 0 01-4.875 4.875h-9.75A4.875 4.875 0 012.25 18.75V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Download All (ZIP)
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
