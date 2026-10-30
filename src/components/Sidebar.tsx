import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  Settings,
  Activity,
  History,
  Layers,
  HelpCircle,
  FileText,
  CreditCard,
  Users,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', path: '/workflows', icon: GitBranch },
    { name: 'Generate with AI', path: '/workflows/new', icon: Sparkles, highlight: true },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const domainCategories = [
    { name: 'Finance & Approvals', icon: CreditCard, count: 'Active' },
    { name: 'Data Ops & Entry', icon: Layers, count: 'Ready' },
    { name: 'Human Resources', icon: Users, count: 'Standby' },
    { name: 'Customer Triage', icon: ShieldCheck, count: 'Active' },
  ];

  return (
    <aside className={`w-64 shrink-0 border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col justify-between hidden md:flex ${className}`}>
      <div>
        {/* Core Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/workflows' || item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${item.highlight ? 'text-indigo-400' : ''}`} />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Target Domains */}
        <div className="mt-8">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Target Domains
          </p>
          <div className="space-y-1 text-xs">
            {domainCategories.map((domain, idx) => {
              const Icon = domain.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-900/60 hover:text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    <span>{domain.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {domain.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workspace Isolation & Engine status */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            Gemini 3.8 Flash
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Structured orchestration engine with user RLS isolation active.
        </p>
      </div>
    </aside>
  );
};
