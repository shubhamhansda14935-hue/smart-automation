import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  RotateCw,
  GitBranch,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Workflow } from '../types';
import { WorkflowCard } from '../components/WorkflowCard';
import { TestRunnerModal } from '../components/TestRunnerModal';

export const WorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [selectedWorkflowForTest, setSelectedWorkflowForTest] = useState<Workflow | null>(null);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.workflows.getAll();
      setWorkflows(res.workflows);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      // Optimistic update
      setWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_active: !currentActive } : w))
      );
      await api.workflows.update(id, { is_active: !currentActive });
    } catch (err) {
      console.error('Failed to update workflow active state:', err);
      loadWorkflows();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this workflow and its execution telemetry logs?')) {
      return;
    }

    try {
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      await api.workflows.delete(id);
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      loadWorkflows();
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (statusFilter === 'active' && !w.is_active) return false;
    if (statusFilter === 'paused' && w.is_active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchProb = w.problem_statement.toLowerCase().includes(q);
      return matchName || matchProb;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Automated Workflows</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {workflows.length} total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-step pipelines, toggle activation gates, and review step configurations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadWorkflows}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/workflows/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span>Generate with AI</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search workflows by name or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Status:
          </span>
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'active'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'paused'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paused
            </button>
          </div>
        </div>
      </div>

      {/* Workflows Cards Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
            <GitBranch className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No workflows found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords or filter settings.'
              : 'Create your first automated workflow using Gemini AI natural language generation.'}
          </p>
          <div className="mt-6">
            <Link
              to="/workflows/new"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Describe a Problem & Generate</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
              onTestRun={(wf) => setSelectedWorkflowForTest(wf)}
            />
          ))}
        </div>
      )}

      {/* Test Runner Modal */}
      {selectedWorkflowForTest && (
        <TestRunnerModal
          isOpen={Boolean(selectedWorkflowForTest)}
          workflow={selectedWorkflowForTest}
          onClose={() => setSelectedWorkflowForTest(null)}
          onExecutionCompleted={loadWorkflows}
        />
      )}
    </div>
  );
};
