import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  FileCheck,
  CreditCard,
  Users,
  MessageSquare,
  BarChart3,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  // ROI Calculator states
  const [teamSize, setTeamSize] = useState<number>(25);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(6);
  const [hourlyCost, setHourlyCost] = useState<number>(55);

  const hoursSavedYearly = Math.round(teamSize * hoursPerWeek * 50 * 0.75);
  const dollarsSavedYearly = Math.round(hoursSavedYearly * hourlyCost);

  const handleDemoLaunch = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative px-4 pt-20 pb-20 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Next-Gen Enterprise Orchestration with Google Gemini AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-[1.15]">
            Eliminate Repetitive Manual Operations with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Intelligent Workflows
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Describe operational bottlenecks in plain English. Gemini analyzes the problem,
            architects multi-step decision pipelines, and executes automated data entry,
            approvals, and notifications reliably.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all active:scale-95"
              >
                <span>Go to Workspace Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all active:scale-95"
                >
                  <span>Start Free Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={handleDemoLaunch}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-all active:scale-95"
                >
                  <Zap className="h-4 w-4 text-indigo-400" />
                  <span>Explore Live Demo Sandbox</span>
                </button>
              </>
            )}
          </div>

          {/* Interactive Prompt-to-Pipeline Preview Window */}
          <div className="mt-16 text-left rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  smart-automation-console // prompt-to-orchestration
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gemini 3.8 Flash Active</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
                <p className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider mb-1">
                  Natural Language Input
                </p>
                <p className="text-sm text-slate-200 font-mono">
                  "Our accounts payable team spends 20 hours a week extracting invoice line items,
                  cross-matching purchase orders, and seeking executive approval for bills over $5,000."
                </p>
              </div>

              {/* Generated Pipeline Visual */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3">
                  <span className="text-[10px] font-mono font-semibold text-blue-400 uppercase">
                    Step 1: Trigger
                  </span>
                  <p className="text-xs font-medium text-white mt-1">Inbound Invoice Webhook</p>
                  <p className="text-[11px] text-slate-400 mt-1">Captures PDF & JSON payload</p>
                </div>

                <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3">
                  <span className="text-[10px] font-mono font-semibold text-purple-400 uppercase">
                    Step 2: AI Transform
                  </span>
                  <p className="text-xs font-medium text-white mt-1">Gemini Structured OCR</p>
                  <p className="text-[11px] text-slate-400 mt-1">Extracts line items, tax ID, totals</p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
                  <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase">
                    Step 3: Condition Gate
                  </span>
                  <p className="text-xs font-medium text-white mt-1">Total &lt;= $5,000 Policy</p>
                  <p className="text-[11px] text-slate-400 mt-1">Auto-approves within budget limit</p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase">
                    Step 4: Action
                  </span>
                  <p className="text-xs font-medium text-white mt-1">ERP Sync & Slack Post</p>
                  <p className="text-[11px] text-slate-400 mt-1">Updates Ledger & dispatches receipt</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Domains Showcase */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for Enterprise Operational Domains
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Transform high-friction, error-prone workflows into autonomous, audited pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Finance & Approvals</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Automated 3-way invoice matching, corporate expense policy validation, and executive budget approvals.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Data Ops & Entry</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Cleanse inbound form submissions, reconcile multi-database syncs, and generate structured executive reports.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Human Resources</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Orchestrate onboarding checklists, provision SaaS accounts, cross-verify compliance documents, and route inquiries.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/30 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Customer Operations</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Triage incoming tickets with Gemini sentiment analysis, prioritize VIP accounts, and route escalations in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive ROI Calculator */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider">
                Interactive Value Assessment
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Calculate Your Automation ROI
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Estimate the hours and operational budget your organization recovers annually.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Team Members: <span className="font-mono text-indigo-300">{teamSize}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Manual Hours / Person / Week: <span className="font-mono text-indigo-300">{hoursPerWeek} hrs</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Avg Loaded Hourly Cost: <span className="font-mono text-indigo-300">${hourlyCost}/hr</span>
                </label>
                <input
                  type="range"
                  min="25"
                  max="150"
                  step="5"
                  value={hourlyCost}
                  onChange={(e) => setHourlyCost(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Calculated Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800 text-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="text-xs font-medium text-slate-400">Recovered Productive Hours</p>
                <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                  {hoursSavedYearly.toLocaleString()} hrs/year
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="text-xs font-medium text-slate-400">Estimated Annual Cost Savings</p>
                <p className="text-3xl font-extrabold font-mono text-indigo-300 mt-1">
                  ${dollarsSavedYearly.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>Smart Automation Platform • Powered by Google Gemini AI & PostgreSQL Architecture</p>
      </footer>
    </div>
  );
};
