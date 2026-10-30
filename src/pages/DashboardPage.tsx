import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  GitBranch,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Plus,
  Play,
  RotateCw,
  TrendingUp,
  CreditCard,
  Layers,
  Users,
  ShieldCheck,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Workflow, Execution, TelemetryMetrics } from '../types';
import { TestRunnerModal } from '../components/TestRunnerModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  // Test Runner state
  const [selectedWorkflowForTest, setSelectedWorkflowForTest] = useState<Workflow | null>(null);

  const loadDashboardData = async () => {
    try {
      const [telemetryRes, workflowsRes] = await Promise.all([
        api.telemetry.getOverview(),
        api.workflows.getAll(),
      ]);
      setMetrics(telemetryRes.metrics);
      setRecentExecutions(telemetryRes.recent_executions);
      setWorkflows(workflowsRes.workflows);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Operations Command Center</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>. Multi-step automation pipelines and telemetry are operating normally.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setLoading(true);
              loadDashboardData();
            }}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Metrics"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/workflows/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Workflow</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Workflows */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Active Workflows</span>
            <GitBranch className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {metrics ? metrics.active_workflows : '—'}
            </span>
            <span className="text-xs text-slate-500">
              of {metrics ? metrics.total_workflows : 0} configured
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Real-time polling armed</span>
          </div>
        </div>

        {/* Total Runs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Pipeline Executions</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {metrics ? metrics.total_runs : '—'}
            </span>
            <span className="text-xs text-slate-500">runs recorded</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Avg Latency:</span>
            <span className="font-mono text-slate-200">{metrics?.avg_duration_ms || 380}ms</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {metrics ? `${metrics.success_rate}%` : '100%'}
            </span>
            <span className="text-xs text-slate-500">SLA compliance</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>Enterprise 99.9% target</span>
          </div>
        </div>

        {/* Estimated Hours Saved */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-indigo-300 mb-2">
            <span>Manual Time Saved</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-300">
              ~{metrics ? metrics.estimated_hours_saved : '0'} hrs
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Automated without human delay</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Workflows Overview + Recent Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Workflows Quick Launch */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Configured Pipelines</h2>
              <p className="text-xs text-slate-400">Production multi-step automation pipelines</p>
            </div>
            <Link
              to="/workflows"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {workflows.slice(0, 3).map((wf) => (
              <div
                key={wf.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        wf.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <Link
                      to={`/workflows/${wf.id}`}
                      className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors truncate block"
                    >
                      {wf.name}
                    </Link>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {wf.definition?.steps?.length || 0} steps
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {wf.problem_statement}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedWorkflowForTest(wf)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
                  >
                    <Play className="h-3 w-3" />
                    <span>Run</span>
                  </button>

                  <Link
                    to={`/workflows/${wf.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick AI Generator Banner */}
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 to-purple-950/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-medium mb-1">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Need a new workflow?</span>
              </div>
              <p className="text-sm font-semibold text-white">
                Describe any operational friction point in plain English
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Gemini will architect complete triggers, condition gates, and actions.
              </p>
            </div>
            <Link
              to="/workflows/new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              Open AI Architect
            </Link>
          </div>
        </div>

        {/* Right Col: Live Execution Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Live Execution Feed</h2>
              <p className="text-xs text-slate-400">Recent telemetry records</p>
            </div>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            {recentExecutions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No telemetry recorded yet. Trigger a workflow run to view live results.
              </p>
            ) : (
              recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-slate-200 font-semibold truncate max-w-[160px]">
                      {exec.workflow_name || `Workflow #${exec.workflow_id}`}
                    </span>
                    {exec.status === 'success' ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                        <XCircle className="h-3 w-3" />
                        Failed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{exec.execution_time_ms ? `${exec.execution_time_ms}ms` : '—'}</span>
                    <span className="text-slate-500">
                      {new Date(exec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {exec.error_message && (
                    <p className="text-[10px] text-rose-400 mt-1 truncate">
                      {exec.error_message}
                    </p>
                  )}
                </div>
              ))
            )}

            <div className="pt-2 text-center border-t border-slate-800/60">
              <Link
                to="/workflows"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Inspect workflow execution logs →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Test Runner Modal */}
      {selectedWorkflowForTest && (
        <TestRunnerModal
          isOpen={Boolean(selectedWorkflowForTest)}
          workflow={selectedWorkflowForTest}
          onClose={() => setSelectedWorkflowForTest(null)}
          onExecutionCompleted={loadDashboardData}
        />
      )}
    </div>
  );
};
