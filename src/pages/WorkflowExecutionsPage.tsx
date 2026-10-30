import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Play,
  Settings2,
} from 'lucide-react';
import { api } from '../services/api';
import { Execution, Workflow } from '../types';
import { ExecutionLogTable } from '../components/ExecutionLogTable';
import { TestRunnerModal } from '../components/TestRunnerModal';

export const WorkflowExecutionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [workflow, setWorkflow] = useState<{ id: number; name: string } | null>(null);
  const [fullWorkflow, setFullWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [execRes, wfRes] = await Promise.all([
        api.workflows.getExecutions(Number(id)),
        api.workflows.getById(Number(id)),
      ]);
      setExecutions(execRes.executions);
      setWorkflow(execRes.workflow);
      setFullWorkflow(wfRes.workflow);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const totalRuns = executions.length;
  const successRuns = executions.filter((e) => e.status === 'success').length;
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;
  const avgDuration =
    totalRuns > 0
      ? Math.round(executions.reduce((acc, e) => acc + (e.execution_time_ms || 0), 0) / totalRuns)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to={`/workflows/${id}`}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{workflow?.name || `Workflow #${id}`}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Audit Logs
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              End-to-end execution history, latency telemetry, and payload inspection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
            title="Refresh logs"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to={`/workflows/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Workflow Builder</span>
          </Link>

          <button
            onClick={() => setIsTestRunnerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-all"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Execute Test</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Executions</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalRuns}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>SLA Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {successRate}%
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average Latency</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {avgDuration} ms
          </div>
        </div>
      </div>

      {/* Logs Table with Payload Inspector */}
      <ExecutionLogTable executions={executions} workflowName={workflow?.name} />

      {/* Test Runner Modal */}
      {isTestRunnerOpen && fullWorkflow && (
        <TestRunnerModal
          isOpen={isTestRunnerOpen}
          workflow={fullWorkflow}
          onClose={() => setIsTestRunnerOpen(false)}
          onExecutionCompleted={loadData}
        />
      )}
    </div>
  );
};
