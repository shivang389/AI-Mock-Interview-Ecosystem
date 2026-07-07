import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const activeStreamRef = useRef(null);
  
  // Structural references tracking local speech recognition context wrappers
  const recognitionRef = useRef(null);

  const { sessionId, initialQuestion, currentRound, totalRounds, trackId } = location.state || {};

  const [chatHistory, setChatHistory] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [roundTracker, setRoundTracker] = useState(currentRound || 1);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Local state tracking microphone recording operations
  const [isListening, setIsListening] = useState(false);

  // 🛑 UPGRADED: Hardware shutdown with DOM teardown safety checks
  const shutDownHardwareCamera = () => {
    console.log("📷 [HARDWARE]: Initializing global media stream breakdown pipeline...");
    window.speechSynthesis.cancel();

    // Turn off active microphone listening handlers safely
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore if speech engine is already inactive
      }
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        track.stop(); // Physically cuts power to the webcam hardware
        track.enabled = false;
      });
      activeStreamRef.current = null;
    }
  };

  // 1. Initialize WebRTC Media Stream Secure Hooks
  useEffect(() => {
    let isMounted = true; // 🛡️ SAFETY TRAP: Tracks if component is currently mounted

    async function enableWebcam() {
      try {
        console.log("📹 [HARDWARE]: Requesting media stream capture permissions...");
        const processStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }, 
          audio: false 
        });
        
        // 🛡️ LOOPHOLE 1 CLOSED: If user navigated away before camera resolved, kill tracks immediately!
        if (!isMounted) {
          console.warn("⚠️ [WEBCAM]: Camera resolved after page unmount. Killing hardware tracks instantly...");
          processStream.getTracks().forEach(track => track.stop());
          return;
        }

        activeStreamRef.current = processStream;
        if (videoRef.current) {
          videoRef.current.srcObject = processStream;
        }
      } catch (err) {
        console.warn("⚠️ [WEBCAM BLOCK]: Device access denied or capture busy:", err.message);
      }
    }

    // 2. Initialize Native Browser Speech Recognition Modules
    function initializeSpeechEngine() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn("⚠️ [SPEECH ENGINE UNSUPPORTED]: Web Speech API is missing in this browser sandbox.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening until the user explicitly turns it off
      recognition.interimResults = false; // Capture fully parsed text chunks
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (isMounted) setIsListening(true);
        console.log("🎙️ [MIC ACTIVE]: Speech transcription stream streaming live...");
      };

      recognition.onresult = (event) => {
        if (!isMounted) return;
        const structuralSpeechChunk = event.results[event.results.length - 1][0].transcript;
        console.log(`📝 [SPEECH TRANSCRIBED]: Caught string data: ${structuralSpeechChunk}`);
        
        // Append spoken text dynamically straight into your message input container text area
        setUserAnswer((prevText) => {
          const spacingSpacer = prevText.trim().length > 0 ? ' ' : '';
          return prevText + spacingSpacer + structuralSpeechChunk;
        });
      };

      recognition.onerror = (speechErr) => {
        console.error("❌ [SPEECH ENGINE FAULT]:", speechErr.error);
        if (speechErr.error !== 'no-speech' && isMounted) {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isMounted) setIsListening(false);
        console.log("🎙️ [MIC INACTIVE]: Stopped stream transcript tracing.");
      };

      recognitionRef.current = recognition;
    }

    enableWebcam();
    initializeSpeechEngine();

    // 🛡️ LOOPHOLE 2 CLOSED: Catch browser refreshes (F5), back button hits, and tab closures
    const handleBeforeUnload = () => {
      shutDownHardwareCamera();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 🛑 React component unmount cleanup
    return () => {
      isMounted = false; // Trip the safety trap
      window.removeEventListener('beforeunload', handleBeforeUnload);
      shutDownHardwareCamera();
    };
  }, []);

  // Audio capture button action router switch handlers
  const handleToggleVoiceCapture = () => {
    if (!recognitionRef.current) {
      alert("Voice tracking is unavailable. Please ensure your mic permissions are enabled or upgrade to Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel(); // Stop AI voice narration if user starts speaking
      recognitionRef.current.start();
    }
  };

  const handleTerminationExit = () => {
    if (confirm("Abandon session? Progress will clear.")) {
      shutDownHardwareCamera();
      navigate('/', { replace: true });
    }
  };

  const speakInterviewerQuestion = (text) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!sessionId || !initialQuestion) {
      alert("No active session metrics found. Redirecting to central routing panel.");
      shutDownHardwareCamera();
      navigate('/', { replace: true });
      return;
    }

    setChatHistory([{ role: 'assistant', content: initialQuestion }]);
    speakInterviewerQuestion(initialQuestion);
  }, [sessionId, initialQuestion]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || loading) return;

    window.speechSynthesis.cancel();
    
    // Safety turn-off to make sure mic cuts off cleanly when response uploads
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const customAnswer = userAnswer.trim();
    setUserAnswer('');
    setLoading(true);

    setChatHistory((prev) => [...prev, { role: 'user', content: customAnswer }]);

    try {
      const authData = JSON.parse(localStorage.getItem('amie-auth'));
      const activeToken = authData?.token;

      const response = await API.post('/interview/respond', {
        sessionId,
        answer: customAnswer
      }, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });

      if (response.data.success) {
        const nextRoundContext = response.data.data;

        setChatHistory((prev) => [...prev, { role: 'assistant', content: nextRoundContext.nextQuestion }]);
        setRoundTracker(nextRoundContext.currentRound);
        speakInterviewerQuestion(nextRoundContext.nextQuestion);

        if (nextRoundContext.status === 'completed') {
          alert("Simulation track complete! Synthesizing final metrics report.");
          shutDownHardwareCamera();
          navigate('/evaluation-dashboard', { state: { sessionId }, replace: true });
        }
      }
    } catch (err) {
      console.error("❌ [TRANSACTION ERROR]: Failed to submit answer vector:", err);
      const actualError = err.response?.data?.error?.message || err.message || "Response parsing failure.";
      alert(`AMIE Engine Rejection: ${actualError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
      
      {/* SIDEBAR CONTAINER: WebRTC Cam Stream Window & Audio Settings */}
      <div className="space-y-4 lg:col-span-1">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md relative aspect-video flex items-center justify-center text-slate-500">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform -scale-x-100 bg-black"
          />
          <div className="absolute top-3 left-3 bg-rose-600/90 text-white backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase flex items-center space-x-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping"></span>
            <span>PROCTORING LINK ACTIVE</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
          <button
            type="button"
            onClick={() => {
              const currentToggle = !voiceEnabled;
              setVoiceEnabled(currentToggle);
              if (!currentToggle) window.speechSynthesis.cancel();
              else if (chatHistory.length > 0) speakInterviewerQuestion(chatHistory[chatHistory.length - 1].content);
            }}
            className={`w-full text-xs font-bold py-2.5 px-4 rounded-lg transition-all border cursor-pointer ${
              voiceEnabled 
                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' 
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}
          >
            {voiceEnabled ? '🔈 Mute AI Voice Narrator' : '🔊 Enable AI Voice Narrator'}
          </button>
        </div>
      </div>

      {/* CENTRAL AREA: Interview Round Workflow Terminal */}
      <div className="space-y-6 lg:col-span-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">Live Assessment Window</span>
            <h2 className="text-xl font-black text-slate-800">Round {roundTracker} of {totalRounds || 5}</h2>
          </div>
          <button 
            type="button"
            onClick={handleTerminationExit} 
            className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer underline"
          >
            Terminate Session
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between space-y-6">
          <div className="space-y-5 overflow-y-auto max-h-[340px] pr-2">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className={`text-[9px] font-black uppercase tracking-wider mb-1 px-1 ${msg.role === 'user' ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {msg.role === 'user' ? 'Your Response' : 'AMIE AI Interviewer'}
                </span>
                <div className={`p-4 rounded-xl text-sm max-w-xl leading-relaxed whitespace-pre-wrap font-medium shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-50 border border-slate-100 text-slate-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex flex-col items-start space-y-1.5 animate-pulse">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">AMIE AI Interviewer</span>
                <div className="bg-slate-50 border border-slate-100 text-slate-500 p-4 rounded-xl text-xs font-semibold">
                  Analyzing core patterns, edge cases, and runtime complexity metrics...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAnswerSubmit} className="border-t border-slate-100 pt-4">
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={userAnswer}
                  disabled={loading}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type or click the microphone button to dictate your architectural logic, algorithmic rationale, or runtime optimizations..."
                  className="w-full border border-slate-200 rounded-xl pl-3 pr-14 py-3 text-sm focus:outline-indigo-500 font-medium text-slate-800 resize-none"
                />
                
                {/* Microphone Dictation Control Trigger Option Toggle */}
                <button
                  type="button"
                  onClick={handleToggleVoiceCapture}
                  disabled={loading}
                  className={`absolute right-3.5 bottom-4 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer select-none border ${
                    isListening 
                      ? 'bg-rose-500 border-rose-600 text-white animate-pulse scale-105' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                  title={isListening ? 'Stop Mic Dictation' : 'Start Mic Dictation'}
                >
                  {isListening ? '🛑' : '🎙️'}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !userAnswer.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                >
                  Submit Response & Next Round
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}