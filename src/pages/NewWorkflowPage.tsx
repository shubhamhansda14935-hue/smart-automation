import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ArrowLeft,
  FileText,
  Clock,
  Layers,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { GeneratedWorkflowResponse, GeneratedWorkflowStep } from '../server/gemini';

export const NewWorkflowPage: React.FC = () => {
  const navigate = useNavigate();

  const [problemStatement, setProblemStatement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedWorkflowResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Preset inspiration prompts
  const problemTemplates = [
    {
      title: 'Finance & Invoice Approval',
      desc: 'Our accounts payable team spends 15 hours a week reviewing supplier invoices, matching against PO numbers, checking tax IDs, and getting VP approval for invoices over $5,000.',
    },
    {
      title: 'Support SLA & Ticket Triage',
      desc: 'Customer support receives 400 tickets a day without classification, causing critical VIP enterprise outage tickets to get buried behind general how-to inquiries.',
    },
    {
      title: 'HR Employee Provisioning',
      desc: 'When a new employee accepts their offer in Workday, HR and IT manually coordinate across email to provision Google Workspace, assign Slack groups, and order hardware.',
    },
    {
      title: 'Form Data Cleansing & Sync',
      desc: 'Marketing leads from web forms contain inconsistent phone numbers, invalid emails, and missing company domains before being synced into Salesforce and notified on Slack.',
    },
  ];

  const handleGenerate = async (textToUse?: string) => {
    const text = textToUse || problemStatement;
    if (!text || text.trim().length < 10) {
      setError('Please provide at least 10 characters describing the workflow challenge.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const result = await api.workflows.generateWithAi(text);
      setGeneratedResult(result as GeneratedWorkflowResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to generate workflow with Gemini AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!generatedResult) return;

    setIsSaving(true);
    try {
      const res = await api.workflows.create({
        name: generatedResult.workflow_name,
        problem_statement: generatedResult.problem_statement,
        solution_description: generatedResult.solution_description,
        is_active: true, // arm by default
        definition: {
          steps: generatedResult.steps,
        },
      });

      navigate(`/workflows/${res.workflow.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save workflow');
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          to="/workflows"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workflows</span>
        </Link>

        <div className="flex items-center gap-1 text-xs text-indigo-400 font-mono">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gemini 3.8 Flash Engine</span>
        </div>
      </div>

      {/* Main Generator Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Natural Language Workflow Architect</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            State your operational bottleneck or repetitive manual process. Gemini AI will analyze the problem, structure trigger endpoints, conditional decision gates, AI transformations, and action dispatches.
          </p>
        </div>

        {/* Textarea Input */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Describe the Process Bottleneck in Plain English
            </label>
            <textarea
              rows={4}
              value={problemStatement}
              onChange={(e) => {
                setProblemStatement(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., We spend hours every Monday extracting expense receipts, validating against company travel policies, flagging amounts exceeding $200, and posting approved records to QuickBooks..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Quick Problem Inspiration Chips */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-wider font-mono">
              Or Pick a Sample Enterprise Bottleneck:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {problemTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProblemStatement(template.desc);
                    handleGenerate(template.desc);
                  }}
                  className="text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-indigo-500/40 hover:bg-slate-950 transition-all text-xs group"
                >
                  <p className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {template.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {template.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !problemStatement.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Workflow Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Workflow with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Workflow Preview Display */}
      {generatedResult && (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Workflow Synthesized Successfully
              </span>
              <h2 className="text-xl font-bold text-white">
                {generatedResult.workflow_name}
              </h2>
            </div>

            <button
              onClick={handleSaveAndOpen}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSaving ? 'Saving Pipeline...' : 'Adopt & Open in Designer'}</span>
            </button>
          </div>

          {/* Solution Description */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold text-slate-300 mb-1">Architecture Solution Summary</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {generatedResult.solution_description}
            </p>
          </div>

          {/* Step Sequence */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-3">
              Generated Pipeline Execution Sequence ({generatedResult.steps.length} Steps)
            </h3>

            <div className="space-y-3">
              {generatedResult.steps.map((step: GeneratedWorkflowStep, idx: number) => {
                const getStepBadge = (type: string) => {
                  switch (type) {
                    case 'trigger':
                      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    case 'ai_transform':
                      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                    case 'condition':
                      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    case 'action':
                      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    default:
                      return 'bg-slate-800 text-slate-400 border-slate-700';
                  }
                };

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs font-bold text-slate-300 shrink-0 mt-0.5">
                      {step.step_order}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getStepBadge(
                            step.type
                          )}`}
                        >
                          {step.type}
                        </span>
                        <h4 className="text-xs font-semibold text-white truncate">
                          {step.name}
                        </h4>
                      </div>

                      <div className="mt-1 font-mono text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        {step.config?.summary ||
                          step.config?.prompt ||
                          step.config?.url ||
                          JSON.stringify(step.config)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
