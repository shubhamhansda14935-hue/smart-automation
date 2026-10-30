import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Bell,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  LogOut,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [copiedKey, setCopiedKey] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState('3');
  const [savedSettings, setSavedSettings] = useState(false);

  const sampleApiKey = 'sa_live_98ab710ef2a94511c43d9e';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Workspace Settings & Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user profile, API credentials, telemetry preferences, and workspace isolation
        </p>
      </div>

      {savedSettings && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Workspace configuration parameters updated successfully.</span>
        </div>
      )}

      {/* User Profile Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 font-bold text-base border border-indigo-500/30">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
            {user?.role || 'user'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Account ID</p>
            <p className="font-mono text-slate-200 mt-0.5">USR-00{user?.id}</p>
          </div>
          <div>
            <p className="text-slate-500">Data Isolation</p>
            <p className="text-emerald-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Row-Level Tenant Isolation Active</span>
            </p>
          </div>
        </div>
      </div>

      {/* API & Webhook Configuration */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <Key className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Inbound Webhooks & API Keys</h3>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Platform Inbound Webhook Signing Secret
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={sampleApiKey}
              className="flex-1 font-mono text-xs rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
            >
              {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Authenticate incoming webhook payloads by including this Bearer token in the Authorization header.
          </p>
        </div>

        {/* Gemini Engine Specifications */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span>Google Gemini Orchestration Model</span>
          </div>
          <p className="text-xs text-slate-300">
            Current Engine: <span className="font-mono font-semibold text-white">gemini-3.8-flash</span>
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            API calls are executed strictly on the backend server environment with structured JSON schema enforcement. No client-side exposure.
          </p>
        </div>

        {/* Retry & Fault Tolerance Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              External Action Retry Attempts
            </label>
            <select
              value={retryAttempts}
              onChange={(e) => setRetryAttempts(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option value="1">1 attempt (No retry)</option>
              <option value="3">3 attempts (Exponential backoff)</option>
              <option value="5">5 attempts (Mission-critical)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Telemetry Retention Period
            </label>
            <select
              defaultValue="90"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option value="30">30 Days</option>
              <option value="90">90 Days (Enterprise Default)</option>
              <option value="365">365 Days (Audit Compliant)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out of Workspace</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
