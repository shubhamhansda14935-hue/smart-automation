import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Save,
  Plus,
  Sliders,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  History,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { Workflow, WorkflowStep, StepType } from '../types';
import { StepConfigModal } from '../components/StepConfigModal';
import { TestRunnerModal } from '../components/TestRunnerModal';
import { AiAdvisorCard } from '../components/AiAdvisorCard';

export const WorkflowBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);

  const loadWorkflow = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.workflows.getById(Number(id));
      setWorkflow(res.workflow);
    } catch (err: any) {
      setError(err.message || 'Workflow not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const handleSaveWorkflow = async () => {
    if (!workflow) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.workflows.update(workflow.id, {
        name: workflow.name,
        problem_statement: workflow.problem_statement,
        solution_description: workflow.solution_description,
        is_active: workflow.is_active,
        definition: workflow.definition,
      });
      setWorkflow(res.workflow);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleStepSave = (updatedStep: WorkflowStep) => {
    if (!workflow) return;
    const steps = [...(workflow.definition.steps || [])];
    const index = steps.findIndex((s) => s.step_order === updatedStep.step_order);
    if (index !== -1) {
      steps[index] = updatedStep;
    } else {
      steps.push(updatedStep);
    }

    setWorkflow({
      ...workflow,
      definition: { steps },
    });
  };

  const handleStepDelete = (stepOrder: number) => {
    if (!workflow) return;
    let steps = workflow.definition.steps.filter((s) => s.step_order !== stepOrder);
    // Re-index steps
    steps = steps.map((s, idx) => ({ ...s, step_order: idx + 1 }));

    setWorkflow({
      ...workflow,
      definition: { steps },
    });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (!workflow) return;
    const steps = [...workflow.definition.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const temp = steps[index];
    steps[index] = steps[targetIndex];
    steps[targetIndex] = temp;

    // Normalize step_order
    const normalized = steps.map((s, idx) => ({ ...s, step_order: idx + 1 }));

    setWorkflow({
      ...workflow,
      definition: { steps: normalized },
    });
  };

  const handleAddStep = (type: StepType) => {
    if (!workflow) return;
    const steps = [...(workflow.definition.steps || [])];
    const nextOrder = steps.length + 1;

    let defaultName = 'New Step';
    let defaultConfig: any = {};

    if (type === 'trigger') {
      defaultName = 'Inbound Webhook';
      defaultConfig = { trigger_type: 'webhook', endpoint: '/api/v1/inbound/events' };
    } else if (type === 'ai_transform') {
      defaultName = 'Gemini AI Extraction';
      defaultConfig = { prompt: 'Analyze and extract structured attributes from input payload' };
    } else if (type === 'condition') {
      defaultName = 'Validation Rule';
      defaultConfig = { field: 'status', operator: 'equals', value: 'approved' };
    } else if (type === 'action') {
      defaultName = 'Webhook Dispatch';
      defaultConfig = { action_type: 'webhook_dispatch', url: 'https://api.internal/v1/dispatch' };
    }

    const newStep: WorkflowStep = {
      step_order: nextOrder,
      type,
      name: defaultName,
      config: defaultConfig,
    };

    setWorkflow({
      ...workflow,
      definition: { steps: [...steps, newStep] },
    });
    setEditingStep(newStep);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading workflow designer...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm text-slate-300">Workflow not found or access denied.</p>
        <Link to="/workflows" className="text-xs text-indigo-400 hover:text-indigo-300">
          Return to workflows list
        </Link>
      </div>
    );
  }

  const steps = workflow.definition?.steps || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/workflows"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1"
              />
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  workflow.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {workflow.is_active ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 px-1">
              Workflow ID #{workflow.id} • Last updated {new Date(workflow.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Switch */}
          <button
            onClick={() => setWorkflow({ ...workflow, is_active: !workflow.is_active })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              workflow.is_active
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {workflow.is_active ? 'Active & Armed' : 'Paused (Click to Arm)'}
          </button>

          <Link
            to={`/workflows/${workflow.id}/executions`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>Telemetry Logs</span>
          </Link>

          <button
            onClick={() => setIsTestRunnerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Run Test</span>
          </button>

          <button
            onClick={handleSaveWorkflow}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Pipeline'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Workflow configurations and step definitions saved to database.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Layout: Visual Step Pipeline Canvas + AI Advisor Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Canvas */}
        <div className="lg:col-span-2 space-y-5">
          {/* Problem & Solution Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Operational Problem
              </label>
              <textarea
                rows={2}
                value={workflow.problem_statement}
                onChange={(e) => setWorkflow({ ...workflow, problem_statement: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {workflow.solution_description && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Architecture Solution Summary
                </label>
                <textarea
                  rows={2}
                  value={workflow.solution_description}
                  onChange={(e) => setWorkflow({ ...workflow, solution_description: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Sequential Step Nodes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                Execution Pipeline Sequence ({steps.length} Steps)
              </h3>
              <span className="text-xs text-slate-500">Ordered execution flow</span>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => {
                const getStepTypeStyle = (t: string) => {
                  switch (t) {
                    case 'trigger':
                      return { border: 'border-blue-500/30', bg: 'bg-blue-950/20', text: 'text-blue-400' };
                    case 'ai_transform':
                      return { border: 'border-purple-500/30', bg: 'bg-purple-950/20', text: 'text-purple-400' };
                    case 'condition':
                      return { border: 'border-amber-500/30', bg: 'bg-amber-950/20', text: 'text-amber-400' };
                    case 'action':
                      return { border: 'border-emerald-500/30', bg: 'bg-emerald-950/20', text: 'text-emerald-400' };
                    default:
                      return { border: 'border-slate-800', bg: 'bg-slate-900', text: 'text-slate-400' };
                  }
                };

                const style = getStepTypeStyle(step.type);

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border ${style.border} bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 transition-all`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs font-bold text-slate-300">
                          {step.step_order}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${style.bg} ${style.text} ${style.border}`}
                            >
                              {step.type}
                            </span>
                            <h4 className="text-sm font-semibold text-white">
                              {step.name}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Controls: Move, Configure, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                          title="Move step up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === steps.length - 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                          title="Move step down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStep(step)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                        >
                          <Sliders className="h-3 w-3" />
                          <span>Configure</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepDelete(step.step_order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete step"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Step Config Summary */}
                    <div className="mt-3 font-mono text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                      {step.type === 'trigger' && (
                        <span>Trigger: {step.config?.trigger_type || 'webhook'} → {step.config?.endpoint || 'Inbound Event'}</span>
                      )}
                      {step.type === 'ai_transform' && (
                        <span>Gemini Rule: {step.config?.prompt || 'Extraction'}</span>
                      )}
                      {step.type === 'condition' && (
                        <span>Condition: IF `{step.config?.field || 'field'}` {step.config?.operator || 'equals'} `{step.config?.value || ''}`</span>
                      )}
                      {step.type === 'action' && (
                        <span>Action: {step.config?.action_type || 'dispatch'} → {step.config?.url || step.config?.channel || 'Target'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Step Toolbar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Add Next Step:</span>
              <button
                type="button"
                onClick={() => handleAddStep('trigger')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                + Trigger
              </button>
              <button
                type="button"
                onClick={() => handleAddStep('ai_transform')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                + AI Transform
              </button>
              <button
                type="button"
                onClick={() => handleAddStep('condition')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                + Condition Gate
              </button>
              <button
                type="button"
                onClick={() => handleAddStep('action')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                + Action
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Optimization Advisor */}
        <div className="space-y-6">
          <AiAdvisorCard workflowId={workflow.id} />

          {/* Quick Test Runner Shortcut */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="h-4 w-4 text-indigo-400" />
              <span>Pipeline Sandbox Testing</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify this workflow before arming in production. Test triggers and AI transformations with mock enterprise payloads.
            </p>
            <button
              onClick={() => setIsTestRunnerOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-all"
            >
              Open Test Runner Console
            </button>
          </div>
        </div>
      </div>

      {/* Step Config Modal */}
      {editingStep && (
        <StepConfigModal
          isOpen={Boolean(editingStep)}
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSave={handleStepSave}
          onDelete={handleStepDelete}
        />
      )}

      {/* Test Runner Modal */}
      {isTestRunnerOpen && (
        <TestRunnerModal
          isOpen={isTestRunnerOpen}
          workflow={workflow}
          onClose={() => setIsTestRunnerOpen(false)}
        />
      )}
    </div>
  );
};
