import React from 'react';

function EvaluationResults({ sessionData, onBackToDashboard }) {
  const aggregateScore = (sessionData?.qaPairs?.reduce((acc, pair) => acc + (pair.evaluation?.score || 0), 0) / sessionData?.qaPairs?.length).toFixed(1);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Assessment Processed</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Your Performance Scorecard</h1>
          <p className="text-slate-400 text-sm mt-1">Multi-metric metrics compiled using strict structural schemas.</p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl">
          <div className="text-center">
            <span className="block text-4xl font-extrabold text-indigo-600">{aggregateScore}</span>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall / 10</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-700">Detailed Conversation Breakdown</h3>
        
        {sessionData?.qaPairs?.map((pair, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Round {index + 1}</span>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">Score: {pair.evaluation?.score || 0}/10</span>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Question</span>
                <p className="text-slate-800 font-medium">{pair.questionText}</p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Submission</span>
                <p className="text-slate-600 italic leading-relaxed">{pair.candidateAnswer || "No response recorded."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50/30 border border-emerald-100/50 p-4 rounded-xl">
                  <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Technical Correctness</span>
                  <p className="text-slate-600 text-xs leading-relaxed">{pair.evaluation?.technicalCorrectness}</p>
                </div>
                <div className="bg-blue-50/30 border border-blue-100/50 p-4 rounded-xl">
                  <span className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Communication Clarity</span>
                  <p className="text-slate-600 text-xs leading-relaxed">{pair.evaluation?.communicationClarity}</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Actionable Constructive Critique</span>
                <p className="text-slate-600 text-xs leading-relaxed">{pair.evaluation?.feedback}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button onClick={onBackToDashboard} className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-8 py-3 rounded-xl text-sm transition-colors shadow-sm">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default EvaluationResults;