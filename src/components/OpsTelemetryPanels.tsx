'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ArrowRightLeft,
  Gauge,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ScheduleStatus = 'ahead' | 'on-track' | 'at-risk' | 'delayed';

export interface ProjectVisualRatings {
  visual: number;      // 1-10
  progression: number; // 1-10
  vibe: number;        // 1-10
  feel: number;        // 1-10
}

export interface ProjectTimeliness {
  startDate: string;
  dueDate: string;
  timeElapsedPct: number;
  scheduleStatus: ScheduleStatus;
  deltaLabel: string;
  onTimeRatePct: number;
  velocityPerDay: string;
  nextMilestoneDue: string;
}

export interface AgentPerformanceAlert {
  id: string;
  agentId: string;
  agentName: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'workload' | 'sla' | 'latency' | 'error-rate';
  title: string;
  metricLabel: string;
  recommendation: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AgentTelemetryItem {
  id: string;
  name: string;
  avatarChar: string;
  avatarBg: string;
  role: 'ceo' | 'empire' | 'project' | 'workers';
  badgeTitle: string;
  badgeType: 'ceo' | 'empire' | 'project' | 'workers';
  currentTask?: string;
  tags: string[];
  extraTagsCount?: number;
  browserSessions: number;
  performanceScore: number;
  status: 'Active' | 'Idle' | 'Busy';
  description: string;
  capabilities: Array<{ name: string; description: string; confidence: number }>;
  activeTasksCount?: number;
  maxConcurrentTasks?: number;
  avgLatencyMs?: number;
  errorRatePct?: number;
  slaTargetPct?: number;
}

export interface ProjectTelemetryItem {
  id: string;
  name: string;
  empireName: string;
  status: 'development' | 'live' | 'testing' | 'deploying';
  tasksCount: number;
  completedTasksCount: number;
  ratings?: ProjectVisualRatings;
  timeliness?: ProjectTimeliness;
}

export function computeAgentWorkloadPct(agent: AgentTelemetryItem): number {
  const active = agent.activeTasksCount ?? (agent.status === 'Idle' ? 1 : 2);
  const max = agent.maxConcurrentTasks ?? 4;
  const taskRatio = Math.min(1, active / Math.max(1, max));
  const sessionPressure = Math.min(0.25, agent.browserSessions * 0.05);
  const raw = Math.round((taskRatio * 0.75 + sessionPressure) * 100);
  return Math.max(8, Math.min(100, raw));
}

export function computeCompletionPct(project: {
  tasksCount: number;
  completedTasksCount: number;
}): number {
  if (!project.tasksCount || project.tasksCount <= 0) return 0;
  return Math.min(100, Math.round((project.completedTasksCount / project.tasksCount) * 100));
}

export function computeOverallProjectRating(
  ratings: ProjectVisualRatings | undefined,
  completionPct: number
): number {
  const r = ratings || { visual: 8.5, progression: 8.2, vibe: 8.8, feel: 8.6 };
  const completionScore = Math.max(1, Math.min(10, (completionPct / 100) * 10));
  const avg = (r.visual + completionScore + r.progression + r.vibe + r.feel) / 5;
  return Number(avg.toFixed(1));
}

export function getRatingTone(scoreOutOf10: number): {
  text: string;
  bar: string;
  label: string;
} {
  if (scoreOutOf10 >= 8.5) {
    return {
      text: 'text-emerald-300',
      bar: 'bg-gradient-to-r from-emerald-400 to-teal-300',
      label: 'Radiant'
    };
  }
  if (scoreOutOf10 >= 7.0) {
    return {
      text: 'text-pink-300',
      bar: 'bg-gradient-to-r from-pink-400 to-sky-300',
      label: 'Healthy'
    };
  }
  if (scoreOutOf10 >= 5.0) {
    return {
      text: 'text-amber-300',
      bar: 'bg-gradient-to-r from-amber-400 to-orange-300',
      label: 'Watch'
    };
  }
  return {
    text: 'text-rose-300',
    bar: 'bg-gradient-to-r from-rose-500 to-pink-400',
    label: 'Needs Care'
  };
}

export function getScheduleBadgeMeta(status: ScheduleStatus): {
  label: string;
  classes: string;
  barClass: string;
} {
  switch (status) {
    case 'ahead':
      return {
        label: 'Ahead of Schedule',
        classes: 'text-emerald-200 bg-emerald-500/15 border-emerald-400/30',
        barClass: 'bg-gradient-to-r from-emerald-400 to-teal-300'
      };
    case 'on-track':
      return {
        label: 'On Track',
        classes: 'text-sky-200 bg-sky-500/15 border-sky-400/30',
        barClass: 'bg-gradient-to-r from-sky-400 to-pink-300'
      };
    case 'at-risk':
      return {
        label: 'At Risk',
        classes: 'text-amber-200 bg-amber-500/15 border-amber-400/30',
        barClass: 'bg-gradient-to-r from-amber-400 to-orange-300'
      };
    case 'delayed':
      return {
        label: 'Delayed',
        classes: 'text-rose-200 bg-rose-500/15 border-rose-400/30',
        barClass: 'bg-gradient-to-r from-rose-500 to-pink-400'
      };
  }
}

export function buildAgentFleetAlerts(agents: AgentTelemetryItem[]): AgentPerformanceAlert[] {
  const alerts: AgentPerformanceAlert[] = [];

  for (const agent of agents) {
    const loadPct = computeAgentWorkloadPct(agent);
    const slaTarget = agent.slaTargetPct ?? 93;
    const latency = agent.avgLatencyMs ?? 240;
    const errRate = agent.errorRatePct ?? 0.4;

    if (loadPct >= 88) {
      alerts.push({
        id: `alert-load-${agent.id}`,
        agentId: agent.id,
        agentName: agent.name,
        severity: loadPct >= 95 ? 'critical' : 'warning',
        category: 'workload',
        title: `${agent.name} approaching concurrency ceiling`,
        metricLabel: `Load ${loadPct}% · ${agent.activeTasksCount ?? 3}/${agent.maxConcurrentTasks ?? 4} tasks`,
        recommendation: 'Rebalance 1 queued task to an available idle specialist.',
        timestamp: '2m ago',
        acknowledged: false
      });
    }

    if (agent.performanceScore < slaTarget) {
      alerts.push({
        id: `alert-sla-${agent.id}`,
        agentId: agent.id,
        agentName: agent.name,
        severity: agent.performanceScore < slaTarget - 5 ? 'critical' : 'warning',
        category: 'sla',
        title: `${agent.name} performance below ${slaTarget}% SLA target`,
        metricLabel: `Score ${agent.performanceScore}% · Target ${slaTarget}%`,
        recommendation: 'Run 7-day diagnostic benchmark or reduce concurrent browser sessions.',
        timestamp: '6m ago',
        acknowledged: false
      });
    }

    if (latency >= 380 || errRate >= 2.0) {
      alerts.push({
        id: `alert-lat-${agent.id}`,
        agentId: agent.id,
        agentName: agent.name,
        severity: latency >= 480 || errRate >= 4.0 ? 'critical' : 'warning',
        category: latency >= 380 ? 'latency' : 'error-rate',
        title: `${agent.name} elevated ${latency >= 380 ? 'response latency' : 'retry rate'}`,
        metricLabel: `${latency}ms avg · ${errRate.toFixed(1)}% retries`,
        recommendation: 'Inspect execution logs or throttle outbound batch size.',
        timestamp: '11m ago',
        acknowledged: false
      });
    }
  }

  return alerts;
}

/* ============================================================================
 * 1. AGENT PERFORMANCE ALERTS + WORKLOAD OVERVIEW (AI WORKFORCE TAB)
 * ========================================================================== */
interface AgentAlertsAndWorkloadPanelProps {
  agents: AgentTelemetryItem[];
  alerts: AgentPerformanceAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onAcknowledgeAllAlerts: () => void;
  onRefreshFleetScan: () => void;
  onInspectAgent: (agent: AgentTelemetryItem) => void;
  onRebalanceAgent: (overloadedAgentId: string) => void;
  onAdjustAgentTasks: (agentId: string, delta: number) => void;
}

export function AgentAlertsAndWorkloadPanel({
  agents,
  alerts,
  onAcknowledgeAlert,
  onAcknowledgeAllAlerts,
  onRefreshFleetScan,
  onInspectAgent,
  onRebalanceAgent,
  onAdjustAgentTasks
}: AgentAlertsAndWorkloadPanelProps) {
  const [alertFilter, setAlertFilter] = useState<'unresolved' | 'all' | 'critical' | 'warning'>('unresolved');
  const [workloadFilter, setWorkloadFilter] = useState<'all' | 'high' | 'optimal' | 'available'>('all');
  const [sortBy, setSortBy] = useState<'load-desc' | 'perf-asc'>('load-desc');
  const [isWorkloadExpanded, setIsWorkloadExpanded] = useState(true);

  const unresolvedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalCount = unresolvedAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = unresolvedAlerts.filter(a => a.severity === 'warning').length;

  const visibleAlerts = alerts.filter(a => {
    if (alertFilter === 'unresolved') return !a.acknowledged;
    if (alertFilter === 'critical') return a.severity === 'critical' && !a.acknowledged;
    if (alertFilter === 'warning') return a.severity === 'warning' && !a.acknowledged;
    return true;
  });

  const workloadRows = agents
    .map(agent => {
      const loadPct = computeAgentWorkloadPct(agent);
      const activeTasks = agent.activeTasksCount ?? (agent.status === 'Idle' ? 1 : 2);
      const maxTasks = agent.maxConcurrentTasks ?? 4;
      const loadTier: 'high' | 'optimal' | 'available' =
        loadPct >= 80 ? 'high' : loadPct >= 40 ? 'optimal' : 'available';
      return {
        agent,
        loadPct,
        activeTasks,
        maxTasks,
        loadTier,
        latencyMs: agent.avgLatencyMs ?? 240,
        errorRatePct: agent.errorRatePct ?? 0.4
      };
    })
    .filter(row => {
      if (workloadFilter === 'all') return true;
      return row.loadTier === workloadFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'load-desc') return b.loadPct - a.loadPct;
      return a.agent.performanceScore - b.agent.performanceScore;
    });

  const avgFleetLoad = Math.round(
    agents.reduce((sum, a) => sum + computeAgentWorkloadPct(a), 0) / Math.max(1, agents.length)
  );
  const totalActiveTasks = agents.reduce(
    (sum, a) => sum + (a.activeTasksCount ?? (a.status === 'Idle' ? 1 : 2)),
    0
  );
  const totalMaxTasks = agents.reduce((sum, a) => sum + (a.maxConcurrentTasks ?? 4), 0);
  const overloadedCount = agents.filter(a => computeAgentWorkloadPct(a) >= 85).length;
  const availableCount = agents.filter(a => computeAgentWorkloadPct(a) < 40).length;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT 5 COLS: AGENT PERFORMANCE ALERTS */}
        <div className="lg:col-span-5 bg-[#111626]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl flex flex-col shadow-xl shadow-black/25 overflow-hidden">
          <div className="p-4 border-b border-pink-500/15 bg-gradient-to-r from-pink-500/10 via-transparent to-sky-500/5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    criticalCount > 0
                      ? 'text-rose-300'
                      : warningCount > 0
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                  }`}
                />
                <h3 className="text-sm font-semibold text-pink-50">
                  Agent Performance Alerts
                </h3>
                <span className="text-xs font-mono tabular-nums text-pink-200/70">
                  · {unresolvedAlerts.length} active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SLA drift, concurrency saturation, and latency threshold triggers
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {unresolvedAlerts.length > 0 && (
                <button
                  type="button"
                  onClick={onAcknowledgeAllAlerts}
                  className="px-2.5 py-1.5 text-xs font-medium text-pink-100 hover:text-white bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/25 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Resolve All
                </button>
              )}
              <button
                type="button"
                onClick={onRefreshFleetScan}
                className="p-1.5 text-slate-300 hover:text-pink-200 border border-pink-500/20 hover:bg-pink-500/15 rounded-xl transition-colors cursor-pointer"
                title="Run Fleet Telemetry Scan"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Segmented Filter Control */}
          <div className="px-4 py-2.5 border-b border-pink-500/10 bg-[#0d111d]/75 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 p-1 bg-[#0a0d16]/90 border border-pink-500/15 rounded-xl">
              {(
                [
                  { id: 'unresolved', label: `Active (${unresolvedAlerts.length})` },
                  { id: 'critical', label: `Critical (${criticalCount})` },
                  { id: 'warning', label: `Warning (${warningCount})` },
                  { id: 'all', label: `All (${alerts.length})` }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAlertFilter(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    alertFilter === tab.id
                      ? 'bg-pink-500/20 text-pink-100 border border-pink-400/35 shadow-xs'
                      : 'text-slate-400 hover:text-pink-100 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <div className="divide-y divide-pink-500/10 max-h-[340px] overflow-y-auto flex-1">
            {visibleAlerts.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="text-sm font-semibold text-pink-50">
                  All Agent Thresholds Nominal
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  No unacknowledged SLA, latency, or saturation alerts in this view.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onRefreshFleetScan}
                  className="text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/80 text-pink-100 hover:bg-pink-500/15"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-pink-300" />
                  Rescan Agent Fleet
                </Button>
              </div>
            ) : (
              visibleAlerts.map(alert => {
                const targetAgent = agents.find(a => a.id === alert.agentId);
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 transition-colors ${
                      alert.acknowledged ? 'bg-[#0a0d16]/50 opacity-65' : 'hover:bg-pink-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              alert.acknowledged
                                ? 'text-slate-400'
                                : alert.severity === 'critical'
                                ? 'text-rose-300'
                                : 'text-amber-300'
                            }`}
                          >
                            {alert.acknowledged ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            {alert.acknowledged
                              ? 'Resolved'
                              : alert.severity === 'critical'
                              ? 'Critical'
                              : 'Warning'}
                          </span>
                          <span aria-hidden="true" className="text-pink-500/35">
                            ·
                          </span>
                          <span className="font-mono tabular-nums text-[11px] text-sky-200/80 truncate">
                            {alert.metricLabel}
                          </span>
                          <span aria-hidden="true" className="text-pink-500/35">
                            ·
                          </span>
                          <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                            {alert.timestamp}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-100">
                          {alert.title}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {alert.recommendation}
                        </p>
                      </div>
                    </div>

                    {!alert.acknowledged && (
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        {alert.category === 'workload' && (
                          <button
                            type="button"
                            onClick={() => onRebalanceAgent(alert.agentId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-gradient-to-r from-pink-400 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] rounded-lg transition-all cursor-pointer shadow-xs"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Rebalance Load
                          </button>
                        )}
                        {targetAgent && (
                          <button
                            type="button"
                            onClick={() => onInspectAgent(targetAgent)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#0a0d16]/85 hover:bg-pink-500/15 text-pink-100 border border-pink-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-sky-300" />
                            Inspect Trend
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-emerald-200 hover:bg-emerald-500/15 rounded-lg transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT 7 COLS: WORKLOAD OVERVIEW */}
        <div className="lg:col-span-7 bg-[#111626]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl flex flex-col shadow-xl shadow-black/25 overflow-hidden">
          <div className="p-4 border-b border-pink-500/15 bg-gradient-to-r from-sky-500/10 via-transparent to-pink-500/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-300" />
                <h3 className="text-sm font-semibold text-pink-50">
                  Workforce Workload Overview
                </h3>
                <span className="text-xs font-mono tabular-nums text-pink-200/75">
                  · {avgFleetLoad}% fleet capacity
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time concurrency, active task allocation, and available headroom across {agents.length} agents
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWorkloadExpanded(!isWorkloadExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-pink-100 hover:text-white border border-pink-500/20 bg-[#0a0d16]/80 rounded-xl hover:bg-pink-500/15 transition-colors cursor-pointer"
            >
              {isWorkloadExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-pink-300" />
                  <span>Compact</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-300" />
                  <span>Expand</span>
                </>
              )}
            </button>
          </div>

          {/* 4-Column Workload KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-pink-500/15 border-b border-pink-500/15 bg-[#0d111d]/80">
            <div className="p-3.5">
              <div className="text-[11px] font-medium text-slate-400">Fleet Utilization</div>
              <div className="text-xl font-bold text-pink-200 font-mono tabular-nums mt-0.5">
                {avgFleetLoad}%
              </div>
            </div>
            <div className="p-3.5">
              <div className="text-[11px] font-medium text-slate-400">Active / Max Tasks</div>
              <div className="text-xl font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                {totalActiveTasks} / {totalMaxTasks}
              </div>
            </div>
            <div className="p-3.5">
              <div className="text-[11px] font-medium text-slate-400">High Load (≥85%)</div>
              <div
                className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                  overloadedCount > 0 ? 'text-amber-300' : 'text-emerald-300'
                }`}
              >
                {overloadedCount} agents
              </div>
            </div>
            <div className="p-3.5">
              <div className="text-[11px] font-medium text-slate-400">Available Capacity</div>
              <div className="text-xl font-bold text-sky-300 font-mono tabular-nums mt-0.5">
                {availableCount} idle-ready
              </div>
            </div>
          </div>

          {isWorkloadExpanded && (
            <>
              {/* Filter & Sort Bar */}
              <div className="px-4 py-2.5 border-b border-pink-500/10 flex flex-wrap items-center justify-between gap-2 bg-[#0d111d]/40">
                <div className="flex items-center gap-1 p-1 bg-[#0a0d16]/90 border border-pink-500/15 rounded-xl">
                  {(
                    [
                      { id: 'all', label: 'All Tiers' },
                      { id: 'high', label: 'High Load' },
                      { id: 'optimal', label: 'Optimal' },
                      { id: 'available', label: 'Available' }
                    ] as const
                  ).map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setWorkloadFilter(f.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        workloadFilter === f.id
                          ? 'bg-pink-500/20 text-pink-100 border border-pink-400/35 shadow-xs'
                          : 'text-slate-400 hover:text-pink-100 border border-transparent'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Sort:</span>
                  <button
                    type="button"
                    onClick={() => setSortBy(sortBy === 'load-desc' ? 'perf-asc' : 'load-desc')}
                    className="px-2.5 py-1 rounded-lg border border-pink-500/20 bg-[#0a0d16]/85 hover:bg-pink-500/15 text-pink-100 font-medium cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  >
                    {sortBy === 'load-desc' ? 'Load (High → Low)' : 'Performance (Low → High)'}
                  </button>
                </div>
              </div>

              {/* High-Density Workload Table */}
              <div className="overflow-x-auto max-h-[280px] overflow-y-auto flex-1">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0d111d] text-pink-200/70 font-medium border-b border-pink-500/15 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2">Agent</th>
                      <th className="px-3 py-2 text-right">Tasks</th>
                      <th className="px-3 py-2 text-right">Sessions</th>
                      <th className="px-3 py-2 text-right">Latency</th>
                      <th className="px-3 py-2">Capacity Load</th>
                      <th className="px-3 py-2 text-right">Perf</th>
                      <th className="px-4 py-2 text-right">Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-500/10">
                    {workloadRows.map(
                      ({ agent, loadPct, activeTasks, maxTasks, loadTier, latencyMs }) => (
                        <tr key={agent.id} className="hover:bg-pink-500/5 transition-colors">
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => onInspectAgent(agent)}
                              className="text-left group cursor-pointer"
                            >
                              <div className="font-semibold text-slate-100 group-hover:text-pink-300 transition-colors">
                                {agent.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {agent.badgeTitle}
                              </div>
                            </button>
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-200">
                            {activeTasks}/{maxTasks}
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums text-sky-200/80">
                            {agent.browserSessions}
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-400">
                            {latencyMs}ms
                          </td>
                          <td className="px-3 py-2 min-w-[165px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    loadTier === 'high'
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-400'
                                      : loadTier === 'optimal'
                                      ? 'bg-gradient-to-r from-pink-400 to-sky-300'
                                      : 'bg-gradient-to-r from-emerald-400 to-teal-300'
                                  }`}
                                  style={{ width: `${loadPct}%` }}
                                />
                              </div>
                              <span
                                className={`font-mono tabular-nums text-[11px] font-semibold w-10 text-right ${
                                  loadTier === 'high'
                                    ? 'text-rose-300'
                                    : loadTier === 'optimal'
                                    ? 'text-pink-200'
                                    : 'text-emerald-300'
                                }`}
                              >
                                {loadPct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-pink-100">
                            {agent.performanceScore}%
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onAdjustAgentTasks(agent.id, -1)}
                                disabled={activeTasks <= 0}
                                className="w-6 h-6 rounded-lg border border-pink-500/20 bg-[#0a0d16]/85 hover:bg-pink-500/20 disabled:opacity-35 flex items-center justify-center text-pink-200 cursor-pointer transition-colors"
                                title="Offload 1 task"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onAdjustAgentTasks(agent.id, 1)}
                                disabled={activeTasks >= maxTasks + 1}
                                className="w-6 h-6 rounded-lg border border-pink-500/20 bg-[#0a0d16]/85 hover:bg-pink-500/20 disabled:opacity-35 flex items-center justify-center text-sky-200 cursor-pointer transition-colors"
                                title="Assign 1 task"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 2. PORTFOLIO AT-A-GLANCE PULSE (COMMAND CENTRE & PROJECTS HEADER STRIP)
 * ========================================================================== */
interface PortfolioPulseOverviewProps {
  projects: ProjectTelemetryItem[];
  agents: AgentTelemetryItem[];
  alerts: AgentPerformanceAlert[];
  onNavigateTab?: (tab: 'workforce' | 'projects') => void;
}

export function PortfolioPulseOverview({
  projects,
  agents,
  alerts,
  onNavigateTab
}: PortfolioPulseOverviewProps) {
  const unresolvedCount = alerts.filter(a => !a.acknowledged).length;
  const avgFleetLoad = Math.round(
    agents.reduce((sum, a) => sum + computeAgentWorkloadPct(a), 0) / Math.max(1, agents.length)
  );

  const avgCompletion = Math.round(
    projects.reduce((sum, p) => sum + computeCompletionPct(p), 0) / Math.max(1, projects.length)
  );

  const avgVisualRating = Number(
    (
      projects.reduce((sum, p) => sum + (p.ratings?.visual ?? 8.8), 0) /
      Math.max(1, projects.length)
    ).toFixed(1)
  );

  const avgOverallScore = Number(
    (
      projects.reduce(
        (sum, p) => sum + computeOverallProjectRating(p.ratings, computeCompletionPct(p)),
        0
      ) / Math.max(1, projects.length)
    ).toFixed(1)
  );

  const onTrackCount = projects.filter(
    p => p.timeliness?.scheduleStatus === 'ahead' || p.timeliness?.scheduleStatus === 'on-track'
  ).length;
  const atRiskCount = projects.length - onTrackCount;

  return (
    <div className="bg-[#111626]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl overflow-hidden shadow-xl shadow-black/25">
      <div className="px-5 py-3.5 border-b border-pink-500/15 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-sky-500/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-pink-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span>At-a-Glance Operations, Rating & Timeliness Pulse</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Unified numeric health score across visual craft, completion, progression, vibe, feel, and deadline pacing
          </p>
        </div>

        {onNavigateTab && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('workforce')}
              className="px-3 py-1.5 rounded-xl border border-pink-500/25 bg-[#0a0d16]/85 hover:bg-pink-500/15 text-xs font-medium text-pink-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Alerts & Workload
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              Inspect Project Ratings
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-pink-500/15">
        {/* KPI 1: Portfolio At-a-Glance Score */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Portfolio Rating</span>
            <span className="font-mono tabular-nums text-[11px] text-pink-200/75">
              Visual {avgVisualRating} / 10
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-pink-100 font-mono tabular-nums">
              {avgOverallScore}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 10</span>
            <span className="ml-auto text-xs font-semibold text-emerald-300">
              {getRatingTone(avgOverallScore).label}
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 pt-0.5">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full ${
                  idx + 1 <= Math.round(avgOverallScore)
                    ? 'bg-gradient-to-r from-pink-400 to-sky-300'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* KPI 2: Project Timeliness */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Project Timeliness</span>
            <span className="font-mono tabular-nums text-[11px] text-sky-200/75">
              {avgCompletion}% avg done
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-50 font-mono tabular-nums">
              {onTrackCount}/{projects.length}
            </span>
            <span className="text-xs text-slate-400">on schedule</span>
            <span
              className={`ml-auto text-xs font-semibold ${
                atRiskCount > 0 ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              {atRiskCount > 0 ? `${atRiskCount} at risk` : 'Nominal'}
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-pink-300 rounded-full"
              style={{ width: `${Math.round((onTrackCount / Math.max(1, projects.length)) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Agent Performance Alerts */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Performance Alerts</span>
            <span className="text-[11px] text-slate-500">SLA & latency</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                unresolvedCount > 0 ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              {unresolvedCount}
            </span>
            <span className="text-xs text-slate-400">active alerts</span>
            <span className="ml-auto text-xs font-medium text-pink-200/80">
              {unresolvedCount === 0 ? 'All clear' : 'Needs triage'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Monitors {agents.length} autonomous agents continuously
          </div>
        </div>

        {/* KPI 4: Fleet Workload Utilization */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Workload Overview</span>
            <span className="text-[11px] text-slate-500">Concurrency</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-50 font-mono tabular-nums">
              {avgFleetLoad}%
            </span>
            <span className="text-xs text-slate-400">fleet load</span>
            <span className="ml-auto text-xs font-semibold text-sky-300">
              Balanced
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-sky-300 to-pink-400 rounded-full"
              style={{ width: `${avgFleetLoad}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. PER-PROJECT VISUAL NUMBER RATING SYSTEM & TIMELINESS MODULE
 * ========================================================================== */
interface ProjectRatingsAndTimelinessPanelProps {
  project: ProjectTelemetryItem;
  onUpdateRatings: (projectId: string, updated: ProjectVisualRatings) => void;
  onUpdateTimeliness: (projectId: string, updated: ProjectTimeliness) => void;
}

export function ProjectRatingsAndTimelinessPanel({
  project,
  onUpdateRatings,
  onUpdateTimeliness
}: ProjectRatingsAndTimelinessPanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  const ratings: ProjectVisualRatings = project.ratings || {
    visual: 8.8,
    progression: 8.4,
    vibe: 9.1,
    feel: 8.9
  };

  const timeliness: ProjectTimeliness = project.timeliness || {
    startDate: '2026-11-04',
    dueDate: '2026-11-26',
    timeElapsedPct: 60,
    scheduleStatus: 'on-track',
    deltaLabel: 'On pace · 8d remaining',
    onTimeRatePct: 94,
    velocityPerDay: '1.2 tasks/day',
    nextMilestoneDue: 'Production Cutover · Nov 24'
  };

  const completionPct = computeCompletionPct(project);
  const completionScore10 = Number(((completionPct / 100) * 10).toFixed(1));
  const overallScore = computeOverallProjectRating(ratings, completionPct);
  const overallTone = getRatingTone(overallScore);
  const scheduleMeta = getScheduleBadgeMeta(timeliness.scheduleStatus);

  const paceDeltaPct = completionPct - timeliness.timeElapsedPct;

  const metricDimensions = [
    { key: 'visual' as const, label: 'Visual Project', value: ratings.visual, editable: true },
    { key: 'completion' as const, label: 'Completion', value: completionScore10, subLabel: `${completionPct}%`, editable: false },
    { key: 'progression' as const, label: 'Progression', value: ratings.progression, editable: true },
    { key: 'vibe' as const, label: 'Vibe', value: ratings.vibe, editable: true },
    { key: 'feel' as const, label: 'Feel & Polish', value: ratings.feel, editable: true }
  ];

  const adjustMetric = (key: keyof ProjectVisualRatings, delta: number) => {
    const nextVal = Math.max(1, Math.min(10, Number((ratings[key] + delta).toFixed(1))));
    onUpdateRatings(project.id, { ...ratings, [key]: nextVal });
  };

  return (
    <div className="border border-pink-500/20 rounded-2xl bg-[#0d111d]/85 overflow-hidden">
      {/* Top Row: Visual Number Rating Header + Timeliness Header */}
      <div className="px-4 py-3 border-b border-pink-500/15 bg-gradient-to-r from-pink-500/10 via-transparent to-sky-500/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Large At-a-Glance Score Readout */}
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${overallTone.text}`}>
              {overallScore.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">/10</span>
          </div>

          <div className="h-6 w-px bg-pink-500/20" />

          <div>
            <div className="text-xs font-semibold text-pink-50 flex items-center gap-2">
              <span>At-a-Glance Project Score</span>
              <span className={`text-[11px] font-semibold ${overallTone.text}`}>
                · {overallTone.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Visual craft, completion, progression velocity, vibe & feel
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Schedule Status Tag */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium ${scheduleMeta.classes}`}
          >
            {timeliness.scheduleStatus === 'ahead' || timeliness.scheduleStatus === 'on-track' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>{scheduleMeta.label}</span>
          </span>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-pink-500/25 bg-[#0a0d16]/85 hover:bg-pink-500/15 text-xs font-medium text-pink-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-300" />
            <span>{isEditing ? 'Done' : 'Rate & Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Middle Section: 5-Column Visual Number Rating Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-pink-500/15 bg-[#111626]/70 border-b border-pink-500/15">
        {metricDimensions.map(dim => {
          const tone = getRatingTone(dim.value);
          const filledBlocks = Math.round(dim.value);
          return (
            <div key={dim.key} className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium">{dim.label}</span>
                {dim.subLabel && (
                  <span className="font-mono tabular-nums text-pink-200 font-semibold">
                    {dim.subLabel}
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-lg font-bold font-mono tabular-nums ${tone.text}`}>
                    {dim.value.toFixed(1)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">/10</span>
                </div>

                {isEditing && dim.editable && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustMetric(dim.key as keyof ProjectVisualRatings, -0.5)}
                      className="w-5 h-5 rounded-md border border-pink-500/25 bg-[#0a0d16] hover:bg-pink-500/20 flex items-center justify-center text-pink-200 cursor-pointer"
                      aria-label={`Decrease ${dim.label}`}
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustMetric(dim.key as keyof ProjectVisualRatings, 0.5)}
                      className="w-5 h-5 rounded-md border border-pink-500/25 bg-[#0a0d16] hover:bg-pink-500/20 flex items-center justify-center text-sky-200 cursor-pointer"
                      aria-label={`Increase ${dim.label}`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* 10-Segment Visual Number Meter */}
              <div className="grid grid-cols-10 gap-0.5 pt-0.5" aria-hidden="true">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-colors ${
                      idx < filledBlocks ? tone.bar : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Project Timeliness & Schedule Pacing */}
      <div className="p-4 space-y-3 bg-[#0d111d]/70">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-pink-300" />
            <span className="font-semibold text-pink-50">Project Timeliness</span>
            <span aria-hidden="true" className="text-pink-500/35">
              ·
            </span>
            <span className="font-mono tabular-nums text-sky-200/85">{timeliness.deltaLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono tabular-nums">
            <span>Due {timeliness.dueDate}</span>
            <span aria-hidden="true" className="text-pink-500/35">·</span>
            <span>On-time SLA {timeliness.onTimeRatePct}%</span>
            <span aria-hidden="true" className="text-pink-500/35">·</span>
            <span>Velocity {timeliness.velocityPerDay}</span>
          </div>
        </div>

        {/* Dual-Track Pace Comparison: Completion % vs Time Elapsed % */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>Work Completed ({project.completedTasksCount}/{project.tasksCount} tasks)</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-300">
                {completionPct}%
              </span>
            </div>
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>Timeline Elapsed (Start {timeliness.startDate})</span>
              <span className="font-mono tabular-nums font-semibold text-pink-100">
                {timeliness.timeElapsedPct}%{' '}
                <span
                  className={
                    paceDeltaPct >= 0 ? 'text-emerald-300 font-medium' : 'text-amber-300 font-medium'
                  }
                >
                  ({paceDeltaPct >= 0 ? `+${paceDeltaPct}%` : `${paceDeltaPct}%`} vs time)
                </span>
              </span>
            </div>
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scheduleMeta.barClass}`}
                style={{ width: `${timeliness.timeElapsedPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>
            Next milestone: <strong className="text-pink-100">{timeliness.nextMilestoneDue}</strong>
          </span>
        </div>

        {/* Inline Schedule Editor when toggled */}
        {isEditing && (
          <div className="pt-3 border-t border-pink-500/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-medium text-pink-200/80 block mb-1">
                Schedule Status
              </label>
              <select
                value={timeliness.scheduleStatus}
                onChange={(e) => {
                  const nextStatus = e.target.value as ScheduleStatus;
                  const defaultDelta =
                    nextStatus === 'ahead'
                      ? '+2d ahead of pace'
                      : nextStatus === 'on-track'
                      ? 'On schedule'
                      : nextStatus === 'at-risk'
                      ? 'Watch · 18h buffer left'
                      : 'Overdue · needs escalation';
                  onUpdateTimeliness(project.id, {
                    ...timeliness,
                    scheduleStatus: nextStatus,
                    deltaLabel: defaultDelta
                  });
                }}
                className="w-full h-8 px-2.5 rounded-xl border border-pink-500/25 bg-[#0a0d16] text-xs text-slate-100 focus:outline-none focus:border-pink-400"
              >
                <option value="ahead">Ahead of Schedule</option>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-pink-200/80 block mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={timeliness.dueDate}
                onChange={(e) =>
                  onUpdateTimeliness(project.id, {
                    ...timeliness,
                    dueDate: e.target.value
                  })
                }
                className="w-full h-8 px-2.5 rounded-xl border border-pink-500/25 bg-[#0a0d16] text-xs font-mono text-slate-100 focus:outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-pink-200/80 block mb-1">
                Pace / Delta Note
              </label>
              <input
                type="text"
                value={timeliness.deltaLabel}
                onChange={(e) =>
                  onUpdateTimeliness(project.id, {
                    ...timeliness,
                    deltaLabel: e.target.value
                  })
                }
                className="w-full h-8 px-2.5 rounded-xl border border-pink-500/25 bg-[#0a0d16] text-xs text-slate-100 focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
