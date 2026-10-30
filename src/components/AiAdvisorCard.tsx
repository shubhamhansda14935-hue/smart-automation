import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { AiAdvice } from '../types';
import { api } from '../services/api';

interface AiAdvisorCardProps {
  workflowId: number;
  initialAdvice?: AiAdvice | null;
}

export const AiAdvisorCard: React.FC<AiAdvisorCardProps> = ({ workflowId, initialAdvice }) => {
  const [advice, setAdvice] = useState<AiAdvice | null>(initialAdvice || null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdvice = async () => {
    setIsLoading(true);
    try {
      const res = await api.workflows.getAdvice(workflowId);
      setAdvice(res.advice);
    } catch (err: any) {
      console.warn('Failed to refresh AI advice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Gemini Workflow Advisory</h4>
            <p className="text-[11px] text-slate-400">Automated structural & operational recommendations</p>
          </div>
        </div>

        <button
          onClick={fetchAdvice}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors disabled:opacity-50"
        >
          <RotateCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{advice ? 'Re-analyze' : 'Analyze Pipeline'}</span>
        </button>
      </div>

      {advice ? (
        <div className="mt-4 space-y-4">
          {/* Efficiency Score & Savings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Efficiency Score</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {advice.efficiency_score}%
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Time Saved Weekly</span>
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-indigo-300">
                ~{advice.estimated_hours_saved_weekly} hrs
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              Optimization Opportunities
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {advice.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottlenecks & Risk */}
          {advice.bottlenecks && advice.bottlenecks.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-amber-300 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Identified Bottlenecks</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {advice.bottlenecks.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400">-</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{advice.risk_assessment}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 py-6 text-center text-xs text-slate-400">
          <p>Click "Analyze Pipeline" to trigger Gemini's diagnostic inspection.</p>
        </div>
      )}
    </div>
  );
};
