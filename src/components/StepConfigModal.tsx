import React, { useState, useEffect } from 'react';
import { X, Sparkles, Sliders, Check, AlertCircle, Trash2 } from 'lucide-react';
import { WorkflowStep, StepType } from '../types';

interface StepConfigModalProps {
  isOpen: boolean;
  step: WorkflowStep | null;
  onClose: () => void;
  onSave: (updatedStep: WorkflowStep) => void;
  onDelete?: (stepOrder: number) => void;
}

export const StepConfigModal: React.FC<StepConfigModalProps> = ({
  isOpen,
  step,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !step) return null;

  const [name, setName] = useState(step.name);
  const [type, setType] = useState<StepType>(step.type);
  const [config, setConfig] = useState<Record<string, any>>({ ...step.config });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [jsonRaw, setJsonRaw] = useState(JSON.stringify(step.config, null, 2));

  useEffect(() => {
    setName(step.name);
    setType(step.type);
    setConfig({ ...step.config });
    setJsonRaw(JSON.stringify(step.config, null, 2));
    setJsonError(null);
  }, [step]);

  const handleConfigChange = (key: string, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    setJsonRaw(JSON.stringify(updated, null, 2));
  };

  const handleJsonChange = (val: string) => {
    setJsonRaw(val);
    try {
      const parsed = JSON.parse(val);
      setConfig(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonError) return;

    onSave({
      ...step,
      name,
      type,
      config,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Configure Step #{step.step_order}</h3>
              <p className="text-xs text-slate-400">Define execution behavior, rules, and telemetry hooks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'visual'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Form Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw JSON Parameters
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Step Title & Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Step Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Verify Vendor Tax ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Step Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StepType)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="trigger">Trigger (Inbound)</option>
                <option value="ai_transform">AI Transform (Gemini)</option>
                <option value="condition">Condition (Gate)</option>
                <option value="action">Action (Outbound)</option>
              </select>
            </div>
          </div>

          {activeTab === 'visual' ? (
            <div className="space-y-4 pt-2">
              {/* Trigger Options */}
              {type === 'trigger' && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                    <span>Inbound Ingestion Configuration</span>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Trigger Mechanism</label>
                    <select
                      value={config.trigger_type || 'webhook'}
                      onChange={(e) => handleConfigChange('trigger_type', e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                    >
                      <option value="webhook">REST Webhook (Inbound HTTP POST)</option>
                      <option value="schedule">Cron Schedule (Hourly / Daily / Custom)</option>
                      <option value="event">Platform Event Bus (e.g. Zendesk, Workday, ERP)</option>
                      <option value="manual">Manual On-Demand Execution</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Endpoint / Event Name</label>
                    <input
                      type="text"
                      value={config.endpoint || config.event_name || ''}
                      onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                      placeholder="/api/v1/inbound/events"
                    />
                  </div>
                </div>
              )}

              {/* AI Transform Options */}
              {type === 'ai_transform' && (
                <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-purple-400">
                    <Sparkles className="h-4 w-4" />
                    <span>Gemini AI Transformation Prompt & Extraction Rule</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      AI System Instruction / Extraction Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={config.prompt || ''}
                      onChange={(e) => handleConfigChange('prompt', e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Extract vendor name, line items, invoice total, tax ID, and verify calculations..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Output Schema Type</label>
                      <input
                        type="text"
                        value={config.output_schema || 'structured_json'}
                        onChange={(e) => handleConfigChange('output_schema', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                        placeholder="invoice_extraction"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Confidence Threshold</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.confidence_threshold || 0.85}
                        onChange={(e) => handleConfigChange('confidence_threshold', parseFloat(e.target.value))}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Condition Options */}
              {type === 'condition' && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                    <span>Smart Decision Gate Logic</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Payload Field</label>
                      <input
                        type="text"
                        value={config.field || ''}
                        onChange={(e) => handleConfigChange('field', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                        placeholder="total_amount"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Operator</label>
                      <select
                        value={config.operator || 'equals'}
                        onChange={(e) => handleConfigChange('operator', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                      >
                        <option value="equals">Equals (==)</option>
                        <option value="less_than_or_equal">Less than or equal (&lt;=)</option>
                        <option value="greater_than">Greater than (&gt;)</option>
                        <option value="contains">Contains substring</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Target Value</label>
                      <input
                        type="text"
                        value={config.value || ''}
                        onChange={(e) => handleConfigChange('value', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Options */}
              {type === 'action' && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <span>Outbound Dispatch & Action Execution</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Action Type</label>
                    <select
                      value={config.action_type || 'webhook_dispatch'}
                      onChange={(e) => handleConfigChange('action_type', e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                    >
                      <option value="webhook_dispatch">External API / Webhook Dispatch</option>
                      <option value="slack_dispatch">Slack / Teams Channel Alert</option>
                      <option value="email_dispatch">Email Notification & Sign-off</option>
                      <option value="db_commit">Database Record Mutation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Target URL / Channel / Recipient</label>
                    <input
                      type="text"
                      value={config.url || config.channel || config.target || ''}
                      onChange={(e) => handleConfigChange('url', e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                      placeholder="https://api.erp.internal/v1/invoices"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Raw Config JSON</label>
              <textarea
                rows={9}
                value={jsonRaw}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full font-mono text-xs rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              {jsonError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Malformed JSON: {jsonError}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(step.step_order);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Step</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={Boolean(jsonError)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
