import React, { useRef, useState } from 'react';
import { analyzeResume } from '../services/geminiService';
import { ResumeData } from '../types';

interface ResumeUploaderProps {
  onResumeAnalyzed: (data: ResumeData) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onResumeAnalyzed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    
    // Validate type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or an Image (PNG, JPG).");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const data = await analyzeResume(base64String, file.type);
          onResumeAnalyzed(data);
        } catch (err: any) {
          setError(err.message || "Failed to analyze resume.");
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setIsAnalyzing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <div 
        className={`
          relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer
          ${isDragging ? 'border-brand-500 bg-brand-900/20' : 'border-slate-600 hover:border-brand-400 hover:bg-slate-800/50'}
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf, .png, .jpg, .jpeg"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
            {isAnalyzing ? (
               <i className="fas fa-circle-notch fa-spin text-2xl text-white"></i>
            ) : (
               <i className="fas fa-cloud-upload-alt text-2xl text-white"></i>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white">
              {isAnalyzing ? 'Analyzing your profile...' : 'Upload your Resume'}
            </h3>
            <p className="text-slate-400 mt-2 text-sm">
              Drag & drop or click to upload (PDF, PNG, JPG). <br/>
              <span className="text-xs text-slate-500">We use AI to extract your skills for better matching.</span>
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm animate-fade-in">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;