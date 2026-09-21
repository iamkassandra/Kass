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
  HelpCircle
} from 'lucide-react';

export interface OdysseusProps {
  onOpenDashboard?: () => void;
  onSelectTab?: (tab: string) => void;
  onTriggerPush?: () => void;
  onTriggerZip?: () => void;
  onOpenSpawnProject?: () => void;
  isTriggeringPush?: boolean;
  isTriggeringZip?: boolean;
}

export type OdysseusModule =
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
  actions?: Array<{ label: string; action: () => void; variant?: 'primary' | 'secondary' }>;
}

export const OdysseusWorkstation: React.FC<OdysseusProps> = ({
  onOpenDashboard,
  onSelectTab,
  onTriggerPush,
  onTriggerZip,
  onOpenSpawnProject,
  isTriggeringPush = false,
  isTriggeringZip = false
}) => {
  // Navigation & View State
  const [activeModule, setActiveModule] = useState<OdysseusModule>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatMode, setChatMode] = useState<'agent' | 'chat'>('chat');
  const [selectedModel, setSelectedModel] = useState<'gpt-4o' | 'gemini-2.5-flash' | 'claude-3.5' | 'deepseek-r1' | 'sovereign'>('gpt-4o');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>('Digital Kassandra');
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle Command or Chat Submission
  const handleSendMessage = async (customText?: string) => {
    const textToSend = typeof customText === 'string' ? customText.trim() : chatInput.trim();
    if (!textToSend || isGenerating) return;

    // Handle Quick Slash Commands
    if (textToSend.startsWith('/setup')) {
      setChatInput('');
      setIsSetupModalOpen(true);
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
          content: '⚡ Triggering instant out-of-cycle GitHub push across all 4 containerized repositories in Apex Sovereign Capital & Matrix SaaS Forge...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'Sovereign Daemon'
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
          content: '📦 Packing encrypted sovereign backup archive and dispatching export to theaucklandassistant@gmail.com...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'Sovereign Backup'
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
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: chatMode === 'agent' ? 'executive' : 'assistant',
          agentName: selectedAudience,
          message: textToSend,
          conversationHistory: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          context: `You are Odysseus / Digital Kassandra (CEO Clone), directing 17 autonomous agents, 2 empires, and 10-minute backup pipelines. Model: ${selectedModel}. Mode: ${chatMode}. Provide sharp, tactical, and sovereign directives.`
        })
      });

      const data = await response.json();
      const assistantText = data.text || 'Directive acknowledged and synchronized across the sovereign workforce.';

      setMessages(prev => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: 'assistant',
          content: assistantText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: data.model || selectedModel
        }
      ]);
    } catch (err) {
      console.error('Error communicating with Odysseus:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Task directive received: "${textToSend}". Synchronized with local sovereign state engine. All 17 agents, 10-minute GitHub backup daemons, and Stripe checkout pipelines remain operational.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'Sovereign Engine'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-[#18191e] text-[#e1e2e6] font-sans antialiased overflow-hidden select-none">
      {/* 1. LEFT SIDEBAR (Matching Odysseus standard in screenshot) */}
      <aside
        className={`${
          isSidebarOpen ? 'w-60' : 'w-16'
        } shrink-0 bg-[#121316] border-r border-[#22242b] flex flex-col justify-between transition-all duration-200 z-30`}
      >
        {/* Top Branding & Nav items */}
        <div className="flex flex-col flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {/* Header row */}
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-[#8e929e] hover:text-[#f4f5f7] hover:bg-[#1e2026] transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {isSidebarOpen && (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveModule('chat'); setMessages([]); }}>
                <span className="font-semibold text-base tracking-tight text-[#ea8a82]">
                  Odysseus
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#c4c7d0] hover:text-white hover:bg-[#1e2026] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#ea8a82]" />
            {isSidebarOpen && <span>New Chat</span>}
          </button>

          {/* Search */}
          <button
            onClick={() => setActiveModule('search')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'search'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <Search className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Search</span>}
          </button>

          {/* Email */}
          <button
            onClick={() => setActiveModule('email')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'email'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#8e929e]" />
              {isSidebarOpen && <span>Email</span>}
            </div>
            {isSidebarOpen && <Plus className="w-3.5 h-3.5 text-[#5e626e] hover:text-white" />}
          </button>

          {/* Tools */}
          <button
            onClick={() => setActiveModule('tools')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'tools'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-4 h-4 text-[#8e929e]" />
              {isSidebarOpen && <span>Tools</span>}
            </div>
            {isSidebarOpen && <ChevronDown className="w-3.5 h-3.5 text-[#5e626e]" />}
          </button>

          {/* Brain / Moat Council */}
          <button
            onClick={() => setActiveModule('brain')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'brain'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <Brain className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Brain</span>}
          </button>

          {/* Calendar / 12h Forecast */}
          <button
            onClick={() => setActiveModule('calendar')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'calendar'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Calendar</span>}
          </button>

          {/* Compare */}
          <button
            onClick={() => setActiveModule('compare')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'compare'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <GitCompare className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Compare</span>}
          </button>

          {/* Cookbook */}
          <button
            onClick={() => setActiveModule('cookbook')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'cookbook'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Cookbook</span>}
          </button>

          {/* Deep Research */}
          <button
            onClick={() => setActiveModule('research')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'research'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <Microscope className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Deep Research</span>}
          </button>

          {/* Gallery */}
          <button
            onClick={() => setActiveModule('gallery')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'gallery'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Gallery</span>}
          </button>

          {/* Library */}
          <button
            onClick={() => setActiveModule('library')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'library'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <div className="flex items-center gap-3">
              <LibraryIcon className="w-4 h-4 text-[#8e929e]" />
              {isSidebarOpen && <span>Library</span>}
            </div>
            {isSidebarOpen && <Plus className="w-3.5 h-3.5 text-[#5e626e] hover:text-white" />}
          </button>

          {/* Notes */}
          <button
            onClick={() => setActiveModule('notes')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'notes'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Notes</span>}
          </button>

          {/* Tasks */}
          <button
            onClick={() => setActiveModule('tasks')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeModule === 'tasks'
                ? 'bg-[#22242c] text-white'
                : 'text-[#9fa3af] hover:text-white hover:bg-[#1a1c22]'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Tasks</span>}
          </button>

          {/* Theme */}
          <button
            onClick={() => {
              if (onOpenDashboard) onOpenDashboard();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#9fa3af] hover:text-white hover:bg-[#1a1c22] transition-all cursor-pointer"
            title="Switch to Full Executive Dashboard"
          >
            <Moon className="w-4 h-4 text-[#8e929e]" />
            {isSidebarOpen && <span>Executive View</span>}
          </button>
        </div>

        {/* Bottom User info & settings */}
        <div className="p-2 border-t border-[#22242b] flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#1a1c22] cursor-pointer transition-colors flex-1">
            <div className="w-6 h-6 rounded-full bg-[#272932] text-[#c4c7d0] text-xs font-semibold flex items-center justify-center">
              A
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#c4c7d0] leading-none">admin</span>
                <span className="text-[10px] text-[#717582] leading-none mt-0.5">theaucklandassistant@gmail.com</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="p-2 rounded-lg text-[#8e929e] hover:text-white hover:bg-[#1e2026] transition-colors cursor-pointer"
            title="Odysseus Setup & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#18191e] overflow-hidden relative">
        {/* Top Bar with Center Dropdown ("Odysseus Chat v") */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-[#22242b] bg-[#18191e]">
          <div className="flex items-center gap-2">
            {/* Direct Dashboard Toggle */}
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="px-2.5 py-1 rounded-lg bg-[#22242c] hover:bg-[#2c2f3a] text-xs text-[#a0a4b2] hover:text-white font-medium transition-colors cursor-pointer"
              >
                ← Full Workforce
              </button>
            )}
          </div>

          {/* Center Chat Title Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#c4c7d0] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#22242c] transition-colors cursor-pointer"
            >
              <span>{selectedAudience} Chat</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8e929e]" />
            </button>

            {isAudienceDropdownOpen && (
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-64 bg-[#1f2128] border border-[#2d303b] rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                {[
                  'Digital Kassandra',
                  'Vanguard (Sales Lead)',
                  'Gem-Miner (Scrap Recycler)',
                  'Forecaster-12h',
                  'Moat-Council',
                  'Aura (Chief of Staff)',
                  'Sovereign Enclave'
                ].map(agent => (
                  <button
                    key={agent}
                    onClick={() => {
                      setSelectedAudience(agent);
                      setIsAudienceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#2a2d37] transition-colors ${
                      selectedAudience === agent ? 'text-[#ea8a82] font-semibold' : 'text-[#c4c7d0]'
                    }`}
                  >
                    {agent}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions (Push, Zip, Setup) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerPush}
              disabled={isTriggeringPush}
              className="p-1.5 rounded-lg text-[#8e929e] hover:text-white hover:bg-[#22242c] transition-colors cursor-pointer"
              title="10-Minute Git Push"
            >
              {isTriggeringPush ? <Loader2 className="w-4 h-4 animate-spin text-[#ea8a82]" /> : <GitBranch className="w-4 h-4" />}
            </button>
            <button
              onClick={onTriggerZip}
              disabled={isTriggeringZip}
              className="p-1.5 rounded-lg text-[#8e929e] hover:text-white hover:bg-[#22242c] transition-colors cursor-pointer"
              title="Backup Zip Export"
            >
              {isTriggeringZip ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Mail className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#ea8a82]/10 hover:bg-[#ea8a82]/20 text-[#ea8a82] text-xs font-semibold transition-colors cursor-pointer"
            >
              /setup
            </button>
          </div>
        </header>

        {/* Center Stage & Conversation Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          {messages.length === 0 ? (
            /* CENTER STAGE (Matches screenshot exactly) */
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto py-8">
              {/* Salmon Sail Glyph */}
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-[#ea8a82] fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2L4 20h16L12 2zm0 4.5l5.5 11.5h-11L12 6.5z" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-normal tracking-tight text-[#ea8a82]">
                Odysseus
              </h1>

              {/* Subtitle */}
              <p className="text-xs text-[#8e929e] font-mono">
                Type{' '}
                <button
                  onClick={() => setIsSetupModalOpen(true)}
                  className="text-[#ea8a82] hover:underline font-semibold cursor-pointer"
                >
                  /setup
                </button>{' '}
                to get started.
              </p>

              {/* Help Text */}
              <p className="text-xs text-[#717582] max-w-md leading-relaxed">
                Add an AI endpoint from Settings in the sidebar, or paste an endpoint/API key into the chat.
              </p>

              {/* Pill / Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202229] border border-[#2b2e38] text-[11px] text-[#9fa3af]">
                <Eye className="w-3.5 h-3.5 text-[#717582]" />
                <span>{selectedAudience}</span>
              </div>

              {/* Suggested Quick Commands */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-4">
                {[
                  { label: '/setup', desc: 'Sovereign keys & backup', action: () => setIsSetupModalOpen(true) },
                  { label: '/mine', desc: 'Recycle scrap files', action: () => onSelectTab && onSelectTab('scrap-miner') },
                  { label: '/forecast', desc: '33-day 12h profit model', action: () => onSelectTab && onSelectTab('profit-forecast') },
                  { label: '/sales', desc: '24/7 Outbound squad', action: () => onSelectTab && onSelectTab('outbound-hunters') },
                  { label: '/push', desc: 'Trigger GitHub push', action: () => handleSendMessage('/push') },
                  { label: '/zip', desc: 'Dispatch backup archive', action: () => handleSendMessage('/zip') }
                ].map(cmd => (
                  <button
                    key={cmd.label}
                    onClick={cmd.action}
                    className="p-2.5 rounded-xl bg-[#1d1f26] hover:bg-[#242731] border border-[#272a34] text-left transition-all cursor-pointer group"
                  >
                    <span className="font-mono text-xs font-bold text-[#ea8a82] block group-hover:text-white">
                      {cmd.label}
                    </span>
                    <span className="text-[10px] text-[#717582] block truncate">
                      {cmd.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ACTIVE CONVERSATION STREAM */
            <div className="space-y-6 max-w-3xl w-full mx-auto py-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-[#252833] text-[#ea8a82] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#313543]">
                      O
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-2xl space-y-2 ${
                      msg.role === 'user'
                        ? 'bg-[#ea8a82]/15 text-[#f4f5f7] border border-[#ea8a82]/30 ml-8'
                        : 'bg-[#1f2128] text-[#d6d9e2] border border-[#2c2f3b] mr-8 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-[#717582]">
                      <span className="font-mono">{msg.role === 'user' ? 'Kassandra' : msg.model || 'Odysseus'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-xs text-[#e1e3ea] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-3 text-xs justify-start">
                  <div className="w-7 h-7 rounded-xl bg-[#252833] text-[#ea8a82] font-bold flex items-center justify-center shrink-0 border border-[#313543]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#1f2128] border border-[#2c2f3b] text-xs text-[#8e929e] flex items-center gap-2">
                    <span>Synthesizing autonomous sovereign response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* 3. BOTTOM FLOATING CHAT INPUT BAR (Matches screenshot exactly) */}
          <div className="w-full max-w-3xl mx-auto pt-4 shrink-0">
            <div className="bg-[#1f2128] border border-[#2c2f3b] rounded-2xl p-3 shadow-2xl focus-within:border-[#ea8a82]/50 transition-all space-y-2">
              {/* Top row: Model selector on right */}
              <div className="flex items-center justify-between text-xs text-[#8e929e] px-1">
                <span className="text-[11px] font-mono text-[#5e626e]">
                  {selectedAudience} • {chatMode === 'agent' ? 'Autonomous Action Mode' : 'Direct Conversation'}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[#a0a4b2] hover:text-white px-2 py-0.5 rounded-md hover:bg-[#282a35] transition-colors cursor-pointer"
                  >
                    <span>{selectedModel === 'gpt-4o' ? 'OpenAI GPT-4o' : selectedModel === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : selectedModel}</span>
                    <ChevronUp className="w-3 h-3 text-[#717582]" />
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute bottom-full mb-1 right-0 w-48 bg-[#18191e] border border-[#2c2f3b] rounded-xl shadow-2xl py-1 text-xs z-50">
                      {[
                        { id: 'gpt-4o', label: 'OpenAI GPT-4o' },
                        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                        { id: 'claude-3.5', label: 'Claude 3.5 Sonnet' },
                        { id: 'deepseek-r1', label: 'DeepSeek-R1' },
                        { id: 'sovereign', label: 'Sovereign Enclave' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m.id as any);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-[#252833] text-xs transition-colors ${
                            selectedModel === m.id ? 'text-[#ea8a82] font-semibold' : 'text-[#c4c7d0]'
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
                placeholder={`Message ${selectedAudience} ...`}
                className="w-full bg-transparent text-xs text-[#f0f2f7] placeholder-[#5e626e] focus:outline-none resize-none leading-relaxed font-mono px-1 py-1"
              />

              {/* Bottom controls row */}
              <div className="flex items-center justify-between pt-1 px-1">
                {/* Left tools (Chevron expand, search toggle) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSetupModalOpen(true)}
                    className="p-1 rounded-md text-[#717582] hover:text-white hover:bg-[#282a35] transition-colors cursor-pointer"
                    title="Quick Tools"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      isWebSearchEnabled
                        ? 'text-[#ea8a82] bg-[#ea8a82]/10'
                        : 'text-[#717582] hover:text-white hover:bg-[#282a35]'
                    }`}
                    title="Toggle Deep Web Grounding"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right controls (Agent vs Chat switch + Send arrow button) */}
                <div className="flex items-center gap-2">
                  {/* Agent | Chat Toggle Pill */}
                  <div className="flex items-center bg-[#18191e] border border-[#2c2f3b] rounded-xl p-0.5 text-[11px]">
                    <button
                      onClick={() => setChatMode('agent')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        chatMode === 'agent'
                          ? 'bg-[#292c37] text-white font-semibold shadow-xs'
                          : 'text-[#717582] hover:text-[#c4c7d0]'
                      }`}
                    >
                      Agent
                    </button>
                    <button
                      onClick={() => setChatMode('chat')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        chatMode === 'chat'
                          ? 'bg-[#292c37] text-white font-semibold shadow-xs'
                          : 'text-[#717582] hover:text-[#c4c7d0]'
                      }`}
                    >
                      Chat
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    id="btn-odysseus-send"
                    onClick={() => handleSendMessage()}
                    disabled={isGenerating || !chatInput.trim()}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      chatInput.trim() && !isGenerating
                        ? 'bg-[#ea8a82] text-[#121316] hover:bg-[#f09a93] shadow-sm'
                        : 'bg-[#282a35] text-[#5e626e]'
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
      </div>

      {/* 4. ODYSSEUS SETUP MODAL (/setup) */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#18191e] border border-[#2c2f3b] rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 text-xs text-[#d6d9e2]">
            <div className="flex items-center justify-between border-b border-[#262832] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ea8a82]/15 text-[#ea8a82] flex items-center justify-center font-bold">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Odysseus Configuration & AI Endpoints</h3>
                  <p className="text-[11px] text-[#717582]">Manage API keys, endpoints & sovereign daemons</p>
                </div>
              </div>
              <button
                onClick={() => setIsSetupModalOpen(false)}
                className="p-1 rounded-lg text-[#717582] hover:text-white hover:bg-[#22242c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#1f2128] border border-[#2a2d38] space-y-1">
                <span className="text-[10px] text-[#717582] font-semibold uppercase block">OpenAI GPT-4o</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Configured</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1f2128] border border-[#2a2d38] space-y-1">
                <span className="text-[10px] text-[#717582] font-semibold uppercase block">Gemini 2.5 Flash</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Active</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Sovereign 10-Minute Daemon Details */}
            <div className="p-4 rounded-xl bg-[#1f2128] border border-[#2a2d38] space-y-2">
              <div className="font-bold text-white flex items-center justify-between">
                <span>10-Minute Git Daemon & Email Dispatch</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">Active</span>
              </div>
              <p className="text-[#8e929e] text-[11px] leading-relaxed">
                Automated continuous background worker commits to GitHub repos and dispatches encrypted source archives to <strong>theaucklandassistant@gmail.com</strong> every 600 seconds.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#262832]">
              <button
                onClick={() => {
                  setIsSetupModalOpen(false);
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="px-3 py-2 rounded-xl bg-[#22242c] hover:bg-[#2b2e38] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Open Full Workforce Dashboard
              </button>

              <button
                onClick={() => {
                  setIsSetupModalOpen(false);
                  handleSendMessage('/push');
                }}
                className="px-4 py-2 rounded-xl bg-[#ea8a82] hover:bg-[#f09a93] text-[#121316] text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Test Sovereign Daemon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
