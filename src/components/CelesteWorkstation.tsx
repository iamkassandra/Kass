'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Plus,
  Search,
  Mail,
  Wrench,
  Brain,
  Calendar as CalendarIcon,
  GitCompare,
  BookOpen,
  Microscope,
  Image as ImageIcon,
  Library as LibraryIcon,
  FileText,
  CheckSquare,
  Moon,
  Sun,
  Settings,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Eye,
  Sparkles,
  Send,
  Loader2,
  Terminal,
  Bot,
  Copy,
  Check,
  Zap,
  Lock,
  GitBranch,
  RefreshCw,
  X,
  Play,
  TrendingUp,
  Target,
  ShieldAlert,
  Boxes,
  HelpCircle,
  Clock,
  DollarSign,
  Layers,
  FileCode,
  Download,
  Share2,
  Inbox,
  Filter,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Trash2,
  FolderOpen,
  Cpu,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { authFetch, type ServerCapabilities } from '@/lib/client/authFetch';

export interface CelesteProps {
  onOpenDashboard?: () => void;
  onSelectTab?: (tab: string) => void;
  onTriggerPush?: () => void;
  onTriggerZip?: () => void;
  onOpenSpawnProject?: () => void;
  isTriggeringPush?: boolean;
  isTriggeringZip?: boolean;
  capabilities?: ServerCapabilities | null;
  persistedNotes?: NoteItem[];
  onUpdateNotes?: (notes: NoteItem[]) => void;
  persistedTasks?: TaskItem[];
  onUpdateTasks?: (tasks: TaskItem[]) => void;
  exportEmail?: string;
}

export type CelesteModule =
  | 'chat'
  | 'search'
  | 'email'
  | 'tools'
  | 'brain'
  | 'calendar'
  | 'compare'
  | 'cookbook'
  | 'research'
  | 'gallery'
  | 'library'
  | 'notes'
  | 'tasks'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  isError?: boolean;
  groundingSources?: Array<{ title: string; uri: string }>;
  actions?: Array<{ label: string; action: () => void; variant?: 'primary' | 'secondary' }>;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  tags: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedAgent: string;
  status: 'backlog' | 'in-progress' | 'review' | 'completed';
  priority: 'urgent' | 'high' | 'normal';
  empire: string;
}

export interface EmailItem {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  unread: boolean;
  type: 'inbound' | 'outbound' | 'system';
  tag: string;
}

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: '12h Sprints & Cash Flow Moat',
    content: '# Strategic Revenue Directives\n- 12h sprint cycles deployed across Apex Capital and Matrix Forge.\n- Focus on Stripe payment links & automated B2B outreach.\n- Real-time workspace snapshot & Git sync pipelines.',
    category: 'Strategy',
    updatedAt: 'Synced',
    tags: ['Revenue', 'Sprints']
  },
  {
    id: 'note-2',
    title: 'Scrap Bank Recycling Priorities',
    content: '# Scrap Bank Monetization\n1. Quick-Turnaround WhatsApp Automation Bot.\n2. B2B Invoice PDF Extractor Tool.\n3. Local Clinic AI Receptionist.',
    category: 'Scrap Bank',
    updatedAt: 'Synced',
    tags: ['Recycling', 'Gems', 'Matrix']
  }
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Verify repository sync & workspace backup archive',
    description: 'Run git status/remote verification and export downloadable .zip workspace archive.',
    assignedAgent: 'Titan (Ops)',
    status: 'in-progress',
    priority: 'urgent',
    empire: 'Apex Sovereign Capital'
  },
  {
    id: 'task-2',
    title: 'Mine raw project backlogs for reusable SaaS gems',
    description: 'Identify top monetization angle and launchable MVP scope.',
    assignedAgent: 'Gem-Miner',
    status: 'in-progress',
    priority: 'high',
    empire: 'Matrix SaaS Forge'
  },
  {
    id: 'task-3',
    title: 'Run live Outbound Hunter research for local service leads',
    description: 'Use Google Search grounding to identify high-intent local businesses and outreach angles.',
    assignedAgent: 'Vanguard',
    status: 'backlog',
    priority: 'high',
    empire: 'Apex Sovereign Capital'
  },
  {
    id: 'task-4',
    title: 'Run live Border Council triage on inbound lead',
    description: 'Synthesize multi-perspective routing decision and priority.',
    assignedAgent: 'Moat-Council',
    status: 'completed',
    priority: 'normal',
    empire: 'Apex Sovereign Capital'
  }
];

export const CelesteWorkstation: React.FC<CelesteProps> = ({
  onOpenDashboard,
  onSelectTab,
  onTriggerPush,
  onTriggerZip,
  isTriggeringPush = false,
  isTriggeringZip = false,
  capabilities = null,
  persistedNotes,
  onUpdateNotes,
  persistedTasks,
  onUpdateTasks,
  exportEmail = 'theaucklandassistant@gmail.com'
}) => {
  // Navigation & View State
  const [activeModule, setActiveModule] = useState<CelesteModule>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatMode, setChatMode] = useState<'agent' | 'chat'>('chat');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-hydrogen' | 'gpt-4o'>('gemini-4-hydrogen');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>('Korban (קָרְבָּן)');
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [localCapabilities, setLocalCapabilities] = useState<ServerCapabilities | null>(capabilities);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search Module State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'agents' | 'scrap' | 'sops' | 'repos'>('all');

  // Email Module State
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState(exportEmail);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusToast, setEmailStatusToast] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Notes State (Synced with persisted workspace)
  const initialNotes = persistedNotes && persistedNotes.length > 0 ? persistedNotes : DEFAULT_NOTES;
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<NoteItem>(initialNotes[0]);
  const [noteTitle, setNoteTitle] = useState(initialNotes[0].title);
  const [noteContent, setNoteContent] = useState(initialNotes[0].content);

  // Tasks State (Synced with persisted workspace)
  const initialWorkTasks = persistedTasks && persistedTasks.length > 0 ? persistedTasks : DEFAULT_TASKS;
  const [tasks, setTasks] = useState<TaskItem[]>(initialWorkTasks);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAgent, setNewTaskAgent] = useState('Korban (קָרְבָּן)');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'normal'>('high');

  // Deep Research State
  const [researchTopic, setResearchTopic] = useState('High-margin B2B micro-SaaS opportunities for sole operators');
  const [isResearching, setIsResearching] = useState(false);
  const [researchReport, setResearchReport] = useState<string | null>(null);
  const [researchSources, setResearchSources] = useState<Array<{ title: string; uri: string }>>([]);
  const [researchError, setResearchError] = useState<string | null>(null);

  // Compare Models State
  const [comparePrompt, setComparePrompt] = useState('Formulate a 3-step rapid go-to-market plan to convert cold B2B prospects into $500/mo retainer clients within 48 hours.');
  const [isComparing, setIsComparing] = useState(false);
  const [compareResults, setCompareResults] = useState<{
    gemini?: { text?: string; error?: string; latencyMs?: number };
    gpt4o?: { text?: string; error?: string; latencyMs?: number };
  } | null>(null);

  useEffect(() => {
    if (capabilities) {
      setLocalCapabilities(capabilities);
      if (!capabilities.geminiConfigured && capabilities.openaiConfigured) {
        setSelectedModel('gpt-4o');
      }
    } else {
      authFetch('/api/ops/status')
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (data?.success) {
            setLocalCapabilities(data);
            if (!data.geminiConfigured && data.openaiConfigured) {
              setSelectedModel('gpt-4o');
            }
          }
        })
        .catch(() => {});
    }
  }, [capabilities]);

  useEffect(() => {
    if (persistedNotes && persistedNotes.length > 0) {
      setNotes(persistedNotes);
    }
  }, [persistedNotes]);

  useEffect(() => {
    if (persistedTasks && persistedTasks.length > 0) {
      setTasks(persistedTasks);
    }
  }, [persistedTasks]);

  useEffect(() => {
    setComposeTo(exportEmail);
  }, [exportEmail]);

  const handleRefreshServerStatus = async (runPing = false) => {
    setIsTestingConnection(true);
    try {
      const res = await authFetch(`/api/ops/status${runPing ? '?test=true' : ''}`);
      const data = await res.json();
      if (data?.success) {
        setLocalCapabilities(data);
      }
    } catch {
      // Keep previous capability state
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [chatInput]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Mock Emails
  const emails: EmailItem[] = [
    {
      id: 'mail-1',
      sender: 'KOMMANDRA Daemon <daemon@kommandra.sovereign>',
      recipient: 'theaucklandassistant@gmail.com',
      subject: '📦 Automated Git Snapshot & Source Archive Export',
      preview: 'Continuous 10-minute sovereign daemon has packaged latest state: 4 repositories synced, 17 agents active.',
      body: `Hello Kassandra,\n\nYour autonomous KOMMANDRA 10-minute snapshot daemon has successfully executed:\n\n- Timestamp: ${new Date().toISOString()}\n- Repositories: Apex Sovereign Capital, Matrix SaaS Forge, Sovereign Enclave\n- Workforce Health: 17/17 Agents Operational\n- Backup Archive: Packed & Encrypted (AES-256)\n\nAll continuous pipelines remain 100% active and autonomous.`,
      timestamp: '5m ago',
      unread: true,
      type: 'system',
      tag: 'Backup'
    },
    {
      id: 'mail-2',
      sender: 'Vanguard Outbound <outbound@apexcapital.ai>',
      recipient: 'theaucklandassistant@gmail.com',
      subject: '🎯 14 High-Intent B2B Prospect Leads Dispatched',
      preview: 'Outbound pipeline identified 14 target companies for the new AI Operations Retainer.',
      body: `Executive Briefing:\n\nVanguard Outbound has scanned the local Auckland directory and identified 14 verified decision-makers ready for the $4,500/mo AI Automation Retainer.\n\nEstimated Deal Value: $63,000 ARR.\n\nNext Action: 24/7 Hunter squad is dispatching personalized video teaser scripts.`,
      timestamp: '1h ago',
      unread: false,
      type: 'inbound',
      tag: 'Sales'
    },
    {
      id: 'mail-3',
      sender: 'Gem-Miner <miner@matrixforge.io>',
      recipient: 'theaucklandassistant@gmail.com',
      subject: '💎 Scrap Miner Report: 3 Monikers Ready for Packaging',
      preview: 'Analyzed messy project backlog. Extracted 3 high-leverage micro-SaaS modules ready to ship.',
      body: `Scrap Mining Digest:\n\n1. WhatsApp Appointment Rescheduler (Est. $2,800/mo)\n2. Fast Invoice OCR to QuickBooks (Est. $4,200/mo)\n3. Local Enclave AI Proxy (Est. $5,500/mo)\n\nRecommended: One-click spawn directly to Matrix SaaS Forge.`,
      timestamp: '3h ago',
      unread: false,
      type: 'system',
      tag: 'Scrap Gems'
    }
  ];

  // Handle Command or Chat Submission
  const handleSendMessage = async (customText?: string) => {
    const textToSend = typeof customText === 'string' ? customText.trim() : chatInput.trim();
    if (!textToSend || isGenerating) return;

    // Handle Quick Slash Commands
    if (textToSend.startsWith('/setup')) {
      setChatInput('');
      setIsSetupModalOpen(true);
      handleRefreshServerStatus(false);
      return;
    }

    if (textToSend.startsWith('/push')) {
      setChatInput('');
      if (onTriggerPush) onTriggerPush();
      setMessages(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'user',
          content: '/push',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: `resp-${Date.now()}`,
          role: 'assistant',
          content: 'Running real repository status & GitHub remote check. Check the Executive Event Stream or top banner for the exact sync result.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'KOMMANDRA Ops'
        }
      ]);
      return;
    }

    if (textToSend.startsWith('/zip')) {
      setChatInput('');
      if (onTriggerZip) onTriggerZip();
      setMessages(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'user',
          content: '/zip',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: `resp-${Date.now()}`,
          role: 'assistant',
          content: 'Building real .ZIP archive from your persisted workspace and initiating browser download.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'KOMMANDRA Archive'
        }
      ]);
      return;
    }

    if (textToSend.startsWith('/mine')) {
      setChatInput('');
      if (onSelectTab) onSelectTab('scrap-miner');
      return;
    }

    if (textToSend.startsWith('/forecast')) {
      setChatInput('');
      if (onSelectTab) onSelectTab('profit-forecast');
      return;
    }

    if (textToSend.startsWith('/sales')) {
      setChatInput('');
      if (onSelectTab) onSelectTab('outbound-hunters');
      return;
    }

    if (textToSend.startsWith('/council')) {
      setChatInput('');
      if (onSelectTab) onSelectTab('border-council');
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsGenerating(true);

    try {
      const response = await authFetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: chatMode === 'agent' ? 'executive' : 'assistant',
          agentName: selectedAudience,
          preferredModel: selectedModel,
          useWebSearch: isWebSearchEnabled,
          message: textToSend,
          conversationHistory: messages
            .filter(m => !m.isError)
            .slice(-8)
            .map(m => ({ role: m.role, content: m.content })),
          context: `You are KOMMANDRA / Korban (קָרְבָּן), executive AI co-partner for Kassandra. Provide sharp, accurate, actionable strategy, code, and revenue execution steps. Never invent fake URLs or claim external side-effects you did not run. Mode: ${chatMode}.`
        })
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            isError: true,
            content: data?.error || `AI request failed (${response.status}). Check /setup for server provider configuration.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: 'System Error'
          }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: 'assistant',
          content: data.reply || data.text,
          groundingSources: Array.isArray(data.groundingSources) ? data.groundingSources : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: data.model || selectedModel
        }
      ]);
    } catch (err: any) {
      console.error('Error communicating with KOMMANDRA:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          isError: true,
          content: err?.message || 'Network error communicating with /api/agents/chat.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'Network Error'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Deep Research with Live Google Search Grounding
  const handleRunDeepResearch = async () => {
    if (!researchTopic.trim() || isResearching) return;
    setIsResearching(true);
    setResearchReport(null);
    setResearchSources([]);
    setResearchError(null);

    try {
      const res = await authFetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: 'executive',
          agentName: 'KOMMANDRA Deep Research Agent',
          preferredModel: selectedModel,
          useWebSearch: true,
          message: `Conduct a rigorous, real-world market intelligence dossier on: "${researchTopic}". Include: 1. Executive Summary & Market Demand Signals, 2. Competitor Weaknesses & Pricing Gaps, 3. Exact 48-Hour Execution Blueprint, 4. High-Margin Monetization Strategy ($500-$5,000/mo). Only cite real facts and grounded sources.`,
          context: 'Deep Research Agent with Google Search grounding. Produce a crisp, actionable market intelligence dossier.'
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setResearchError(data?.error || `Research request failed (${res.status}).`);
        return;
      }
      setResearchReport(data.reply || data.text);
      if (Array.isArray(data.groundingSources)) {
        setResearchSources(data.groundingSources);
      }
    } catch (e: any) {
      setResearchError(e?.message || 'Failed to reach research endpoint.');
    } finally {
      setIsResearching(false);
    }
  };

  // Run Live Model Comparison (Gemini 4 Hydrogen vs OpenAI GPT-4o)
  const handleRunCompare = async () => {
    if (!comparePrompt.trim() || isComparing) return;
    setIsComparing(true);
    setCompareResults(null);

    const runOne = async (model: 'gemini-4-hydrogen' | 'gpt-4o') => {
      const started = Date.now();
      try {
        const res = await authFetch('/api/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName: model === 'gemini-4-hydrogen' ? 'Gemini 4 Hydrogen' : 'GPT-4o',
            preferredModel: model,
            useWebSearch: false,
            message: comparePrompt,
            context: `Live model comparison benchmark using ${model}. Keep output tactical and concise.`
          })
        });
        const data = await res.json();
        const latencyMs = Date.now() - started;
        if (!res.ok || !data?.success) {
          return { error: data?.error || `HTTP ${res.status}`, latencyMs };
        }
        return { text: data.reply || data.text, latencyMs };
      } catch (e: any) {
        return { error: e?.message || 'Request failed', latencyMs: Date.now() - started };
      }
    };

    try {
      const [geminiRes, gptRes] = await Promise.all([
        runOne('gemini-4-hydrogen'),
        runOne('gpt-4o')
      ]);
      setCompareResults({
        gemini: geminiRes,
        gpt4o: gptRes
      });
    } finally {
      setIsComparing(false);
    }
  };

  // Handle Send Real Outbound Email via /api/ops/actions
  const handleSendComposeEmail = async () => {
    if (!composeSubject.trim() || !composeBody.trim() || !composeTo.trim() || isSendingEmail) return;
    setIsSendingEmail(true);
    setEmailError(null);
    setEmailStatusToast(null);

    try {
      const res = await authFetch('/api/ops/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          to: composeTo.trim(),
          subject: composeSubject.trim(),
          text: composeBody.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setEmailError(data?.error || `Email dispatch failed (${res.status}).`);
        return;
      }

      setEmailStatusToast(data.message || `Email dispatched to ${composeTo}.`);
      setIsComposeOpen(false);
      setComposeSubject('');
      setComposeBody('');
      setTimeout(() => setEmailStatusToast(null), 5000);
    } catch (e: any) {
      setEmailError(e?.message || 'Network error while dispatching email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Save Note & Sync to Persisted Workspace
  const handleSaveNote = () => {
    const updated = notes.map(n =>
      n.id === selectedNote.id
        ? { ...n, title: noteTitle, content: noteContent, updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : n
    );
    setNotes(updated);
    onUpdateNotes?.(updated);
    setSelectedNote(prev => ({
      ...prev,
      title: noteTitle,
      content: noteContent,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  };

  // Add Task & Sync to Persisted Workspace
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: 'Operational directive created from KOMMANDRA Workstation.',
      assignedAgent: newTaskAgent,
      status: 'in-progress',
      priority: newTaskPriority,
      empire: 'Apex Sovereign Capital'
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    onUpdateTasks?.(updated);
    setNewTaskTitle('');
    setIsNewTaskOpen(false);
  };

  // Move Task Status & Sync to Persisted Workspace
  const handleMoveTask = (taskId: string, newStatus: TaskItem['status']) => {
    const updated = tasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t));
    setTasks(updated);
    onUpdateTasks?.(updated);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0d16] text-[#e2e8f0] font-sans antialiased overflow-hidden select-none">
      {/* Soft Ethereal Dreamy Glow Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,114,182,0.12),rgba(15,23,42,0.6))]" />

      {/* 1. LEFT SIDEBAR (Dreamy Soft Pastel Pink & Blue-Grey Aesthetic + Ruthlessly Functional) */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } shrink-0 bg-[#0d111d]/90 backdrop-blur-md border-r border-pink-500/15 flex flex-col justify-between transition-all duration-200 z-30 relative`}
      >
        {/* Top Branding & Nav items */}
        <div className="flex flex-col flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {/* Header row */}
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-pink-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {isSidebarOpen && (
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => {
                  setActiveModule('chat');
                  setMessages([]);
                }}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 flex items-center justify-center shadow-xs shadow-pink-500/30 text-[#0f172a] font-bold text-xs">
                  ✦
                </div>
                <span className="font-semibold text-sm tracking-tight bg-gradient-to-r from-pink-300 via-rose-200 to-sky-200 bg-clip-text text-transparent">
                  KOMMANDRA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  Sovereign
                </span>
              </div>
            )}
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              setActiveModule('chat');
              setMessages([]);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-pink-200/90 hover:text-white hover:bg-pink-500/15 border border-pink-500/20 shadow-xs transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-pink-300 group-hover:rotate-90 transition-transform" />
            {isSidebarOpen && <span className="font-semibold">New Chat</span>}
          </button>

          {/* Search */}
          <button
            onClick={() => setActiveModule('search')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'search'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4 text-pink-300/80" />
            {isSidebarOpen && <span>Search</span>}
          </button>

          {/* Email */}
          <button
            onClick={() => setActiveModule('email')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'email'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-pink-300/80" />
              {isSidebarOpen && <span>Email</span>}
            </div>
            {isSidebarOpen && (
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse shadow-xs shadow-pink-400" />
            )}
          </button>

          {/* Tools */}
          <button
            onClick={() => setActiveModule('tools')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'tools'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-4 h-4 text-sky-300/80" />
              {isSidebarOpen && <span>Tools</span>}
            </div>
            {isSidebarOpen && <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Brain / Moat Council */}
          <button
            onClick={() => setActiveModule('brain')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'brain'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <Brain className="w-4 h-4 text-pink-300/80" />
            {isSidebarOpen && <span>Brain</span>}
          </button>

          {/* Calendar */}
          <button
            onClick={() => setActiveModule('calendar')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'calendar'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-sky-300/80" />
            {isSidebarOpen && <span>Calendar</span>}
          </button>

          {/* Compare */}
          <button
            onClick={() => setActiveModule('compare')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'compare'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <GitCompare className="w-4 h-4 text-pink-300/80" />
            {isSidebarOpen && <span>Compare</span>}
          </button>

          {/* Cookbook */}
          <button
            onClick={() => setActiveModule('cookbook')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'cookbook'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-300/80" />
            {isSidebarOpen && <span>Cookbook</span>}
          </button>

          {/* Deep Research */}
          <button
            onClick={() => setActiveModule('research')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'research'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <Microscope className="w-4 h-4 text-pink-300/80" />
            {isSidebarOpen && <span>Deep Research</span>}
          </button>

          {/* Gallery */}
          <button
            onClick={() => setActiveModule('gallery')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'gallery'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-sky-300/80" />
            {isSidebarOpen && <span>Gallery</span>}
          </button>

          {/* Library */}
          <button
            onClick={() => setActiveModule('library')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'library'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <LibraryIcon className="w-4 h-4 text-pink-300/80" />
              {isSidebarOpen && <span>Library</span>}
            </div>
            {isSidebarOpen && <Plus className="w-3.5 h-3.5 text-slate-500 hover:text-pink-300" />}
          </button>

          {/* Notes */}
          <button
            onClick={() => setActiveModule('notes')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'notes'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-300/80" />
            {isSidebarOpen && <span>Notes</span>}
          </button>

          {/* Tasks */}
          <button
            onClick={() => setActiveModule('tasks')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'tasks'
                ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-pink-300/80" />
            {isSidebarOpen && <span>Tasks</span>}
          </button>

          {/* Executive View / Workforce switch */}
          <button
            onClick={() => {
              if (onOpenDashboard) onOpenDashboard();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-pink-200 hover:bg-slate-800/50 transition-all cursor-pointer"
            title="Switch to Executive Multi-Empire View"
          >
            <Moon className="w-4 h-4 text-sky-300/80" />
            {isSidebarOpen && <span>Executive View</span>}
          </button>
        </div>

        {/* Bottom User info & settings */}
        <div className="p-2 border-t border-slate-800/80 flex items-center justify-between bg-[#0a0e19]">
          <div
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors flex-1"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-400 to-sky-400 text-slate-950 text-xs font-bold flex items-center justify-center shadow-xs">
              K
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-200 leading-none truncate">Kassandra (CEO)</span>
                <span className="text-[10px] text-pink-300/80 leading-none mt-0.5 truncate">theaucklandassistant@gmail.com</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-pink-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="KOMMANDRA Configuration & Setup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0f19] overflow-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-pink-500/10 bg-[#0d1220]/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-pink-500/20 hover:text-pink-200 border border-slate-700/60 text-xs text-slate-300 font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-pink-300" />
                <span>Workforce Dashboard</span>
              </button>
            )}
          </div>

          {/* Center Title or Module indicator */}
          <div className="relative">
            {activeModule === 'chat' ? (
              <div>
                <button
                  onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                  className="flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-pink-200 px-3 py-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-pink-500/15 transition-all cursor-pointer shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  <span className="font-semibold text-pink-100">{selectedAudience}</span>
                  <span className="text-slate-400">Stream</span>
                  <ChevronDown className="w-3.5 h-3.5 text-pink-300/80" />
                </button>

                {isAudienceDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-64 bg-[#111626] border border-pink-500/20 rounded-2xl shadow-2xl py-1.5 z-50 text-xs backdrop-blur-md">
                    {[
                      'Korban (קָרְבָּן) (Digital Co-Partner)',
                      'Vanguard (Sales Lead)',
                      'Gem-Miner (Scrap Recycler)',
                      'Forecaster-12h',
                      'Moat-Council',
                      'KOMMANDRA Chief of Staff',
                      'Sovereign Enclave'
                    ].map(agent => (
                      <button
                        key={agent}
                        onClick={() => {
                          setSelectedAudience(agent);
                          setIsAudienceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-pink-500/15 transition-colors cursor-pointer ${
                          selectedAudience === agent ? 'text-pink-300 font-semibold bg-pink-500/10' : 'text-slate-300'
                        }`}
                      >
                        {agent}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-pink-500/20 text-xs text-pink-200 font-medium capitalize shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                <span>{activeModule} Center</span>
              </div>
            )}
          </div>

          {/* Quick Action Daemons (Push, Zip, Setup) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerPush}
              disabled={isTriggeringPush}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-pink-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="10-Minute Git Push Daemon"
            >
              {isTriggeringPush ? <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" /> : <GitBranch className="w-3.5 h-3.5 text-pink-300" />}
              <span className="hidden sm:inline text-[11px] font-medium">Git Push</span>
            </button>

            <button
              onClick={onTriggerZip}
              disabled={isTriggeringZip}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-sky-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Backup Zip to Email"
            >
              {isTriggeringZip ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" /> : <Mail className="w-3.5 h-3.5 text-sky-300" />}
              <span className="hidden sm:inline text-[11px] font-medium">Backup Zip</span>
            </button>

            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 text-pink-200 border border-pink-400/40 text-xs font-semibold transition-all cursor-pointer shadow-xs shadow-pink-500/10"
            >
              /setup
            </button>
          </div>
        </header>

        {/* Dynamic Center Canvas Switcher */}
        {activeModule === 'chat' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            {messages.length === 0 ? (
              /* DREAMY HERO CENTER STAGE */
              <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto py-8">
                {/* Soft Glowing Ethereal Emblem */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400/30 via-rose-300/20 to-sky-400/30 border border-pink-300/40 flex items-center justify-center shadow-lg shadow-pink-500/20 backdrop-blur-md">
                    <Sparkles className="w-7 h-7 text-pink-300" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0b0f19]" />
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h1 className="text-3xl font-light tracking-tight bg-gradient-to-r from-pink-200 via-rose-100 to-sky-200 bg-clip-text text-transparent">
                    KOMMANDRA
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    Dreamy Soft Aesthetic • Ruthlessly Functional
                  </p>
                </div>

                {/* Subtitle / Help */}
                <p className="text-xs text-slate-400 max-w-md leading-relaxed font-sans">
                  Direct the autonomous workforce of 17 AI agents across Apex Sovereign Capital & Matrix SaaS Forge. Type{' '}
                  <button
                    onClick={() => setIsSetupModalOpen(true)}
                    className="text-pink-300 hover:underline font-semibold cursor-pointer"
                  >
                    /setup
                  </button>{' '}
                  for keys or trigger continuous daemons below.
                </p>

                {/* Audience Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/60 border border-pink-500/25 text-[11px] text-pink-200 shadow-xs">
                  <Eye className="w-3.5 h-3.5 text-pink-300" />
                  <span>Channel: {selectedAudience}</span>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-4">
                  {[
                    { label: '/alerts', desc: 'Agent Alerts & Workload', action: () => onSelectTab && onSelectTab('workforce'), color: 'border-rose-500/30 text-rose-300' },
                    { label: '/ratings', desc: 'Visual Score & Timeliness', action: () => onSelectTab && onSelectTab('projects'), color: 'border-cyan-500/30 text-cyan-300' },
                    { label: '/pulse', desc: 'Executive Ops Overview', action: () => onSelectTab && onSelectTab('command-centre'), color: 'border-indigo-500/30 text-indigo-300' },
                    { label: '/setup', desc: 'Sovereign Keys & Config', action: () => setIsSetupModalOpen(true), color: 'border-pink-500/30 text-pink-300' },
                    { label: '/mine', desc: 'Recycle Scrap Gems', action: () => onSelectTab && onSelectTab('scrap-miner'), color: 'border-amber-500/30 text-amber-300' },
                    { label: '/forecast', desc: '33-Day 12h Profit Model', action: () => onSelectTab && onSelectTab('profit-forecast'), color: 'border-emerald-500/30 text-emerald-300' },
                    { label: '/sales', desc: '24/7 Outbound Hunters', action: () => onSelectTab && onSelectTab('outbound-hunters'), color: 'border-sky-500/30 text-sky-300' },
                    { label: '/push', desc: 'Trigger 10-Min Push', action: () => handleSendMessage('/push'), color: 'border-purple-500/30 text-purple-300' }
                  ].map(cmd => (
                    <button
                      key={cmd.label}
                      onClick={cmd.action}
                      className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-pink-500/40 text-left transition-all cursor-pointer group shadow-xs backdrop-blur-xs"
                    >
                      <span className={`font-mono text-xs font-bold block ${cmd.color} group-hover:text-white`}>
                        {cmd.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {cmd.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ACTIVE STREAM */
              <div className="space-y-6 max-w-3xl w-full mx-auto py-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 text-xs leading-relaxed ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role !== 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500/20 to-sky-500/20 border border-pink-400/30 text-pink-300 font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        ✦
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl max-w-2xl space-y-2 ${
                        msg.role === 'user'
                          ? 'bg-pink-500/15 text-pink-50 border border-pink-400/30 ml-8 shadow-xs'
                          : 'bg-[#121727]/90 text-slate-200 border border-slate-700/80 mr-8 shadow-md backdrop-blur-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                        <span className="font-mono text-pink-300">{msg.role === 'user' ? 'Kassandra (CEO)' : msg.model || 'KOMMANDRA Sovereign'}</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div className="whitespace-pre-wrap font-sans text-xs text-slate-100 leading-relaxed">
                        {msg.isError && (
                          <div className="mb-2 flex items-center gap-1.5 text-rose-300 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Live Execution Error</span>
                          </div>
                        )}
                        {msg.content}
                      </div>

                      {msg.groundingSources && msg.groundingSources.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-semibold text-sky-300 uppercase tracking-wider block">
                            Verified Google Search Sources
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.groundingSources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25 text-[10px] text-sky-200 max-w-[220px] truncate"
                              >
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex gap-3 text-xs justify-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500/20 to-sky-500/20 border border-pink-400/30 text-pink-300 font-bold flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#121727]/90 border border-slate-700/80 text-xs text-pink-200 flex items-center gap-2">
                      <span>Executing live directive via {selectedModel === 'gpt-4o' ? 'OpenAI GPT-4o' : 'Gemini 4 Hydrogen'}...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* BOTTOM FLOATING INPUT BOX */}
            <div className="w-full max-w-3xl mx-auto pt-4 shrink-0">
              <div className="bg-[#121727]/90 border border-pink-500/25 rounded-2xl p-3 shadow-2xl shadow-pink-950/20 focus-within:border-pink-400/60 transition-all space-y-2 backdrop-blur-md">
                {/* Top row: Model selector on right */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="text-[11px] font-mono text-pink-300/80 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>{selectedAudience} • {chatMode === 'agent' ? 'Autonomous Action Mode' : 'Direct Conversation'}</span>
                  </span>

                  <div className="relative">
                    <button
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 hover:text-pink-200 px-2 py-0.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      <span>{selectedModel === 'gpt-4o' ? 'OpenAI GPT-4o' : 'Gemini 4 Hydrogen'}</span>
                      <ChevronUp className="w-3 h-3 text-pink-300" />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute bottom-full mb-1.5 right-0 w-52 bg-[#111626] border border-pink-500/25 rounded-2xl shadow-2xl py-1.5 text-xs z-50 backdrop-blur-md">
                        {[
                          { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen (Live)' },
                          { id: 'gpt-4o', label: 'OpenAI GPT-4o (Live)' }
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setSelectedModel(m.id as 'gemini-4-hydrogen' | 'gpt-4o');
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-pink-500/15 text-xs transition-colors cursor-pointer ${
                              selectedModel === m.id ? 'text-pink-300 font-semibold bg-pink-500/10' : 'text-slate-300'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main textarea */}
                <textarea
                  ref={textareaRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  placeholder={`Command ${selectedAudience} or enter slash command (/setup, /push, /mine, /forecast)...`}
                  className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-mono px-1 py-1"
                />

                {/* Bottom controls row */}
                <div className="flex items-center justify-between pt-1 px-1">
                  {/* Left tools */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSetupModalOpen(true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                      title="Configuration & Keys"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
                        isWebSearchEnabled
                          ? 'text-pink-200 bg-pink-500/20 border border-pink-400/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }`}
                      title="Toggle Deep Web Crawler"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Grounding</span>
                    </button>
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-2">
                    {/* Agent | Chat Toggle Pill */}
                    <div className="flex items-center bg-[#0a0e19] border border-slate-700/80 rounded-xl p-0.5 text-[11px]">
                      <button
                        onClick={() => setChatMode('agent')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          chatMode === 'agent'
                            ? 'bg-pink-500/30 text-pink-100 font-semibold border border-pink-400/30 shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Agent
                      </button>
                      <button
                        onClick={() => setChatMode('chat')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          chatMode === 'chat'
                            ? 'bg-pink-500/30 text-pink-100 font-semibold border border-pink-400/30 shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Chat
                      </button>
                    </div>

                    {/* Send Button */}
                    <button
                      id="btn-celeste-send"
                      onClick={() => handleSendMessage()}
                      disabled={isGenerating || !chatInput.trim()}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        chatInput.trim() && !isGenerating
                          ? 'bg-gradient-to-tr from-pink-400 to-rose-400 text-slate-950 hover:from-pink-300 hover:to-rose-300 shadow-pink-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH MODULE */}
        {activeModule === 'search' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-pink-500/15 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-pink-300" />
                  <span>Omnisearch & Intelligence Crawler</span>
                </h2>
                <p className="text-xs text-slate-400">Search across agents, scrap gems, SOPs, repositories, and live web intelligence</p>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-pink-300 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 17 agents, 5 scrap projects, Git commits, SOP knowledge, or web..."
                className="w-full bg-[#121727]/90 border border-pink-500/25 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-400/60 shadow-lg"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Resources' },
                { id: 'agents', label: 'Agents (17)' },
                { id: 'scrap', label: 'Scrap Gems' },
                { id: 'sops', label: 'SOPs & Knowledge' },
                { id: 'repos', label: 'Git Repositories' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSearchFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    searchFilter === f.id
                      ? 'bg-pink-500/20 text-pink-200 border border-pink-400/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: 'Digital Kassandra (CEO Clone)', type: 'Agent', desc: 'Autonomous co-partner directing 17 workforce agents and revenue pipelines.', category: 'agents' },
                { title: 'WhatsApp Appointment Rescheduler', type: 'Scrap Gem', desc: 'Mined from chaotic bank. $2,800/mo estimated cash flow.', category: 'scrap' },
                { title: '10-Minute Continuous Git Daemon SOP', type: 'SOP Document', desc: 'Automated daemon committing snapshots and dispatching encrypted email archives.', category: 'sops' },
                { title: 'Apex Sovereign Capital (Core)', type: 'Git Repository', desc: 'Main containerized revenue ops environment with Stripe endpoints.', category: 'repos' },
                { title: 'Vanguard (24/7 Outbound Lead Hunter)', type: 'Agent', desc: 'Autonomous sales prospecting agent scanning local high-intent businesses.', category: 'agents' },
                { title: 'Matrix SaaS Forge (Containers)', type: 'Git Repository', desc: 'Fast prototyping sandbox for repackaging mined scrap code.', category: 'repos' }
              ]
                .filter(item => searchFilter === 'all' || item.category === searchFilter)
                .filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveModule('chat');
                      handleSendMessage(`Analyze resource: "${res.title}" (${res.type})`);
                    }}
                    className="p-4 rounded-2xl bg-[#121727]/90 border border-slate-800 hover:border-pink-500/40 p-4 transition-all cursor-pointer group shadow-sm hover:shadow-pink-500/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 font-semibold">
                        {res.type}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-300 transition-transform group-hover:translate-x-1" />
                    </div>
                    <h3 className="font-semibold text-xs text-slate-100 group-hover:text-pink-200">{res.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{res.desc}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* EMAIL MODULE */}
        {activeModule === 'email' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Email list */}
            <div className="w-80 border-r border-slate-800 bg-[#0d1220]/70 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-slate-100">Sovereign Webmail</h3>
                  <p className="text-[10px] text-pink-300">theaucklandassistant@gmail.com</p>
                </div>
                <button
                  onClick={() => setIsComposeOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Compose</span>
                </button>
              </div>

              {emailStatusToast && (
                <div className="p-2 bg-emerald-500/20 border-b border-emerald-500/30 text-[11px] text-emerald-300 text-center font-medium">
                  {emailStatusToast}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {emails.map(mail => (
                  <div
                    key={mail.id}
                    onClick={() => setSelectedEmail(mail)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      selectedEmail?.id === mail.id
                        ? 'bg-pink-500/15 border-pink-500/30 shadow-xs'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-pink-200 truncate max-w-[130px]">{mail.sender.split('<')[0]}</span>
                      <span className="text-slate-400">{mail.timestamp}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-100 truncate">{mail.subject}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{mail.preview}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email detail */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0a0d16]">
              {selectedEmail ? (
                <div className="max-w-2xl mx-auto space-y-5 bg-[#121727]/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 text-[10px] font-semibold border border-pink-500/20">
                        {selectedEmail.tag}
                      </span>
                      <h2 className="text-base font-bold text-slate-100 mt-2">{selectedEmail.subject}</h2>
                      <div className="text-xs text-slate-400 mt-1">
                        From: <span className="text-slate-200">{selectedEmail.sender}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{selectedEmail.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                    {selectedEmail.body}
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setComposeTo(selectedEmail.sender.includes('<') ? selectedEmail.sender.split('<')[1].replace('>', '') : selectedEmail.sender);
                        setComposeSubject(`Re: ${selectedEmail.subject}`);
                        setIsComposeOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Reply to Sender
                    </button>
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Close Email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                  <Mail className="w-10 h-10 text-pink-300/40" />
                  <p className="text-xs">Select an email to read or compose an automated directive.</p>
                </div>
              )}
            </div>

            {/* Compose Modal */}
            {isComposeOpen && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-[#121727] border border-pink-500/30 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-pink-200 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-pink-300" />
                      <span>Compose Sovereign Email</span>
                    </h3>
                    <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-slate-400">To:</label>
                      <input
                        type="text"
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        className="w-full bg-[#0d1220] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 mt-1 focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-slate-400">Subject:</label>
                      <input
                        type="text"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="Subject headline..."
                        className="w-full bg-[#0d1220] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 mt-1 focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-slate-400">Body:</label>
                      <textarea
                        rows={6}
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder="Write email content or template..."
                        className="w-full bg-[#0d1220] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 mt-1 focus:outline-none focus:border-pink-400 resize-none font-sans"
                      />
                    </div>
                  </div>

                  {/* 1-Click AI Prompt Templates */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">AI Templates:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeSubject('Weekly Sovereign Revenue & 12h Sprint Report');
                        setComposeBody('Executive Summary:\n\n- 17 workforce agents synchronized.\n- Scrap bank mined for highest-ROI launch opportunities.\n- Workspace archive & repo status verified.');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-pink-300 hover:bg-slate-700 cursor-pointer"
                    >
                      Executive Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeSubject('Proposal: 24/7 AI Lead & Revenue Automation Retainer');
                        setComposeBody('Hi there,\n\nWe audited your customer acquisition workflow and prepared a custom interactive demo. Reply to activate our turnkey retainer.');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-sky-300 hover:bg-slate-700 cursor-pointer"
                    >
                      Sales Proposal
                    </button>
                  </div>

                  {emailError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/35 text-rose-200 text-[11px] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-300" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEmailError(null);
                        setIsComposeOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendComposeEmail}
                      disabled={isSendingEmail || !composeSubject.trim() || !composeBody.trim()}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-slate-950 font-bold hover:from-pink-300 hover:to-rose-300 shadow-md shadow-pink-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSendingEmail && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isSendingEmail ? 'Sending...' : 'Send Live Email'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOLS MODULE */}
        {activeModule === 'tools' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-6">
            <div className="border-b border-pink-500/15 pb-4">
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-sky-300" />
                <span>Sovereign Operations Tool Suite</span>
              </h2>
              <p className="text-xs text-slate-400">Execute autonomous daemons, scrap recycling, profit simulations, and Stripe checkout pipelines</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tool 1: 10-Minute Git Daemon */}
              <div className="p-5 rounded-2xl bg-[#121727]/90 border border-slate-800 hover:border-pink-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center font-bold">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-100">10-Minute Git Daemon</h3>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Continuous Loop
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Automatically commits uncommitted project changes to GitHub and packages zip exports every 600s.
                </p>
                <button
                  onClick={onTriggerPush}
                  disabled={isTriggeringPush}
                  className="w-full py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isTriggeringPush ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Trigger Instant Push</span>
                </button>
              </div>

              {/* Tool 2: Encrypted Zip Exporter */}
              <div className="p-5 rounded-2xl bg-[#121727]/90 border border-slate-800 hover:border-sky-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center font-bold">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-100">Encrypted Zip Exporter</h3>
                      <p className="text-[10px] text-sky-400">theaucklandassistant@gmail.com</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Packs full source tree into encrypted snapshot and emails direct download link.
                </p>
                <button
                  onClick={onTriggerZip}
                  disabled={isTriggeringZip}
                  className="w-full py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isTriggeringZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>Dispatch Zip Archive</span>
                </button>
              </div>

              {/* Tool 3: Scrap Miner Launcher */}
              <div className="p-5 rounded-2xl bg-[#121727]/90 border border-slate-800 hover:border-amber-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center font-bold">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-100">Scrap Miner Analyzer</h3>
                      <p className="text-[10px] text-amber-400">5 Backlog Banks Ready</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Recycle abandoned script libraries and half-built repos into lucrative containerized SaaS projects.
                </p>
                <button
                  onClick={() => onSelectTab && onSelectTab('scrap-miner')}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Scrap Miner</span>
                </button>
              </div>

              {/* Tool 4: 12-Hour Forecaster */}
              <div className="p-5 rounded-2xl bg-[#121727]/90 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-100">33-Day 12h Forecaster</h3>
                      <p className="text-[10px] text-emerald-400">$33,000 Milestone Target</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Simulate compounding revenue sprints and operational cash milestones across empires.
                </p>
                <button
                  onClick={() => onSelectTab && onSelectTab('profit-forecast')}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Open Profit Forecaster</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BRAIN / MOAT COUNCIL MODULE */}
        {activeModule === 'brain' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-6">
            <div className="border-b border-pink-500/15 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-pink-300" />
                  <span>Autonomous AI Engine & Moat Readiness</span>
                </h2>
                <p className="text-xs text-slate-400">Live capability telemetry for Gemini 4 Hydrogen, OpenAI GPT-4o, Stripe, GitHub, and Resend</p>
              </div>
              <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                localCapabilities?.aiConfigured
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {localCapabilities?.aiConfigured ? `Active: ${localCapabilities.activeModel}` : 'AI Keys Required'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#121727]/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pink-300 uppercase">Gemini 4 Hydrogen</span>
                  <span className={`text-[10px] font-semibold ${localCapabilities?.geminiConfigured ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {localCapabilities?.geminiConfigured ? 'Live + Grounding' : 'Not Configured'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Powers Google Search-grounded market research, 12h profit forecasting, outbound prospecting, and fast agent chat.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#121727]/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-sky-300 uppercase">OpenAI GPT-4o</span>
                  <span className={`text-[10px] font-semibold ${localCapabilities?.openaiConfigured ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {localCapabilities?.openaiConfigured ? 'Live Ready' : 'Optional / Not Set'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Side-by-side structured deliberation, architecture planning, and JSON deliverable generation.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#121727]/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase">Live Revenue Ops</span>
                  <span className="text-[10px] font-semibold text-sky-300">
                    {localCapabilities?.stripeConfigured ? 'Stripe Live' : 'Stripe Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Connects live Stripe Payment Link minting, Resend outbound email, Git repo verification, and PKZIP snapshots.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121727]/90 border border-pink-500/30 space-y-3">
              <h3 className="font-bold text-sm text-pink-200">Launch Real-Time Multi-Perspective Border Triage</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluate inbound client inquiries, contracts, or system escalations using live AI triage in the Border Moat Council tab.
              </p>
              <button
                onClick={() => onSelectTab && onSelectTab('border-council')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-slate-950 font-bold text-xs hover:from-pink-300 hover:to-rose-300 transition-all cursor-pointer shadow-md"
              >
                Open Live Border Moat Council
              </button>
            </div>
          </div>
        )}

        {/* CALENDAR MODULE */}
        {activeModule === 'calendar' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-5">
            <div className="border-b border-pink-500/15 pb-4">
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-300" />
                <span>33-Day 12-Hour Sprint Execution Calendar</span>
              </h2>
              <p className="text-xs text-slate-400">Tracking every 12-hour revenue sprint window toward your revenue target</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {Array.from({ length: 14 }).map((_, i) => {
                const day = i + 1;
                const target = Math.round(500 * Math.pow(1.3, day));
                const isPast = day <= 3;
                const isCurrent = day === 4;

                return (
                  <div
                    key={day}
                    className={`p-3 rounded-2xl border transition-all text-xs space-y-1.5 ${
                      isCurrent
                        ? 'bg-pink-500/20 border-pink-400 shadow-md shadow-pink-500/20'
                        : isPast
                        ? 'bg-slate-900/80 border-slate-800 opacity-80'
                        : 'bg-[#121727]/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-300">Day {day}</span>
                      {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-pink-300">${target.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 truncate">Sprint {day * 2 - 1} & {day * 2}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMPARE MODULE */}
        {activeModule === 'compare' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-5">
            <div className="border-b border-pink-500/15 pb-4">
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-pink-300" />
                <span>Live Multi-Model Benchmark Sandbox</span>
              </h2>
              <p className="text-xs text-slate-400">Execute the same tactical prompt live side-by-side across Gemini 4 Hydrogen and OpenAI GPT-4o</p>
            </div>

            <div className="space-y-3">
              <textarea
                rows={2}
                value={comparePrompt}
                onChange={(e) => setComparePrompt(e.target.value)}
                placeholder="Enter test prompt..."
                className="w-full bg-[#121727]/90 border border-pink-500/25 rounded-2xl p-3 text-xs text-slate-100 focus:outline-none focus:border-pink-400"
              />
              <button
                onClick={handleRunCompare}
                disabled={isComparing}
                className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                {isComparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-pink-300" />}
                <span>Run Live Benchmark Comparison</span>
              </button>
            </div>

            {compareResults && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#121727]/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-300">Gemini 4 Hydrogen</span>
                    {compareResults.gemini?.latencyMs !== undefined && (
                      <span className="text-[10px] font-mono text-slate-400">{compareResults.gemini.latencyMs}ms</span>
                    )}
                  </div>
                  {compareResults.gemini?.error ? (
                    <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-400/25 p-2.5 rounded-xl">
                      {compareResults.gemini.error}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-[11px] text-slate-300 font-sans leading-relaxed">{compareResults.gemini?.text}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#121727]/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-pink-300">OpenAI GPT-4o</span>
                    {compareResults.gpt4o?.latencyMs !== undefined && (
                      <span className="text-[10px] font-mono text-slate-400">{compareResults.gpt4o.latencyMs}ms</span>
                    )}
                  </div>
                  {compareResults.gpt4o?.error ? (
                    <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-400/25 p-2.5 rounded-xl">
                      {compareResults.gpt4o.error}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-[11px] text-slate-300 font-sans leading-relaxed">{compareResults.gpt4o?.text}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* COOKBOOK MODULE */}
        {activeModule === 'cookbook' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-5">
            <div className="border-b border-pink-500/15 pb-4">
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-300" />
                <span>Autonomous Sovereign Cookbook</span>
              </h2>
              <p className="text-xs text-slate-400">Pre-built, 1-click executable operational recipes for live execution</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Cold Lead to Stripe Link in 3 Minutes',
                  category: 'Sales Execution',
                  desc: 'Scout high-intent prospects, draft a personalized teardown, and launch a recurring Stripe offer.',
                  action: 'Execute Lead Recipe'
                },
                {
                  title: 'Scrap-to-SaaS 4-Hour Repackager',
                  category: 'Matrix Forge',
                  desc: 'Pull unfinished scripts from scrap bank, identify monetization scope, and build deliverables.',
                  action: 'Run Repackage Recipe'
                },
                {
                  title: 'Workspace Archive & Repo Sync',
                  category: 'DevOps Moat',
                  desc: 'Verify git status, check remote GitHub repo connectivity, and export a real PKZIP snapshot.',
                  action: 'Trigger Sync & Archive'
                },
                {
                  title: 'High-Intent Client Video Audit Script',
                  category: 'Creative Ops',
                  desc: 'Generate a concise Loom outreach script highlighting conversion fixes on a prospect website.',
                  action: 'Generate Loom Script'
                }
              ].map((recipe, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#121727]/90 border border-slate-800 hover:border-pink-500/30 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {recipe.category}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-100">{recipe.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{recipe.desc}</p>
                  <button
                    onClick={() => {
                      setActiveModule('chat');
                      handleSendMessage(`Execute cookbook recipe: "${recipe.title}"`);
                    }}
                    className="w-full py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 border border-pink-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{recipe.action}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEEP RESEARCH MODULE */}
        {activeModule === 'research' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-5">
            <div className="border-b border-pink-500/15 pb-4">
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <Microscope className="w-5 h-5 text-pink-300" />
                <span>Autonomous Deep Research Engine</span>
              </h2>
              <p className="text-xs text-slate-400">Generate market intelligence dossiers grounded with live Google Search citations</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Enter topic, target competitor, or market niche..."
                className="flex-1 bg-[#121727]/90 border border-pink-500/25 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-pink-400"
              />
              <button
                onClick={handleRunDeepResearch}
                disabled={isResearching}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-slate-950 font-bold text-xs hover:from-pink-300 hover:to-rose-300 transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-pink-500/20"
              >
                {isResearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Research Live</span>
              </button>
            </div>

            {researchError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-400/35 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                <span>{researchError}</span>
              </div>
            )}

            {researchReport && (
              <div className="p-6 rounded-2xl bg-[#121727]/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-pink-300">Synthesized Intelligence Dossier</span>
                  <button
                    onClick={() => copyToClipboard(researchReport, 'research')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'research' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Dossier</span>
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                  {researchReport}
                </div>
                {researchSources.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                      Google Search Grounding Sources
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {researchSources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25 text-[11px] text-sky-200"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span>{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* GALLERY MODULE */}
        {activeModule === 'gallery' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-5">
            <div className="border-b border-pink-500/15 pb-4">
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-300" />
                <span>Product Artifact & UI Gallery</span>
              </h2>
              <p className="text-xs text-slate-400">Visual mockup previews, brand tokens, and containerized UI artifacts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'KOMMANDRA Workstation UI', tag: 'Aesthetic Interface', gradient: 'from-pink-500/30 to-purple-600/30' },
                { title: 'Apex Capital Invoice Flow', tag: 'Stripe SaaS', gradient: 'from-sky-500/30 to-blue-600/30' },
                { title: 'Matrix Scrap Miner Terminal', tag: 'DevOps Tool', gradient: 'from-amber-500/30 to-rose-600/30' },
                { title: 'Vanguard Outbound Teaser', tag: 'Video Asset', gradient: 'from-emerald-500/30 to-teal-600/30' },
                { title: 'Sovereign Enclave Security', tag: 'Moat Graphic', gradient: 'from-indigo-500/30 to-pink-600/30' },
                { title: '12-Hour Profit Sprint Chart', tag: 'Financial Model', gradient: 'from-rose-500/30 to-orange-600/30' }
              ].map((art, i) => (
                <div key={i} className="rounded-2xl bg-[#121727]/90 border border-slate-800 overflow-hidden hover:border-pink-500/40 transition-all group">
                  <div className={`h-28 bg-gradient-to-tr ${art.gradient} flex items-center justify-center text-pink-200 font-mono text-xs border-b border-slate-800`}>
                    <Sparkles className="w-6 h-6 text-pink-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[9px] font-semibold text-pink-300 uppercase">{art.tag}</span>
                    <h3 className="font-bold text-xs text-slate-100">{art.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIBRARY MODULE */}
        {activeModule === 'library' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-5">
            <div className="border-b border-pink-500/15 pb-4">
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <LibraryIcon className="w-5 h-5 text-pink-300" />
                <span>Sovereign Knowledge Vault & SOP Bank</span>
              </h2>
              <p className="text-xs text-slate-400">Operational playbooks, API secrets vault, brand tokens, and code snippets</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'SOP: Continuous 10-Minute Git Snapshot Daemon', desc: 'Step-by-step background daemon architecture and email dispatch protocols.' },
                { title: 'SOP: 24/7 Outbound B2B Acquisition Protocol', desc: 'How Vanguard scrapes, personalizes, and closes $4,500/mo retainers.' },
                { title: 'Secrets Enclave: Stripe Live & Webhook Keys', desc: 'Secure local storage mapping for checkout and webhook fulfillment.' },
                { title: 'Scrap Gem Moniker Registry', desc: 'Catalog of 5 extracted raw backlogs with projected ARR metrics.' }
              ].map((lib, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#121727]/90 border border-slate-800 hover:border-pink-500/30 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-sky-300 uppercase font-mono">Vault Item #{i + 1}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-100">{lib.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{lib.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES MODULE */}
        {activeModule === 'notes' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Notes List */}
            <div className="w-72 border-r border-slate-800 bg-[#0d1220]/70 flex flex-col p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-slate-100">Sovereign Notes</h3>
                <button
                  onClick={() => {
                    const newN: NoteItem = {
                      id: `note-${Date.now()}`,
                      title: 'Untitled Note',
                      content: '# New Operational Note\n\nWrite your thoughts here...',
                      category: 'General',
                      updatedAt: 'Just now',
                      tags: ['New']
                    };
                    const updated = [newN, ...notes];
                    setNotes(updated);
                    onUpdateNotes?.(updated);
                    setSelectedNote(newN);
                    setNoteTitle(newN.title);
                    setNoteContent(newN.content);
                  }}
                  className="p-1 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5">
                {notes.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setSelectedNote(n);
                      setNoteTitle(n.title);
                      setNoteContent(n.content);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      selectedNote.id === n.id ? 'bg-pink-500/15 border-pink-500/30' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-100 truncate">{n.title}</div>
                    <div className="text-[10px] text-slate-400">{n.updatedAt} • {n.category}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Editor */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0a0d16] flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="bg-transparent font-bold text-base text-slate-100 focus:outline-none focus:border-b focus:border-pink-400 w-full mr-4"
                />
                <button
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Save Note
                </button>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="flex-1 bg-[#121727]/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-100 focus:outline-none focus:border-pink-400 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TASKS KANBAN MODULE */}
        {activeModule === 'tasks' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl w-full mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-pink-500/15 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-pink-300" />
                  <span>Sovereign Sprint Kanban Board</span>
                </h2>
                <p className="text-xs text-slate-400">17 autonomous agents executing across 4 agile stages</p>
              </div>

              <button
                onClick={() => setIsNewTaskOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sprint Task</span>
              </button>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { id: 'backlog', label: 'Backlog Queue', color: 'border-slate-700' },
                { id: 'in-progress', label: 'In Progress (AI)', color: 'border-pink-500/40 text-pink-300' },
                { id: 'review', label: 'Moat Review', color: 'border-amber-500/40 text-amber-300' },
                { id: 'completed', label: 'Completed & Active', color: 'border-emerald-500/40 text-emerald-300' }
              ].map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="p-3 rounded-2xl bg-[#0d1220]/80 border border-slate-800 space-y-2.5 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className={`font-bold ${col.color}`}>{col.label}</span>
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {colTasks.map(t => (
                        <div key={t.id} className="p-3 rounded-xl bg-[#121727] border border-slate-700/60 p-3 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-300 font-semibold">{t.priority.toUpperCase()}</span>
                            <span className="text-slate-400 font-mono">{t.assignedAgent}</span>
                          </div>
                          <h4 className="font-semibold text-xs text-slate-100 leading-snug">{t.title}</h4>
                          <p className="text-[10px] text-slate-400">{t.description}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                            <span className="text-slate-400 truncate max-w-[90px]">{t.empire}</span>
                            <div className="flex gap-1">
                              {t.status !== 'completed' && (
                                <button
                                  onClick={() => handleMoveTask(t.id, t.status === 'backlog' ? 'in-progress' : t.status === 'in-progress' ? 'review' : 'completed')}
                                  className="text-pink-300 hover:underline font-semibold"
                                >
                                  Advance →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Task Modal */}
            {isNewTaskOpen && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-[#121727] border border-pink-500/30 rounded-2xl w-full max-w-md p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-sm text-pink-200">Create Sprint Task</h3>
                    <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Task Title</label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Repackage invoice PDF extractor into Next.js"
                        className="w-full bg-[#0d1220] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 mt-1 focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Agent</label>
                      <select
                        value={newTaskAgent}
                        onChange={(e) => setNewTaskAgent(e.target.value)}
                        className="w-full bg-[#0d1220] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 mt-1 focus:outline-none"
                      >
                        <option value="Digital Kassandra">Digital Kassandra (CEO)</option>
                        <option value="Vanguard (Ops)">Vanguard (Sales & Ops)</option>
                        <option value="Gem-Miner">Gem-Miner (Scrap Recycler)</option>
                        <option value="Hunter-Alpha">Hunter-Alpha (24/7 Outbound)</option>
                        <option value="Moat-Council">Moat-Council</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button onClick={() => setIsNewTaskOpen(false)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300">
                      Cancel
                    </button>
                    <button onClick={handleAddTask} className="px-4 py-1.5 rounded-xl bg-pink-500 text-slate-950 font-bold hover:bg-pink-400">
                      Create Task
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. CELESTE SETUP & LIVE CAPABILITIES MODAL (/setup) */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111626] border border-pink-500/30 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-400/30 to-sky-400/30 border border-pink-300/40 text-pink-300 flex items-center justify-center font-bold">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>KOMMANDRA Live Capabilities & Setup</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      localCapabilities?.aiConfigured
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                    }`}>
                      {localCapabilities?.aiConfigured ? 'AI Live' : 'Setup Needed'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Server-side environment status & live connection diagnostics</p>
                </div>
              </div>
              <button
                onClick={() => setIsSetupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Server Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0d1220] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Gemini 4 Hydrogen</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">
                    {localCapabilities?.geminiConfigured ? 'Configured' : 'Missing GEMINI_API_KEY'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${localCapabilities?.geminiConfigured ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1220] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">OpenAI GPT-4o</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">
                    {localCapabilities?.openaiConfigured ? 'Configured' : 'Not Set'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${localCapabilities?.openaiConfigured ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1220] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Stripe Payment Links</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">
                    {localCapabilities?.stripeConfigured ? 'Live API Ready' : 'Not Set'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${localCapabilities?.stripeConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1220] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Resend Email & GitHub</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">
                    Email: {localCapabilities?.emailConfigured ? 'On' : 'Off'} · Git: {localCapabilities?.githubConfigured ? 'On' : 'Local'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${localCapabilities?.emailConfigured || localCapabilities?.githubConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
              </div>
            </div>

            {localCapabilities?.pingResult && (
              <div className={`p-3 rounded-xl border text-[11px] ${
                localCapabilities.pingResult.ok
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-400/30 text-rose-200'
              }`}>
                {localCapabilities.pingResult.ok
                  ? `Live ping passed (${localCapabilities.pingResult.model}) in ${localCapabilities.pingResult.latencyMs}ms.`
                  : `Live ping failed: ${localCapabilities.pingResult.error}`}
              </div>
            )}

            {/* Export & Persistence Summary */}
            <div className="p-4 rounded-xl bg-[#0d1220] border border-pink-500/20 space-y-2">
              <div className="font-bold text-slate-100 flex items-center justify-between">
                <span>Server-Side Persistence & Archive Export</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">Active</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Workspace state persists server-side in <code className="text-pink-200">data/workspace.json</code>. Configure secrets safely via server environment variables; default recipient: <strong>{exportEmail}</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2 flex-wrap">
              <button
                onClick={() => {
                  setIsSetupModalOpen(false);
                  if (onSelectTab) {
                    onSelectTab('settings');
                  } else if (onOpenDashboard) {
                    onOpenDashboard();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Open Integration Settings
              </button>

              <button
                onClick={() => handleRefreshServerStatus(true)}
                disabled={isTestingConnection}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-300 hover:to-rose-300 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-pink-500/20 flex items-center gap-1.5"
              >
                {isTestingConnection && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isTestingConnection ? 'Pinging AI...' : 'Run Live AI Ping'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const KommandraWorkstation = CelesteWorkstation;
export type KommandraProps = CelesteProps;
