import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
  Copy,
  Check,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { Execution } from '../types';

interface ExecutionLogTableProps {
  executions: Execution[];
  workflowName?: string;
}

export const ExecutionLogTable: React.FC<ExecutionLogTableProps> = ({
  executions,
  workflowName,
}) => {
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const filtered = executions.filter((exec) => {
    if (filterStatus !== 'all' && exec.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = String(exec.id).includes(q);
      const matchErr = exec.error_message?.toLowerCase().includes(q);
      const matchPayload = JSON.stringify(exec.input_payload).toLowerCase().includes(q);
      return matchId || matchErr || matchPayload;
    }
    return true;
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
      {/* Table Header Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 p-4 bg-slate-950/40">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs by ID or payload..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filtered.length} of {executions.length} runs
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="px-4 py-3">Run ID</th>
              <th className="px-4 py-3">Status</th>
              {workflowName ? null : <th className="px-4 py-3">Workflow</th>}
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No execution logs recorded matching this filter.
                </td>
              </tr>
            ) : (
              filtered.map((exec) => (
                <tr
                  key={exec.id}
                  onClick={() => setSelectedExecution(exec)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-200">
                    #{exec.id}
                  </td>
                  <td className="px-4 py-3">
                    {exec.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="h-3 w-3" />
                        Failed
                      </span>
                    )}
                  </td>
                  {workflowName ? null : (
                    <td className="px-4 py-3 font-medium text-slate-200 truncate max-w-[180px]">
                      {exec.workflow_name || `Workflow #${exec.workflow_id}`}
                    </td>
                  )}
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {exec.execution_time_ms ? `${exec.execution_time_ms}ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(exec.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">
                    {exec.error_message ? (
                      <span className="text-rose-400">{exec.error_message}</span>
                    ) : (
                      <span className="text-slate-500">All pipeline steps cleared</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side Drawer for Selected Execution Inspection */}
      {selectedExecution && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  Execution Run #{selectedExecution.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    selectedExecution.status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {selectedExecution.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedExecution(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Run Metadata */}
            <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <p className="text-slate-500">Duration</p>
                <p className="font-mono text-slate-200 font-semibold">
                  {selectedExecution.execution_time_ms} ms
                </p>
              </div>
              <div>
                <p className="text-slate-500">Executed At</p>
                <p className="text-slate-200 font-mono">
                  {new Date(selectedExecution.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedExecution.error_message && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                <p className="font-semibold mb-1">Execution Failure Reason:</p>
                <p className="font-mono">{selectedExecution.error_message}</p>
              </div>
            )}

            {/* Input Payload */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300">Inbound Input Payload</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(selectedExecution.input_payload, null, 2),
                      'input'
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedType === 'input' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedType === 'input' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto max-h-48">
                {JSON.stringify(selectedExecution.input_payload, null, 2)}
              </pre>
            </div>

            {/* Output Payload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300">Pipeline Output / Telemetry</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(selectedExecution.output_payload, null, 2),
                      'output'
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedType === 'output' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedType === 'output' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto max-h-64">
                {JSON.stringify(selectedExecution.output_payload, null, 2)}
              </pre>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setSelectedExecution(null)}
              className="w-full py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
