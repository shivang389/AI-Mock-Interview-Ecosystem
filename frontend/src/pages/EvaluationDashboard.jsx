import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function EvaluationDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      alert("No score identifier reference found. Shifting back to main dashboard.");
      navigate('/');
      return;
    }

    async function fetchScoreMetrics() {
      try {
        const authData = JSON.parse(localStorage.getItem('amie-auth'));
        const response = await API.get(`/interview/evaluation/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${authData?.token}` }
        });

        if (response.data.success) {
          setReport(response.data.data);
        }
      } catch (err) {
        console.error("❌ [EVALUATION FETCH REJECTION]:", err);
        alert("Failed to compile final score metrics.");
      } finally {
        setLoading(false);
      }
    }

    fetchScoreMetrics();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs font-black text-slate-400 tracking-wider uppercase">Synthesizing AI Placement Metrics Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex justify-between items-center shadow-md">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">Session Complete</span>
          <h1 className="text-2xl font-black tracking-tight">Your Interview Scorecard</h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          Return Home 🏠
        </button>
      </div>

      {/* Metrics Distribution Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-indigo-900 text-white border border-indigo-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 mb-2">Overall Assessment</span>
          <div className="text-4xl font-black tracking-tight mb-1">{report?.overallScore}%</div>
          <div className="text-[10px] bg-white/10 text-indigo-100 font-bold px-2 py-0.5 rounded-md uppercase">
            {report?.overallScore >= 80 ? 'Placement Ready' : report?.overallScore >= 60 ? 'Needs Practice' : 'Critical Focus'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Technical Accuracy</span>
          <div className="text-3xl font-black text-slate-800 tracking-tight">{report?.technicalAccuracy}%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Problem Solving</span>
          <div className="text-3xl font-black text-slate-800 tracking-tight">{report?.problemSolving}%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Communication</span>
          <div className="text-3xl font-black text-slate-800 tracking-tight">{report?.communicationSkills}%</div>
        </div>

      </div>

      {/* Strengths and Weaknesses Breakdown Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-emerald-800 text-sm uppercase tracking-wide flex items-center space-x-2">
            <span>🟢</span> <span>Core Engineering Strengths</span>
          </h3>
          <ul className="space-y-2.5">
            {report?.strengths.map((point, idx) => (
              <li key={idx} className="text-slate-600 text-xs flex items-start space-x-2 leading-relaxed">
                <span className="text-emerald-500 select-none font-bold">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-rose-800 text-sm uppercase tracking-wide flex items-center space-x-2">
            <span>🔴</span> <span>Strategic Areas to Optimize</span>
          </h3>
          <ul className="space-y-2.5">
            {report?.weaknesses.map((point, idx) => (
              <li key={idx} className="text-slate-600 text-xs flex items-start space-x-2 leading-relaxed">
                <span className="text-rose-400 select-none font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}