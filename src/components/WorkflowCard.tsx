import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Settings2,
  Activity,
  History,
  Trash2,
  GitBranch,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Workflow } from '../types';

interface WorkflowCardProps {
  workflow: Workflow;
  onToggleActive: (id: number, currentActive: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onTestRun: (workflow: Workflow) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onToggleActive,
  onDelete,
  onTestRun,
}) => {
  const steps = workflow.definition?.steps || [];
  const metrics = workflow.metrics || { total_executions: 0, success_rate: 100 };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'trigger':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'condition':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ai_transform':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'action':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700 hover:bg-slate-900/90 transition-all flex flex-col justify-between">
      <div>
        {/* Top bar: Status Switch + Title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  workflow.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    workflow.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                {workflow.is_active ? 'Active & Armed' : 'Paused'}
              </span>

              {steps.some((s) => s.type === 'ai_transform') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  Gemini AI
                </span>
              )}

              <span className="text-[11px] text-slate-500 font-mono">
                {steps.length} Steps
              </span>
            </div>

            <Link
              to={`/workflows/${workflow.id}`}
              className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1"
            >
              {workflow.name}
            </Link>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => onToggleActive(workflow.id, workflow.is_active)}
            title={workflow.is_active ? 'Click to Pause' : 'Click to Activate'}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              workflow.is_active ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                workflow.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Problem Statement snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {workflow.problem_statement}
        </p>

        {/* Step Flow Preview Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-4 no-scrollbar">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`text-[10px] px-2 py-1 rounded-md border font-mono font-medium truncate max-w-[130px] shrink-0 ${getStepTypeColor(
                  step.type
                )}`}
                title={`${step.type.toUpperCase()}: ${step.name}`}
              >
                {step.name}
              </span>
              {idx < steps.length - 1 && (
                <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bottom Footer: Execution Stats & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-slate-500" />
            <span>{metrics.total_executions} runs</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{metrics.success_rate}% success</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTestRun(workflow)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
            title="Execute test run"
          >
            <Play className="h-3 w-3" />
            <span>Run Test</span>
          </button>

          <Link
            to={`/workflows/${workflow.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Configure Workflow"
          >
            <Settings2 className="h-4 w-4" />
          </Link>

          <Link
            to={`/workflows/${workflow.id}/executions`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="View Execution Telemetry"
          >
            <History className="h-4 w-4" />
          </Link>

          <button
            onClick={() => onDelete(workflow.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Workflow"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
