import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Terminal,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { Workflow, StepTrace } from '../types';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface TestRunnerModalProps {
  isOpen: boolean;
  workflow: Workflow | null;
  onClose: () => void;
  onExecutionCompleted?: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({
  isOpen,
  workflow,
  onClose,
  onExecutionCompleted,
}) => {
  if (!isOpen || !workflow) return null;

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [expandedTrace, setExpandedTrace] = useState<number | null>(null);

  // Preset Mock Payloads
  const presets: Record<string, any> = {
    standard_invoice: {
      label: 'Vendor Invoice ($3,450.00)',
      data: {
        vendor_name: 'Apex Data Services',
        invoice_number: 'INV-2026-904',
        total_amount: 3450.0,
        currency: 'USD',
        tax_id: 'US-94-281920',
        line_items: [
          { description: 'Cloud Compute Tier-3', amount: 2450.0 },
          { description: 'Dedicated IP Subnet', amount: 1000.0 },
        ],
      },
    },
    high_value_invoice: {
      label: 'Flagged High-Value Invoice ($14,200.00)',
      data: {
        vendor_name: 'Global Fiber Systems',
        invoice_number: 'INV-2026-881',
        total_amount: 14200.0,
        currency: 'USD',
        tax_id: 'US-11-998822',
        line_items: [{ description: 'Enterprise Dark Fiber Lease', amount: 14200.0 }],
      },
    },
    urgent_support_ticket: {
      label: 'P1 Critical Support Ticket',
      data: {
        ticket_id: 'TCK-8812',
        customer_email: 'vp.infra@fintech-scale.io',
        urgency: 'P1',
        sentiment: 'negative',
        subject: 'EU Production Cluster Latency Spike',
        message: 'Our main database replica is timing out under peak European business traffic.',
      },
    },
    hr_onboarding: {
      label: 'New Engineer Onboarding Offer',
      data: {
        candidate_name: 'Elena Rostova',
        job_title: 'Senior Systems Architect',
        department: 'Engineering',
        requires_hardware_laptop: true,
        start_date: '2026-11-15',
      },
    },
  };

  const [selectedPreset, setSelectedPreset] = useState<string>('standard_invoice');
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(presets.standard_invoice.data, null, 2)
  );

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    setPayloadText(JSON.stringify(presets[key].data, null, 2));
    setResult(null);
  };

  const handleRunExecution = async () => {
    let parsedInput: any;
    try {
      parsedInput = JSON.parse(payloadText);
    } catch (err: any) {
      alert(`Invalid JSON payload: ${err.message}`);
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const execResult = await api.workflows.execute(workflow.id, parsedInput);
      setResult(execResult);
      if (onExecutionCompleted) {
        onExecutionCompleted();
      }
    } catch (err: any) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Play className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Test Orchestrator: {workflow.name}
              </h3>
              <p className="text-xs text-slate-400">
                Trigger mock payloads through the live pipeline with Gemini AI transformations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Choose Test Payload Scenario
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(presets).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPreset(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedPreset === key
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {presets[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* JSON Payload Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-slate-400" />
                Input Payload (JSON)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {payloadText.length} bytes
              </span>
            </div>
            <textarea
              rows={6}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full font-mono text-xs rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-400">
              Steps in sequence: <span className="font-semibold text-slate-200">{workflow.definition?.steps?.length || 0}</span>
            </div>
            <button
              onClick={handleRunExecution}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {isRunning ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Orchestrating Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Execute Test Run</span>
                </>
              )}
            </button>
          </div>

          {/* Live Execution Results Trace */}
          {result && (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4 animate-in fade-in">
              {/* Telemetry Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  {result.status === 'success' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Execution Succeeded</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Execution Failed</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-400 font-mono">
                    ID #{result.execution_id}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono text-slate-200">{result.duration_ms}ms</span>
                  </div>
                  <Link
                    to={`/workflows/${workflow.id}/executions`}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>Full Telemetry</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Step Traces */}
              <div>
                <p className="text-xs font-medium text-slate-300 mb-2">Step Execution Trace</p>
                <div className="space-y-2">
                  {result.step_traces?.map((trace: StepTrace, idx: number) => {
                    const isExpanded = expandedTrace === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 transition-colors"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedTrace(isExpanded ? null : idx)}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                              {trace.step_order}
                            </span>
                            <span className="text-xs font-medium text-slate-200">
                              {trace.name}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                              {trace.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono text-slate-400 text-[11px]">
                              {trace.duration_ms}ms
                            </span>
                            {trace.status === 'success' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-rose-400" />
                            )}
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/60 font-mono text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded">
                            <pre className="overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(trace.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Output Preview */}
              <div>
                <p className="text-xs font-medium text-slate-300 mb-1">Final Pipeline Output</p>
                <pre className="font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-emerald-300 overflow-x-auto max-h-40">
                  {JSON.stringify(result.output_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
