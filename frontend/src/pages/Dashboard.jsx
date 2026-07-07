import React, { useState } from 'react';
import ResumeUploader from '../components/ResumeUploader';

export default function Dashboard({ onStartInterview }) {
  const [isUploaded, setIsUploaded] = useState(false);
  const [recommendedRole, setRecommendedRole] = useState('');
  
  // NEW: State containers managing ATS score metric returns
  const [atsScore, setAtsScore] = useState(0);
  const [atsFeedback, setAtsFeedback] = useState([]);

  const tracks = [
    { 
      id: 'core-cs', 
      title: 'Core B.Tech CS Fundamentals', 
      desc: 'Comprehensive screening across DSA, DAA logic optimization, Operating Systems, Computer Networks, and DBMS architecture.', 
      difficulty: 'Hard',
      requiresResume: false
    },
    { 
      id: 'resume-dive', 
      title: 'Resume & Project Deep-Dive', 
      desc: 'Granular assessment focused on your individual tech stack choices, code repositories, full-stack tools, and system architecture parameters.', 
      difficulty: 'Adaptive',
      requiresResume: true
    }
  ];

  const handleUploadComplete = (responseData) => {
    // Dynamically unpack entire structural payload parameters returned from auth.controller.js
    setRecommendedRole(responseData.recommendedRole || 'software_engineer');
    setAtsScore(responseData.atsScore || 70);
    setAtsFeedback(responseData.atsFeedback || []);
    setIsUploaded(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('amie-auth');
    window.location.href = '/register';
  };

  // Determine dynamic ring indicator colors based on standard recruiter score benchmarks
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500 bg-emerald-50/50';
    if (score >= 60) return 'text-amber-500 border-amber-500 bg-amber-50/50';
    return 'text-rose-500 border-rose-500 bg-rose-50/50';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 animate-fade-in">
      
      {/* Top Welcome Action Bar */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">AMIE Placement Simulator</h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            Select a core computer science foundational evaluation or upload your credentials to launch a customized resume review.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-white/10 hover:bg-rose-600/20 text-indigo-100 hover:text-rose-200 border border-white/20 hover:border-rose-500/30 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wide transition-all cursor-pointer shadow-sm"
        >
          Sign Out Securely 👤
        </button>
      </div>

      {/* Upload Conditional Section Block */}
      {!isUploaded ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <ResumeUploader onUploadSuccess={handleUploadComplete} />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Synchronized Success Toast Message Alert */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm font-bold text-emerald-900">Resume Metrics Synchronized</p>
                <p className="text-xs text-emerald-700">
                  Data layer locked. The <strong className="uppercase">{recommendedRole.replace('_', ' ')}</strong> track parameters and customized resume analysis matrices are calibrated.
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setIsUploaded(false)} 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Re-upload profile
            </button>
          </div>

          {/* NEW: ATS Feedback Optimization Analysis Panel Card Widget layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            <div className={`border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm bg-white ${getScoreColorClass(atsScore)}`}>
              <span className="text-[10px] font-black tracking-wider uppercase opacity-60 mb-2">Calculated ATS Score</span>
              <div className="w-24 h-24 rounded-full border-8 flex items-center justify-center font-black text-3xl tracking-tight bg-white shadow-inner">
                {atsScore}%
              </div>
              <p className="text-xs font-bold mt-4 text-slate-700">
                {atsScore >= 80 ? 'Excellent Recruiter Fit' : atsScore >= 60 ? 'Good Structural Baseline' : 'Critical Fixes Required'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:col-span-2 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center space-x-2">
                  <span>🧠</span> <span>AMIE Resume Optimization Roadmap</span>
                </h3>
                <ul className="space-y-2">
                  {atsFeedback.map((tip, idx) => (
                    <li key={idx} className="text-slate-600 text-xs flex items-start space-x-2 leading-relaxed">
                      <span className="text-indigo-500 font-extrabold select-none">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                  {atsFeedback.length === 0 && (
                    <li className="text-slate-400 text-xs italic">No critical errors captured. Your resume contains excellent keyword matching.</li>
                  )}
                </ul>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-4">
                ATS scoring matrices are calculated on semantic similarity, quantitative metrics impact, and structural parsing filters.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Simulation Tracks Visual Presentation Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Available Assessment Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => {
            const shouldHighlight = track.id === 'resume-dive' ? isUploaded : !isUploaded;

            return (
              <div 
                key={track.id} 
                className={`bg-white border rounded-xl p-6 shadow-sm transition-all flex flex-col justify-between relative ${
                  shouldHighlight 
                    ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.01]' 
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{track.title}</h3>
                      {track.id === 'resume-dive' && isUploaded && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 inline-block">
                          ⭐ Tailored To Your Profile
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-600">
                      {track.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">{track.desc}</p>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (track.requiresResume && !isUploaded) {
                      alert("Please upload your resume first to activate this specialized review lane.");
                      return;
                    }
                    onStartInterview(track.id);
                  }}
                  className={`w-full font-bold py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow-sm text-center block ${
                    shouldHighlight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {track.requiresResume && !isUploaded ? 'Upload Resume to Unlock' : 'Launch Live Simulator'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}