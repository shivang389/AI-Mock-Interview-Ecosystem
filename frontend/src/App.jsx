import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InterviewSession from './pages/InterviewSession';
import Register from './pages/Register';
import API from './services/api';
import EvaluationDashboard from './pages/EvaluationDashboard';

export default function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingApp, setLoadingApp] = useState(true);

  // 1. Initial Lifecycle Boot Check: Validate if a user token exists in browser storage
  useEffect(() => {
    function verifySessionState() {
      try {
        const storedAuth = localStorage.getItem('amie-auth');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth?.token) {
            console.log("🔑 [APP REFRESH]: Found valid session token signature map.");
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error("⚠️ [APP SESSION CORRUPTION]: Local storage token is invalid:", err);
        localStorage.removeItem('amie-auth');
      } finally {
        setLoadingApp(false);
      }
    }

    verifySessionState();
  }, []);

  // 2. Dynamic Launcher Routine: Spins up unique interview tracks in the database
  const handleStartInterview = async (trackId) => {
    console.log(`📡 [INITIALIZING TRACK]: Preparing instance pipeline for -> ${trackId}`);
    try {
      const storedAuth = JSON.parse(localStorage.getItem('amie-auth'));
      const activeToken = storedAuth?.token;

      if (!activeToken) {
        alert("Session identity dropped. Re-authenticating context profiles.");
        window.location.href = '/register';
        return;
      }

      // Explicitly post the precise trackId key straight to your backend route endpoint
      const response = await API.post('/interview/start', { trackId }, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });

      if (response.data.success) {
        const sessionPayload = response.data.data;
        console.log(`🎯 [TRACK READY]: Launching interview room session index: ${sessionPayload.sessionId}`);

        // Route parameter state transformation bundle injection
        navigate('/interview', { 
          state: { 
            sessionId: sessionPayload.sessionId, 
            initialQuestion: sessionPayload.nextQuestion, 
            currentRound: sessionPayload.currentRound, 
            totalRounds: sessionPayload.totalRounds,
            trackId: trackId 
          } 
        });
      }
    } catch (err) {
      console.error("❌ [LAUNCHER FAIL]: Session initialization stalled on network layer:", err);
      const backendMessage = err.response?.data?.error?.message || err.message || "Unknown backend connection reject.";
      alert(`Simulation Setup Failed: ${backendMessage}`);
    }
  };

  // Prevent router flashes while local files resolve token properties
  if (loadingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-2 animate-pulse">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Calibrating Workspace Framework...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Central Application Navigation Frame Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <span className="bg-indigo-600 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105">
              A
            </span>
            <span className="font-black tracking-tight text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
              AMIE <span className="text-indigo-500 font-medium text-xs tracking-wider uppercase ml-1">v1.2</span>
            </span>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase select-none">
                Placement Simulation Connected
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Primary Endpoint Client Workspace Routes Matrix */}
      <main className="py-8 px-4">
        <Routes>
          {/* Main Workspace Gatekeeper Guard: Redirect to gateway panel if token isn't found */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard onStartInterview={handleStartInterview} /> : <Navigate to="/register" replace />} 
          />
          
          <Route 
            path="/interview" 
            element={isAuthenticated ? <InterviewSession /> : <Navigate to="/register" replace />} 
          />

          {/* ADDED: Evaluation Dashboard Scoreboard Path mapping */}
          <Route 
            path="/evaluation-dashboard" 
            element={isAuthenticated ? <EvaluationDashboard /> : <Navigate to="/register" replace />} 
          />

          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} 
          />

          {/* Catch-all Fallback Safety Net Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    </div>
  );
}