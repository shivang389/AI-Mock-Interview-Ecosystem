import React, { useState } from 'react';
import API from '../services/api';

export default function ResumeUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus({ type: '', message: '' });
    } else {
      setFile(null);
      setStatus({ type: 'error', message: '❌ Please select a valid PDF document.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file); // Field name must match '.single("resume")' on backend

    setUploading(true);
    setStatus({ type: 'info', message: '⏳ Extracting text layers and syncing cloud storage...' });

    try {
      const response = await API.post('/auth/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus({
        type: 'success',
        message: '✅ Profile synchronized successfully! Gemini will now tailor questions to your experience.',
      });
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data.resumeUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.error?.message || '❌ Upload execution failed. Verify your Cloudinary configuration.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 max-w-2xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Tailor Your AI Mock Interview</h2>
        <p className="text-sm text-slate-500">
          Upload your PDF resume. Our extraction engine will feed your project milestones, MERN stack patterns, or Machine Learning experience directly into the Gemini model.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-1 text-sm text-slate-500 font-medium">
                {file ? `Selected: ${file.name}` : 'Click to upload your resume (PDF only)'}
              </p>
              <p className="text-xs text-slate-400">Max size: 5MB</p>
            </div>
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            {uploading ? 'Processing Resume...' : 'Upload & Tailor Track'}
          </button>
        </div>
      </form>

      {status.message && (
        <div className={`mt-4 p-3 rounded-lg text-xs font-medium border ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          status.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' :
          'bg-blue-50 text-blue-800 border-blue-100'
        }`}>
          {status.message}
        </div>
      )}
    </div>
  );
}