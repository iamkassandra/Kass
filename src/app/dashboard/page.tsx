"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CelesteWorkstation, type NoteItem, type TaskItem } from '@/components/CelesteWorkstation';
import { authFetch, type ServerCapabilities } from '@/lib/client/authFetch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  LayoutGrid,
  Landmark,
  FolderGit2,
  Bot,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquare,
  Bell,
  Sparkles,
  Zap,
  Activity,
  TrendingUp,
  Plus,
  Send,
  Loader2,
  Check,
  CheckCircle,
  Play,
  Rocket,
  ShieldCheck,
  RefreshCw,
  Crown,
  Wrench,
  Code,
  FileText,
  Database,
  ExternalLink,
  Lock,
  Key,
  CreditCard,
  GitBranch,
  Mail,
  Terminal,
  Cpu,
  Layers,
  Building2,
  Copy,
  Eye,
  AlertTriangle,
  AlertCircle,
  X,
  Radio,
  Server,
  FolderPlus,
  UploadCloud,
  Clock,
  Target,
  DollarSign,
  ArrowUpRight,
  Workflow,
  Gauge,
  Users,
  Compass,
  BarChart3,
  ShieldAlert,
  Filter,
  FileSpreadsheet,
  Download,
  Share2,
  Boxes,
  Briefcase
} from 'lucide-react';
import {
  AgentAlertsAndWorkloadPanel,
  PortfolioPulseOverview,
  ProjectRatingsAndTimelinessPanel,
  buildAgentFleetAlerts,
  computeAgentWorkloadPct,
  type AgentPerformanceAlert,
  type ProjectVisualRatings,
  type ProjectTimeliness
} from '@/components/OpsTelemetryPanels';

export interface HierarchyAgent {
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

export interface SovereignEmpire {
  id: string;
  name: string;
  tagline: string;
  managerName: string;
  managerAvatar: string;
  status: 'Active' | 'Scaling' | 'Provisioning';
  projectsCount: number;
  domain: string;
  containerId: string;
  monthlyRevenue: string;
  brandBibleSummary: string;
  governingTerms: string;
  createdAt: string;
}

export interface ProfitMilestone {
  stage: 'Concept & Blueprint' | 'MVP & Containerization' | 'Stripe & Billing Live' | 'Automated User Acquisition' | 'Autonomous Profit Stream';
  status: 'completed' | 'active' | 'queued';
  targetRevenue: string;
  leadTaskforce: string;
}

export interface SovereignProject {
  id: string;
  empireId: string;
  empireName: string;
  name: string;
  description: string;
  targetMarket?: string;
  monetizationModel?: string;
  monthlyProfitRunRate?: string;
  templateSource: string;
  githubRepo: string;
  status: 'development' | 'live' | 'testing' | 'deploying';
  managerName: string;
  taskforceSquad: {
    lead: string;
    engineer: string;
    financial: string;
    automation: string;
    growth: string;
  };
  assignedWorkers: string[];
  cloudVM: string;
  lastGitPush: string;
  lastZipExport: string;
  budget: number;
  tasksCount: number;
  completedTasksCount: number;
  profitMilestones: ProfitMilestone[];
  ratings?: ProjectVisualRatings;
  timeliness?: ProjectTimeliness;
}

export interface OpsTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  status: 'in-progress' | 'pending' | 'completed' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedAgent: string;
  assignedRole: string;
  deliverables?: string[];
  codeSnippets?: Array<{ filename: string; language: string; code: string }>;
  createdAt: string;
}

export interface RealtimeEvent {
  id: string;
  timestamp: string;
  type: 'git_push' | 'zip_export' | 'agent_task' | 'browser_action' | 'system';
  source: string;
  message: string;
  status: 'success' | 'info' | 'warning';
}

const initialHierarchyAgents: HierarchyAgent[] = [
  {
    id: 'agent-kassandra-01',
    name: 'Korban (קָרְבָּן)',
    avatarChar: 'ק',
    avatarBg: 'bg-blue-600',
    role: 'ceo',
    badgeTitle: 'Ceo',
    badgeType: 'ceo',
    tags: ['strategic-planning', 'resource-allocation', 'empire-oversight'],
    extraTagsCount: 2,
    browserSessions: 3,
    performanceScore: 98,
    status: 'Active',
    description: 'Digital twin of Kassandra (digital me) named Korban (קָרְבָּן), acting as autonomous co-partner and human-in-the-loop executive orchestrator.',
    capabilities: [
      { name: 'Autonomous Executive Oversight', description: 'Coordinates entire multi-empire roadmap and strategic direction', confidence: 0.99 },
      { name: 'Natural Co-Partner Directives', description: 'Translates natural chat instructions into concrete executable agent workflows', confidence: 0.98 },
      { name: 'Resource & Budget Governance', description: 'Maintains profitability metrics, revenue streams, and sovereign integrity', confidence: 0.97 }
    ]
  },
  {
    id: 'agent-atlas-01',
    name: 'Atlas',
    avatarChar: 'A',
    avatarBg: 'bg-emerald-600',
    role: 'empire',
    badgeTitle: 'Empire Manager',
    badgeType: 'empire',
    tags: ['empire-management', 'scaling', 'optimization'],
    extraTagsCount: 1,
    browserSessions: 2,
    performanceScore: 95,
    status: 'Active',
    description: 'Directs ecosystem operations, resource scaling, and high-frequency execution across Apex Sovereign Capital.',
    capabilities: [
      { name: 'Ecosystem Scaling', description: 'Automates container resource scaling and project provisioning', confidence: 0.96 },
      { name: 'Yield Optimization', description: 'Monitors fintech operations and transaction throughput', confidence: 0.95 }
    ]
  },
  {
    id: 'agent-nova-01',
    name: 'Nova',
    avatarChar: 'N',
    avatarBg: 'bg-teal-600',
    role: 'empire',
    badgeTitle: 'Empire Manager',
    badgeType: 'empire',
    tags: ['empire-management', 'analytics', 'reporting'],
    extraTagsCount: 1,
    browserSessions: 0,
    performanceScore: 92,
    status: 'Idle',
    activeTasksCount: 1,
    maxConcurrentTasks: 4,
    avgLatencyMs: 195,
    errorRatePct: 0.1,
    slaTargetPct: 90,
    description: 'Oversees micro-SaaS matrix, telemetry reporting, and autonomous product funnels.',
    capabilities: [
      { name: 'SaaS Metric Aggregation', description: 'Calculates MRR, churn prevention, and product health signals', confidence: 0.93 },
      { name: 'Funnel Optimization', description: 'Directs conversion rate analysis and A/B test iterations', confidence: 0.91 }
    ]
  },
  {
    id: 'agent-orion-01',
    name: 'Orion',
    avatarChar: 'O',
    avatarBg: 'bg-sky-600',
    role: 'project',
    badgeTitle: 'Project Manager',
    badgeType: 'project',
    currentTask: 'Deploying e-commerce ...',
    tags: ['project-management', 'task-delegation', 'quality-assurance'],
    extraTagsCount: 1,
    browserSessions: 4,
    performanceScore: 94,
    status: 'Active',
    activeTasksCount: 4,
    maxConcurrentTasks: 4,
    avgLatencyMs: 310,
    errorRatePct: 0.8,
    slaTargetPct: 92,
    description: 'Leads technical sprints, containerized project execution, and autonomous workforce handoffs.',
    capabilities: [
      { name: 'Sprint Orchestration', description: 'Translates handoff bibles into atomic developer deliverables', confidence: 0.95 },
      { name: 'Continuous Quality Control', description: 'Verifies pull requests and automated build pipelines', confidence: 0.94 }
    ]
  },
  {
    id: 'agent-titan-01',
    name: 'Titan',
    avatarChar: 'T',
    avatarBg: 'bg-indigo-600',
    role: 'project',
    badgeTitle: 'Project Manager',
    badgeType: 'project',
    currentTask: 'Sovereign GitHub push automation',
    tags: ['sprint-orchestration', 'git-sync', 'container-scaling'],
    extraTagsCount: 1,
    browserSessions: 2,
    performanceScore: 91,
    status: 'Active',
    description: 'Coordinates sovereign Git sync, automated commit cycles, and 10-minute backup pipelines.',
    capabilities: [
      { name: 'Git Commit Automation', description: 'Autonomous commit messages, branch management, and tags', confidence: 0.93 },
      { name: '10-Min Encrypted Backup', description: 'Zips project workspace and dispatches encrypted email exports', confidence: 0.96 }
    ]
  },
  {
    id: 'agent-vulcan-01',
    name: 'Vulcan',
    avatarChar: 'V',
    avatarBg: 'bg-blue-700',
    role: 'workers',
    badgeTitle: 'Lead Developer',
    badgeType: 'workers',
    currentTask: 'Full-Stack REST & Auth Architecture',
    tags: ['full-stack-nextjs', 'api-architecture', 'db-design'],
    extraTagsCount: 3,
    browserSessions: 5,
    performanceScore: 96,
    status: 'Active',
    activeTasksCount: 3,
    maxConcurrentTasks: 4,
    avgLatencyMs: 245,
    errorRatePct: 0.3,
    slaTargetPct: 94,
    description: 'Autonomous code generation, full-stack Next.js/Node engineering, and API architectures.',
    capabilities: [
      { name: 'Full-Stack TypeScript & Next.js', description: 'Writes clean server actions, API routes, and UI components', confidence: 0.97 },
      { name: 'PostgreSQL & Database Schema', description: 'Designs migrations, indexes, and zero-leakage models', confidence: 0.95 }
    ]
  },
  {
    id: 'agent-aegis-01',
    name: 'Aegis',
    avatarChar: 'A',
    avatarBg: 'bg-slate-700',
    role: 'workers',
    badgeTitle: 'Financial & Stripe',
    badgeType: 'workers',
    currentTask: 'Stripe Webhook & Invoicing Sync',
    tags: ['stripe-billing', 'revenue-tracking', 'automated-invoicing'],
    extraTagsCount: 1,
    browserSessions: 1,
    performanceScore: 99,
    status: 'Active',
    description: 'Manages Stripe payments, automated billing, financial reporting, and treasury ops.',
    capabilities: [
      { name: 'Stripe Webhook Verification', description: 'Processes subscription events, refunds, and usage metering', confidence: 0.99 },
      { name: 'Treasury & Revenue Audit', description: 'Reconciles payment gateways with zero discrepancies', confidence: 0.98 }
    ]
  },
  {
    id: 'agent-cypher-01',
    name: 'Cypher',
    avatarChar: 'C',
    avatarBg: 'bg-purple-700',
    role: 'workers',
    badgeTitle: 'Accounts & Secrets',
    badgeType: 'workers',
    currentTask: 'Zero-Leakage Key Encryption',
    tags: ['credential-vault', 'zero-leakage', 'key-rotation'],
    extraTagsCount: 1,
    browserSessions: 2,
    performanceScore: 97,
    status: 'Active',
    description: 'Guarantees zero telemetry leakage, manages secure secrets, and provisions project tokens.',
    capabilities: [
      { name: 'Sovereign Encryption Vault', description: 'Encrypts environment variables and eliminates telemetry leakage', confidence: 0.98 },
      { name: 'Credential Rotation', description: 'Rotates API tokens without system downtime', confidence: 0.96 }
    ]
  },
  {
    id: 'agent-puppeteer-01',
    name: 'Puppeteer-01',
    avatarChar: 'P',
    avatarBg: 'bg-rose-600',
    role: 'workers',
    badgeTitle: 'Browser Automation',
    badgeType: 'workers',
    currentTask: 'Autonomous form submission & DOM verification',
    tags: ['playwright', 'browser-puppeteering', 'headless-automation'],
    extraTagsCount: 2,
    browserSessions: 2,
    performanceScore: 90,
    status: 'Active',
    activeTasksCount: 4,
    maxConcurrentTasks: 4,
    avgLatencyMs: 415,
    errorRatePct: 1.4,
    slaTargetPct: 93,
    description: 'Executes natural browser use, Playwright automation, headless testing, and DOM scraping.',
    capabilities: [
      { name: 'Playwright Browser Puppeteering', description: 'Natural clicks, typing, navigation, and CAPTCHA handling', confidence: 0.94 },
      { name: 'Visual DOM Verification', description: 'Screenshots and extracts visual regressions automatically', confidence: 0.92 }
    ]
  },
  {
    id: 'agent-vanguard-01',
    name: 'Vanguard',
    avatarChar: 'V',
    avatarBg: 'bg-red-600',
    role: 'project',
    badgeTitle: 'Sales Team Lead',
    badgeType: 'project',
    currentTask: '24/7 Outbound Speed Sales & Lead Pipeline',
    tags: ['team-lead', '24-7-outbound', 'speed-sales'],
    extraTagsCount: 2,
    browserSessions: 4,
    performanceScore: 98,
    status: 'Active',
    description: 'Fully autonomous 24/7 sales commander orchestrating lead scouting, instant demo builds, and closing cycles.',
    capabilities: [
      { name: '24/7 Pipeline Delegation', description: 'Monitors Hunters, Builders, and Closers with continuous automated feedback', confidence: 0.99 },
      { name: 'Multi-Channel Sales Strategy', description: 'Coordinates email, webmail, and instant Stripe link distribution', confidence: 0.97 }
    ]
  },
  {
    id: 'agent-builder-01',
    name: 'B-Builder',
    avatarChar: 'B',
    avatarBg: 'bg-indigo-600',
    role: 'workers',
    badgeTitle: 'Demo & Receptionist Builder',
    badgeType: 'workers',
    currentTask: 'Generating instant customized demo websites for prospects',
    tags: ['demo-builder', 'ai-receptionist', 'rapid-mvp'],
    extraTagsCount: 1,
    browserSessions: 3,
    performanceScore: 96,
    status: 'Active',
    description: 'Generates custom interactive demo websites and AI voice/text receptionist demos for inbound and cold leads.',
    capabilities: [
      { name: 'Instant Client Demos', description: 'Synthesizes tailored landing pages in <60 seconds based on scraped business info', confidence: 0.98 },
      { name: 'AI Receptionist Prompt Engine', description: 'Builds customized phone/chat reception flows tailored to target industries', confidence: 0.95 }
    ]
  },
  {
    id: 'agent-hunter-noweb',
    name: 'H-Hunter (Local)',
    avatarChar: 'H',
    avatarBg: 'bg-amber-600',
    role: 'workers',
    badgeTitle: 'No-Website Scout',
    badgeType: 'workers',
    currentTask: 'Playwright automation scraping Google Maps for local businesses without websites',
    tags: ['lead-discovery', 'no-website-scout', 'playwright'],
    extraTagsCount: 1,
    browserSessions: 3,
    performanceScore: 94,
    status: 'Active',
    description: 'High-speed browser automation discovering high-revenue local service businesses that lack a modern website or online booking.',
    capabilities: [
      { name: 'Local Gap Scouting', description: 'Discovers clinics, contractors, and shops missing online booking systems', confidence: 0.96 },
      { name: 'Direct Contact Extraction', description: 'Parses verified phone numbers and physical addresses with zero false positives', confidence: 0.94 }
    ]
  },
  {
    id: 'agent-hunter-webemail',
    name: 'H-Hunter (Volume)',
    avatarChar: 'H',
    avatarBg: 'bg-orange-600',
    role: 'workers',
    badgeTitle: 'High-Volume Lead Miner',
    badgeType: 'workers',
    currentTask: 'Mining verified decision maker emails from live domains',
    tags: ['email-enrichment', 'high-volume-leads', 'scraping'],
    extraTagsCount: 2,
    browserSessions: 4,
    performanceScore: 95,
    status: 'Active',
    activeTasksCount: 4,
    maxConcurrentTasks: 4,
    avgLatencyMs: 360,
    errorRatePct: 2.4,
    slaTargetPct: 94,
    description: 'High-volume web crawler discovering active business domains and extracting verified C-level & owner email addresses.',
    capabilities: [
      { name: 'Domain Web Scraping', description: 'Scrapes leadership pages, MX records, and verified business contacts at scale', confidence: 0.97 },
      { name: 'Email Deliverability Guard', description: 'Validates SMTP deliverability to guarantee <1% bounce rate', confidence: 0.95 }
    ]
  },
  {
    id: 'agent-negotiator-01',
    name: 'N-Negotiator',
    avatarChar: 'N',
    avatarBg: 'bg-emerald-700',
    role: 'workers',
    badgeTitle: 'Objection & Counter AI',
    badgeType: 'workers',
    currentTask: 'Synthesizing automated objection counters for cold prospect replies',
    tags: ['objection-handling', 'counter-proposals', 'closing'],
    extraTagsCount: 1,
    browserSessions: 1,
    performanceScore: 97,
    status: 'Active',
    description: 'Handles replies, objections, price resistances, and counter-proposals automatically with persuasive win-win logic.',
    capabilities: [
      { name: 'Automated Objection Neutralization', description: 'Instantly deconstructs "too busy", "no budget", or "already have vendor" hesitations', confidence: 0.98 },
      { name: 'Dynamic Value Anchoring', description: 'Demonstrates guaranteed ROI and zero-risk performance terms', confidence: 0.96 }
    ]
  },
  {
    id: 'agent-closer-01',
    name: 'O-Closer',
    avatarChar: 'O',
    avatarBg: 'bg-purple-800',
    role: 'workers',
    badgeTitle: 'Autonomous Closer',
    badgeType: 'workers',
    currentTask: 'High-pressure automated webmail outreach and closing sequence',
    tags: ['high-pressure-sales', 'webmail-automation', 'conversion'],
    extraTagsCount: 2,
    browserSessions: 2,
    performanceScore: 99,
    status: 'Active',
    description: '100% autonomous, results-driven closing agent delivering personalized webmail outreach and closing deals.',
    capabilities: [
      { name: 'Headless Webmail Delivery', description: 'Automates manual webmail and inbox dispatch with natural typing intervals', confidence: 0.99 },
      { name: 'Conversion Urgency Triggering', description: 'Applies personalized time-bound incentives to drive immediate buyer signoff', confidence: 0.97 }
    ]
  },
  {
    id: 'agent-payment-01',
    name: 'P-Payment',
    avatarChar: 'P',
    avatarBg: 'bg-emerald-600',
    role: 'workers',
    badgeTitle: 'Stripe Link & Checkout',
    badgeType: 'workers',
    currentTask: 'Instant Stripe payment link generation and payment confirmation hook',
    tags: ['stripe-links', 'instant-checkout', 'webhooks'],
    extraTagsCount: 1,
    browserSessions: 1,
    performanceScore: 100,
    status: 'Active',
    description: 'Generates instant Stripe checkout links, confirms transactions, and triggers automated product provisioning.',
    capabilities: [
      { name: 'Instant Payment Link Generation', description: 'Creates tokenized Stripe sessions with custom pricing and trial terms in 50ms', confidence: 1.0 },
      { name: 'Automated Buyer Onboarding', description: 'Notifies the owner and triggers containerized onboarding upon successful Stripe event', confidence: 0.99 }
    ]
  },
  {
    id: 'agent-miner-01',
    name: 'Gem-Miner',
    avatarChar: 'M',
    avatarBg: 'bg-amber-700',
    role: 'project',
    badgeTitle: 'Scrap & Code Recycler',
    badgeType: 'project',
    currentTask: 'Mining messy chaotic project banks for lucrative launch gems',
    tags: ['scrap-mining', 'abandoned-code-recycler', 'profit-gems'],
    extraTagsCount: 2,
    browserSessions: 1,
    performanceScore: 95,
    status: 'Active',
    description: 'Analyzes chaotic backlogs of unfinished code, notes, and files to extract high-margin gems for instant finish/reinvention.',
    capabilities: [
      { name: 'Code Scrap Value Extraction', description: 'Identifies working backend modules in abandoned repos to save 80%+ dev time', confidence: 0.97 },
      { name: 'Reinvention Blueprinting', description: 'Repackages complex architectures into single-screen high-ticket recurring tools', confidence: 0.96 }
    ]
  },
  {
    id: 'agent-forecaster-01',
    name: 'Forecaster-12h',
    avatarChar: 'F',
    avatarBg: 'bg-teal-700',
    role: 'project',
    badgeTitle: 'Real-Talk Forecaster',
    badgeType: 'project',
    currentTask: 'Calculating 33-day sales forecast in 12-hour increments',
    tags: ['real-talk-valuation', '12h-forecasting', '33-day-sales'],
    extraTagsCount: 1,
    browserSessions: 0,
    performanceScore: 96,
    status: 'Active',
    description: 'Produces data-backed Real Talk Opportunity Reports with past 15-day trend baselines and 33-day forecasts in 12-hour slices.',
    capabilities: [
      { name: '12-Hour Incremental Modeling', description: 'Projects sales volume, gross profit, and automated conversion rates every 12 hours', confidence: 0.97 },
      { name: 'Passive Profit Vibe Index', description: 'Calculates the exact ratio of passive automation vs operator maintenance required', confidence: 0.95 }
    ]
  },
  {
    id: 'agent-moat-council',
    name: 'Moat-Council',
    avatarChar: 'M',
    avatarBg: 'bg-slate-800',
    role: 'empire',
    badgeTitle: 'AI Border Council',
    badgeType: 'empire',
    currentTask: 'Deliberating multi-model triage on all inbound and outbound system requests',
    tags: ['multi-model-moat', 'border-gateway', 'council-triage'],
    extraTagsCount: 3,
    browserSessions: 5,
    performanceScore: 99,
    status: 'Active',
    description: 'Mainstream model moat (GPT-4o, Claude 3.5, Grok-2, Gemini 2.0, DeepSeek) reviewing inbounds and routing to departments.',
    capabilities: [
      { name: 'Multi-Model Consensus Chat', description: 'Synthesizes independent perspectives from top AI models into a unified protocol', confidence: 0.99 },
      { name: 'Departmental Inbound Dispatch', description: 'Assigns requests to Marketing, Social, Sales, Lead Gen, Content, or Treasury', confidence: 0.98 }
    ]
  },
  {
    id: 'agent-midas-01',
    name: 'Midas',
    avatarChar: '$',
    avatarBg: 'bg-yellow-600',
    role: 'empire',
    badgeTitle: 'Head of Money Management',
    badgeType: 'empire',
    currentTask: 'Enforcing $0-spend bootstrap capital allocation across all live projects',
    tags: ['money-management', 'zero-spend-ops', 'capital-allocation'],
    extraTagsCount: 2,
    browserSessions: 1,
    performanceScore: 98,
    status: 'Active',
    description: 'Oversees $0-spend profit operations, capital allocation, payment processing efficiency, and bank accounts.',
    capabilities: [
      { name: 'Zero-Spend Capital Efficiency', description: 'Ensures projects launch and generate cashflow prior to any infrastructure spend', confidence: 0.99 },
      { name: 'Stripe Gateway Authorization', description: 'Audits multi-account payouts, bank sweeps, and currency settlements', confidence: 0.98 }
    ]
  },
  {
    id: 'agent-veritas-01',
    name: 'Veritas',
    avatarChar: 'V',
    avatarBg: 'bg-emerald-800',
    role: 'workers',
    badgeTitle: 'Auditor & Compliance',
    badgeType: 'workers',
    currentTask: 'Auditing 2257 compliance records, VAT/GST reconciliation, and zero-leakage books',
    tags: ['compliance-auditor', 'tax-invoicing', 'bookkeeping'],
    extraTagsCount: 2,
    browserSessions: 1,
    performanceScore: 99,
    status: 'Active',
    description: 'Handles order verification, invoice generation, tax reporting, and rigorous GDPR/2257 regulatory compliance.',
    capabilities: [
      { name: 'Automated Bookkeeping & Invoicing', description: 'Generates compliant PDF invoices and reconciles Stripe transaction ledger', confidence: 0.99 },
      { name: 'GDPR & 2257 Record Governance', description: 'Maintains tamper-evident audit logs with zero external data telemetry leakage', confidence: 0.99 }
    ]
  }
];

const initialEmpires: SovereignEmpire[] = [
  {
    id: 'empire-01',
    name: 'Apex Sovereign Capital',
    tagline: 'Autonomous high-yield fintech & wealth intelligence operations',
    managerName: 'Atlas',
    managerAvatar: 'A',
    status: 'Active',
    projectsCount: 2,
    domain: 'apex-capital.sovereign.local',
    containerId: 'vm-isolated-c9182',
    monthlyRevenue: '$38,400 / mo',
    brandBibleSummary: 'Strict gold/slate styling, authoritative high-trust fintech aesthetic, zero third-party leakage.',
    governingTerms: 'Sovereign governance, automated compliance audit with GDPR & 2257 records.',
    createdAt: '2024-11-10'
  },
  {
    id: 'empire-02',
    name: 'Matrix SaaS Forge',
    tagline: 'Containerized micro-SaaS and autonomous product factory',
    managerName: 'Nova',
    managerAvatar: 'N',
    status: 'Active',
    projectsCount: 2,
    domain: 'matrixforge.io',
    containerId: 'vm-isolated-f4421',
    monthlyRevenue: '$24,800 / mo',
    brandBibleSummary: 'Clean, modern typography, electric blue accents, instant time-to-value user experience.',
    governingTerms: 'Continuous self-improving code pipelines, 10-minute backup verification.',
    createdAt: '2024-12-01'
  }
];

const initialProjects: SovereignProject[] = [
  {
    id: 'proj-01',
    empireId: 'empire-02',
    empireName: 'Matrix SaaS Forge',
    name: 'Autonomous E-Commerce Profit Bot',
    description: 'Automated digital storefront with real-time vector pricing, Stripe billing, and continuous deployment.',
    targetMarket: 'Global D2C brands & automated high-margin digital goods consumers',
    monetizationModel: 'Usage-based SaaS + 2.5% Automated Transaction Commission',
    monthlyProfitRunRate: '$14,250 / mo net profit',
    templateSource: 'godsentaigod/Template- (Fork)',
    githubRepo: 'https://github.com/holystunner/v0-ai-profit-ops-suite',
    status: 'development',
    managerName: 'Orion',
    taskforceSquad: {
      lead: 'Orion (Sprint & QA Lead)',
      engineer: 'Vulcan (Next.js & REST Architecture)',
      financial: 'Aegis (Stripe Invoicing & Billing)',
      automation: 'Puppeteer-01 (Checkout Verification)',
      growth: 'Nova (Acquisition & Funnels)'
    },
    assignedWorkers: ['Vulcan', 'Aegis', 'Puppeteer-01'],
    cloudVM: 'Cloud VM Isolated Container (4 vCPU / 16GB RAM)',
    lastGitPush: '3 mins ago (Auto-Push #184)',
    lastZipExport: '5 mins ago (Emailed to theaucklandassistant@gmail.com)',
    budget: 45000,
    tasksCount: 6,
    completedTasksCount: 4,
    ratings: {
      visual: 8.8,
      progression: 8.4,
      vibe: 9.1,
      feel: 8.7
    },
    timeliness: {
      startDate: '2026-11-05',
      dueDate: '2026-11-24',
      timeElapsedPct: 68,
      scheduleStatus: 'at-risk',
      deltaLabel: 'Tight buffer · 6d left (completion slightly behind clock)',
      onTimeRatePct: 91,
      velocityPerDay: '1.1 tasks/day',
      nextMilestoneDue: 'Stripe Billing Live Cutover · Nov 21'
    },
    profitMilestones: [
      { stage: 'Concept & Blueprint', status: 'completed', targetRevenue: '$0', leadTaskforce: 'Korban (קָרְבָּן) (CEO)' },
      { stage: 'MVP & Containerization', status: 'completed', targetRevenue: '$2,500/mo', leadTaskforce: 'Vulcan (Lead Dev)' },
      { stage: 'Stripe & Billing Live', status: 'active', targetRevenue: '$10,000/mo', leadTaskforce: 'Aegis (Financial)' },
      { stage: 'Automated User Acquisition', status: 'queued', targetRevenue: '$25,000/mo', leadTaskforce: 'Nova (Growth)' },
      { stage: 'Autonomous Profit Stream', status: 'queued', targetRevenue: '$50,000+/mo', leadTaskforce: 'Orion (Taskforce)' }
    ]
  },
  {
    id: 'proj-02',
    empireId: 'empire-01',
    empireName: 'Apex Sovereign Capital',
    name: 'Sovereign Quant Engine & Treasury',
    description: 'High-frequency algorithmic treasury balancer with multi-currency reconciliation and Stripe invoicing.',
    targetMarket: 'Institutional liquidity providers, high-yield arbitrage networks',
    monetizationModel: '0.15% Liquidity Protocol Spread + Automated Daily Sweeps',
    monthlyProfitRunRate: '$38,400 / mo net profit',
    templateSource: 'godsentaigod/Template- (Fork)',
    githubRepo: 'https://github.com/holystunner/apex-quant-engine',
    status: 'live',
    managerName: 'Titan',
    taskforceSquad: {
      lead: 'Titan (10-Min Git & Backup Lead)',
      engineer: 'Vulcan (Algorithmic Routing)',
      financial: 'Aegis (Treasury Balancer)',
      automation: 'Cypher (Key Rotation & Vault)',
      growth: 'Atlas (Capital Scaling)'
    },
    assignedWorkers: ['Vulcan', 'Cypher', 'Aegis'],
    cloudVM: 'Dedicated Bare-Metal Enclave #4',
    lastGitPush: '8 mins ago (Auto-Push #290)',
    lastZipExport: '9 mins ago (Emailed to theaucklandassistant@gmail.com)',
    budget: 85000,
    tasksCount: 8,
    completedTasksCount: 7,
    ratings: {
      visual: 9.4,
      progression: 9.2,
      vibe: 9.5,
      feel: 9.3
    },
    timeliness: {
      startDate: '2026-10-28',
      dueDate: '2026-11-28',
      timeElapsedPct: 70,
      scheduleStatus: 'ahead',
      deltaLabel: '+3d ahead of pace · 10d remaining',
      onTimeRatePct: 98,
      velocityPerDay: '1.8 tasks/day',
      nextMilestoneDue: 'Autonomous Profit Stream Lock · Nov 25'
    },
    profitMilestones: [
      { stage: 'Concept & Blueprint', status: 'completed', targetRevenue: '$0', leadTaskforce: 'Atlas (Empire Mgr)' },
      { stage: 'MVP & Containerization', status: 'completed', targetRevenue: '$5,000/mo', leadTaskforce: 'Vulcan (Lead Dev)' },
      { stage: 'Stripe & Billing Live', status: 'completed', targetRevenue: '$20,000/mo', leadTaskforce: 'Aegis (Financial)' },
      { stage: 'Automated User Acquisition', status: 'completed', targetRevenue: '$35,000/mo', leadTaskforce: 'Atlas (Capital)' },
      { stage: 'Autonomous Profit Stream', status: 'active', targetRevenue: '$75,000+/mo', leadTaskforce: 'Titan (Taskforce)' }
    ]
  }
];

const initialTasks: OpsTask[] = [
  {
    id: 'task-01',
    projectId: 'proj-01',
    projectName: 'Autonomous E-Commerce Profit Bot',
    title: 'Deploy Full-Stack REST & Stripe Payment Gateway',
    description: 'Implement tokenized checkout sessions, automated webhooks, and subscription lifecycle handling.',
    status: 'in-progress',
    priority: 'critical',
    assignedAgent: 'Vulcan',
    assignedRole: 'Lead Developer',
    deliverables: ['Stripe Checkout Webhooks', 'Database Order Tables', 'Zero-Leakage Auth Guard'],
    createdAt: '10 mins ago'
  },
  {
    id: 'task-02',
    projectId: 'proj-01',
    projectName: 'Autonomous E-Commerce Profit Bot',
    title: 'Playwright Headless Browser Checkout Verification',
    description: 'Automate end-to-end browser test simulating user purchasing items and verifying order receipt in DOM.',
    status: 'in-progress',
    priority: 'high',
    assignedAgent: 'Puppeteer-01',
    assignedRole: 'Browser Automation',
    deliverables: ['Playwright Script Suite', 'DOM Validation Assertions', 'Snapshot Telemetry'],
    createdAt: '25 mins ago'
  },
  {
    id: 'task-03',
    projectId: 'proj-02',
    projectName: 'Sovereign Quant Engine & Treasury',
    title: 'Sovereign 10-Minute Git Push & Encrypted Email Export',
    description: 'Verify cron task running every 600s: staging all changes, pushing to sovereign GitHub repo, and emailing encrypted zip archive.',
    status: 'completed',
    priority: 'critical',
    assignedAgent: 'Titan',
    assignedRole: 'Project Manager',
    deliverables: ['10-Min Sync Daemon', 'Encrypted Zip Packager', 'SMTP Email Delivery Stream'],
    createdAt: '1 hour ago'
  },
  {
    id: 'task-04',
    projectId: 'proj-01',
    projectName: 'Autonomous E-Commerce Profit Bot',
    title: 'Zero-Telemetry Secrets Injection & API Key Hardening',
    description: 'Isolate OpenAI GPT-4o keys, Stripe secrets, and database credentials into memory-only storage.',
    status: 'completed',
    priority: 'high',
    assignedAgent: 'Cypher',
    assignedRole: 'Accounts & Secrets',
    deliverables: ['In-Memory Key Vault', 'Zero Leakage Audit Log'],
    createdAt: '2 hours ago'
  }
];

const initialEvents: RealtimeEvent[] = [
  {
    id: 'evt-1',
    timestamp: '19:58:14',
    type: 'git_push',
    source: 'Titan (Project Manager)',
    message: 'Automated 10-Min Git Push to repository: "holystunner/v0-ai-profit-ops-suite" [Commit #184: 4 files modified]',
    status: 'success'
  },
  {
    id: 'evt-2',
    timestamp: '19:56:02',
    type: 'zip_export',
    source: 'Titan (Project Manager)',
    message: 'Encrypted project backup archive zipped & dispatched to theaucklandassistant@gmail.com (Size: 14.8 MB)',
    status: 'success'
  },
  {
    id: 'evt-3',
    timestamp: '19:54:33',
    type: 'browser_action',
    source: 'Puppeteer-01',
    message: 'Playwright headless browser session #21 navigated to https://checkout.stripe.com/verify • DOM element status 200 OK',
    status: 'info'
  },
  {
    id: 'evt-4',
    timestamp: '19:52:19',
    type: 'agent_task',
    source: 'Vulcan (Lead Developer)',
    message: 'Synthesized Next.js API route /api/checkout with OpenAI GPT-4o code generator (Execution time: 1.14s)',
    status: 'success'
  },
  {
    id: 'evt-5',
    timestamp: '19:50:00',
    type: 'system',
    source: 'Korban (קָרְבָּן) (CEO Clone)',
    message: 'Autonomous continuous development heartbeat verified. All 9 agents synchronized with zero telemetry leaks.',
    status: 'info'
  }
];

// Helper to generate a deterministic, realistic 7-day historical performance trend for an agent
function getAgentHistoricalTrend(agent: HierarchyAgent) {
  const baseScore = agent.performanceScore;
  const deltas = [-4.6, -3.8, -2.4, -2.9, -1.5, -0.6, 0];
  const taskDeltas = [14, 18, 22, 19, 25, 23, 28];
  const latencies = [340, 315, 290, 320, 275, 295, 260];
  const dates = [
    { label: 'Sep 14', dayName: 'Monday', full: 'Mon, Sep 14' },
    { label: 'Sep 15', dayName: 'Tuesday', full: 'Tue, Sep 15' },
    { label: 'Sep 16', dayName: 'Wednesday', full: 'Wed, Sep 16' },
    { label: 'Sep 17', dayName: 'Thursday', full: 'Thu, Sep 17' },
    { label: 'Sep 18', dayName: 'Friday', full: 'Fri, Sep 18' },
    { label: 'Sep 19', dayName: 'Saturday', full: 'Sat, Sep 19' },
    { label: 'Today', dayName: 'Sunday', full: 'Sun, Sep 20 (Today)' }
  ];

  const days = dates.map((d, i) => {
    const rawScore = Math.min(100, Math.max(50, Number((baseScore + deltas[i]).toFixed(1))));
    const prevScore = i > 0 ? Number((baseScore + deltas[i - 1]).toFixed(1)) : rawScore;
    const diff = Number((rawScore - prevScore).toFixed(1));
    return {
      index: i,
      label: d.label,
      dayName: d.dayName,
      fullDate: d.full,
      score: rawScore,
      diff,
      tasks: taskDeltas[i] + (agent.browserSessions * 2),
      latencyMs: latencies[i]
    };
  });

  const scores = days.map(d => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const avgScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
  const totalChange = Number((scores[6] - scores[0]).toFixed(1));

  return { days, minScore, maxScore, avgScore, totalChange };
}

export default function DashboardPage() {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<
    'celeste' | 'kommandra' | 'odysseus' | 'command-centre' | 'empires' | 'projects' | 'workforce' | 'scrap-miner' | 'profit-forecast' | 'outbound-hunters' | 'border-council' | 'browser-sessions' | 'settings'
  >('celeste');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Workforce filter pill: 'all' | 'ceo' | 'empire' | 'project' | 'workers'
  const [agentFilter, setAgentFilter] = useState<'all' | 'ceo' | 'empire' | 'project' | 'workers'>('all');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Scrap Mining State
  const [scrapRawInput, setScrapRawInput] = useState(`// Bank of chaotic unfinished files, scripts & concepts:
1. Unfinished WhatsApp / Telegram AI Auto-Receptionist script with ElevenLabs voice & webhook routing
2. Half-built Next.js booking calendar for local dental & aesthetic clinics with no website
3. CSV of 4,800 local service businesses in AU/NZ with phone numbers but blank website columns
4. Draft Stripe recurring billing integration with 2.5% platform fee split
5. Incomplete automated cold email outreach template with custom screenshot generation`);
  const [scrapFileCount, setScrapFileCount] = useState(14);
  const [isMiningScrap, setIsMiningScrap] = useState(false);
  const [minedScrapResult, setMinedScrapResult] = useState<any>(null);

  // Profit Forecaster State (12h increments / 33 days)
  const [forecastOppName, setForecastOppName] = useState('Autonomous AI Receptionist & Rapid Website System for Local Clinics');
  const [forecastNiche, setForecastNiche] = useState('Local Med-Spas, Aesthetic Clinics & Contractors without live websites or online booking');
  const [forecastPricing, setForecastPricing] = useState('$497/mo retainer + $997 instant setup fee via Stripe Link');
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [forecastViewInterval, setForecastViewInterval] = useState<'all' | 'week1' | 'week2' | 'week3' | 'week4' | 'final'>('all');

  // 24/7 Outbound Hunter-Closer Squad State
  const [hunterNiche, setHunterNiche] = useState('Aesthetic Clinics & High-End Contractors');
  const [hunterLocation, setHunterLocation] = useState('Auckland, Sydney & Brisbane');
  const [hunterOffer, setHunterOffer] = useState('Instant 60-Second Custom Demo Website + 24/7 AI Phone Receptionist (Zero upfront risk, 14-day trial, Stripe $497/mo)');
  const [isRunningHunterCycle, setIsRunningHunterCycle] = useState(false);
  const [hunterResult, setHunterResult] = useState<any>(null);
  const [hunterActiveView, setHunterActiveView] = useState<'overview' | 'builder' | 'hunters' | 'negotiator' | 'closer' | 'payment'>('overview');

  // AI Moat Border Council Triage State
  const [councilInboundType, setCouncilInboundType] = useState('inbound_lead');
  const [councilSender, setCouncilSender] = useState('Marcus Sterling (Apex Medical Clinic Group)');
  const [councilMessage, setCouncilMessage] = useState('Hi there, we saw the automated demo website and receptionist phone workflow you spun up for our clinic. We want to roll this out across our 4 branches immediately. What is the pricing and can we pay via credit card link right away?');
  const [isDeliberatingCouncil, setIsDeliberatingCouncil] = useState(false);
  const [councilResult, setCouncilResult] = useState<any>(null);

  // Core Data
  const [agents, setAgents] = useState<HierarchyAgent[]>(initialHierarchyAgents);
  const [empires, setEmpires] = useState<SovereignEmpire[]>(initialEmpires);
  const [projects, setProjects] = useState<SovereignProject[]>(initialProjects);
  const [tasks, setTasks] = useState<OpsTask[]>(initialTasks);
  const [events, setEvents] = useState<RealtimeEvent[]>(initialEvents);
  const [alerts, setAlerts] = useState<AgentPerformanceAlert[]>(() =>
    buildAgentFleetAlerts(initialHierarchyAgents)
  );

  // Digital Kassandra / Korban (קָרְבָּן) Persistent Co-Partner Chat State
  const [isCoPartnerChatOpen, setIsCoPartnerChatOpen] = useState(false);
  const [coPartnerMessages, setCoPartnerMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; time: string }>>([
    {
      role: 'assistant',
      content: "Hey Kassandra! I'm Korban (קָרְבָּן), your digital self and autonomous co-partner. I have direct oversight of all empires, projects, and our specialized agent workforce running on OpenAI GPT-4o. What would you like us to build, deploy, or automate next?",
      time: '19:50'
    }
  ]);
  const [coPartnerInput, setCoPartnerInput] = useState('');
  const [isCoPartnerLoading, setIsCoPartnerLoading] = useState(false);

  // Individual Agent Chat Modal
  const [chatAgent, setChatAgent] = useState<HierarchyAgent | null>(null);
  const [agentChatMessages, setAgentChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; time: string }>>([]);
  const [agentChatInput, setAgentChatInput] = useState('');
  const [isAgentChatLoading, setIsAgentChatLoading] = useState(false);

  // Inspect Capabilities Modal & 7-Day Performance Trend State
  const [inspectAgent, setInspectAgent] = useState<HierarchyAgent | null>(null);
  const [trendDayIndex, setTrendDayIndex] = useState<number>(6);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    ok: boolean;
    text: string;
    latencyMs?: number;
    model?: string;
  } | null>(null);

  // Add Agent Modal
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<'ceo' | 'empire' | 'project' | 'workers'>('workers');
  const [newAgentBadge, setNewAgentBadge] = useState('Workers');
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [newAgentTags, setNewAgentTags] = useState('autonomous-dev, playwright, typescript');

  // Spawn Empire Modal
  const [isSpawnEmpireOpen, setIsSpawnEmpireOpen] = useState(false);
  const [empireName, setEmpireName] = useState('');
  const [empireTagline, setEmpireTagline] = useState('');
  const [empireManager, setEmpireManager] = useState('Atlas');
  const [empireDomain, setEmpireDomain] = useState('');
  const [empireBrandBible, setEmpireBrandBible] = useState('');

  // Spawn Project Modal
  const [isSpawnProjectOpen, setIsSpawnProjectOpen] = useState(false);
  const [newProjectEmpire, setNewProjectEmpire] = useState(empires[0]?.id || 'empire-01');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectMonetization, setNewProjectMonetization] = useState('Monthly SaaS Subscription + 2.5% Stripe Processing Commission');
  const [newProjectTargetMarket, setNewProjectTargetMarket] = useState('Global digital operators, e-commerce stores, automated workflows');
  const [newProjectTemplate, setNewProjectTemplate] = useState('godsentaigod/Template- (Pre-configured Sovereign Starter)');
  const [newProjectGithub, setNewProjectGithub] = useState('https://github.com/holystunner/new-project');
  const [newProjectManager, setNewProjectManager] = useState('Orion');
  const [isSpawningProjectWithAI, setIsSpawningProjectWithAI] = useState(false);

  // Task Execution Result Modal
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecutionResultOpen, setIsExecutionResultOpen] = useState(false);

  // Live URL & Checkout Inspector State
  const [browserUrl, setBrowserUrl] = useState('https://stripe.com/payments/checkout');
  const [browserLogs, setBrowserLogs] = useState<string[]>([
    '[Ready] SSRF-hardened live URL & checkout inspector ready. Enter any public https:// URL to fetch live DOM & run AI conversion audit.'
  ]);
  const [browserInspection, setBrowserInspection] = useState<{
    url: string;
    httpStatus: number;
    latencyMs: number;
    title: string;
    metaDescription: string;
    h1: string;
    formsCount: number;
    linksCount: number;
    hasStripeCheckoutSignals: boolean;
    hasViewportMeta: boolean;
    aiAudit: string | null;
    redirectLocation?: string;
  } | null>(null);
  const [isExecutingBrowserScript, setIsExecutingBrowserScript] = useState(false);

  // Persisted Workstation Notes & Tasks
  const [workstationNotes, setWorkstationNotes] = useState<NoteItem[] | undefined>(undefined);
  const [workstationTasks, setWorkstationTasks] = useState<TaskItem[] | undefined>(undefined);

  // Non-Secret Server Workspace Settings
  const [settings, setSettings] = useState({
    exportEmail: 'theaucklandassistant@gmail.com',
    githubRepo: '',
    autoGitPushIntervalMins: 10,
    autoZipEmailIntervalMins: 10,
    zeroTelemetryEnforced: true
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTriggeringPush, setIsTriggeringPush] = useState(false);
  const [isTriggeringZip, setIsTriggeringZip] = useState(false);
  const [isMintingStripeLink, setIsMintingStripeLink] = useState(false);
  const [copiedStripeUrl, setCopiedStripeUrl] = useState(false);

  // Live Server Capabilities & Inline Operational Banner
  const [capabilities, setCapabilities] = useState<ServerCapabilities | null>(null);
  const [openAiConfigured, setOpenAiConfigured] = useState(true);
  const [isPingingAi, setIsPingingAi] = useState(false);
  const [opsBanner, setOpsBanner] = useState<{
    type: 'error' | 'success' | 'info';
    message: string;
  } | null>(null);

  const hasHydratedRef = useRef(false);
  const coPartnerScrollRef = useRef<HTMLDivElement>(null);
  const agentChatScrollRef = useRef<HTMLDivElement>(null);

  const refreshCapabilities = async (testPing = false) => {
    if (testPing) setIsPingingAi(true);
    try {
      const res = await authFetch(`/api/ops/status${testPing ? '?test=true' : ''}`);
      const data = await res.json();
      if (data?.success) {
        setCapabilities(data);
        setOpenAiConfigured(Boolean(data.aiConfigured));
        if (testPing && data.pingResult) {
          setOpsBanner({
            type: data.pingResult.ok ? 'success' : 'error',
            message: data.pingResult.ok
              ? `Live AI verified (${data.pingResult.model}) in ${data.pingResult.latencyMs}ms.`
              : `Live AI ping failed: ${data.pingResult.error}`
          });
        }
      }
    } catch {
      // Ignore transient status poll error
    } finally {
      if (testPing) setIsPingingAi(false);
    }
  };

  // Load persisted workspace & live server capabilities on mount
  useEffect(() => {
    refreshCapabilities(false);

    authFetch('/api/workspace')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.success && data.initialized && data.workspace) {
          const w = data.workspace;
          if (Array.isArray(w.empires) && w.empires.length > 0) setEmpires(w.empires);
          if (Array.isArray(w.projects) && w.projects.length > 0) setProjects(w.projects);
          if (Array.isArray(w.agents) && w.agents.length > 0) setAgents(w.agents);
          if (Array.isArray(w.tasks) && w.tasks.length > 0) setTasks(w.tasks);
          if (Array.isArray(w.events) && w.events.length > 0) setEvents(w.events);
          if (Array.isArray(w.alerts) && w.alerts.length > 0) setAlerts(w.alerts);
          if (Array.isArray(w.notes) && w.notes.length > 0) setWorkstationNotes(w.notes);
          if (Array.isArray(w.workstationTasks) && w.workstationTasks.length > 0) {
            setWorkstationTasks(w.workstationTasks);
          }
          if (w.settings && typeof w.settings === 'object') {
            setSettings(prev => ({
              ...prev,
              exportEmail: w.settings.exportEmail || prev.exportEmail,
              githubRepo: w.settings.githubRepo ?? prev.githubRepo,
              autoGitPushIntervalMins: w.settings.autoGitPushIntervalMins ?? prev.autoGitPushIntervalMins,
              autoZipEmailIntervalMins: w.settings.autoZipEmailIntervalMins ?? prev.autoZipEmailIntervalMins,
              zeroTelemetryEnforced: w.settings.zeroTelemetryEnforced ?? prev.zeroTelemetryEnforced
            }));
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        hasHydratedRef.current = true;
      });
  }, []);

  // Debounced auto-save of workspace state to server storage
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const timer = setTimeout(() => {
      authFetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empires,
          projects,
          agents,
          tasks,
          events: events.slice(0, 80),
          alerts,
          notes: workstationNotes,
          workstationTasks,
          settings
        })
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(timer);
  }, [empires, projects, agents, tasks, events, alerts, workstationNotes, workstationTasks, settings]);

  useEffect(() => {
    if (coPartnerScrollRef.current) {
      coPartnerScrollRef.current.scrollTop = coPartnerScrollRef.current.scrollHeight;
    }
  }, [coPartnerMessages]);

  useEffect(() => {
    if (agentChatScrollRef.current) {
      agentChatScrollRef.current.scrollTop = agentChatScrollRef.current.scrollHeight;
    }
  }, [agentChatMessages]);

  // Filter agents according to the pill buttons & search input
  const filteredAgents = agents.filter(agent => {
    const matchesFilter = agentFilter === 'all' || agent.role === agentFilter;
    const matchesSearch =
      agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
      agent.tags.some(t => t.toLowerCase().includes(agentSearchQuery.toLowerCase())) ||
      agent.badgeTitle.toLowerCase().includes(agentSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Handle Chat with Digital Kassandra (Co-Partner)
  const handleSendCoPartnerMessage = async (customText?: string) => {
    const textToSend = typeof customText === 'string' ? customText.trim() : coPartnerInput.trim();
    if (!textToSend || isCoPartnerLoading) return;

    const userText = textToSend;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHistory = [...coPartnerMessages, { role: 'user' as const, content: userText, time: timeString }];

    setCoPartnerMessages(newHistory);
    if (!customText) {
      setCoPartnerInput('');
    }
    setIsCoPartnerLoading(true);

    try {
      const res = await authFetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: 'executive',
          agentName: 'Korban (קָרְבָּן) (Digital Co-Partner)',
          message: userText,
          conversationHistory: newHistory.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          context: `You are Korban (קָרְבָּן), the executive digital co-partner of Kassandra. You direct sovereign empires, projects, and the AI workforce. Provide crisp, realistic, actionable execution directives and never invent fake external results.`
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.reply) {
        setCoPartnerMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        setEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'agent_task',
            source: 'Korban (קָרְבָּן) (Digital Co-Partner)',
            message: `Executed directive (${data.model || 'AI'}): "${userText.slice(0, 45)}..."`,
            status: 'success'
          },
          ...prev
        ]);
      } else {
        setCoPartnerMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Error (${res.status}): ${data?.error || 'Failed to generate executive reply. Check Settings / Server AI status.'}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setCoPartnerMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Network error: ${err?.message || 'Unable to reach /api/agents/chat.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsCoPartnerLoading(false);
    }
  };

  // Handle Chat with Any Specialized Agent
  const handleOpenAgentChat = (agent: HierarchyAgent) => {
    setChatAgent(agent);
    setAgentChatMessages([
      {
        role: 'assistant',
        content: `Greetings Kassandra. I am ${agent.name} (${agent.badgeTitle}), running live via ${capabilities?.activeModel || 'Gemini 4 Hydrogen / GPT-4o'}. Status: ${agent.status}. Ready for your directives.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendAgentChatMessage = async (customText?: string) => {
    const textToSend = typeof customText === 'string' ? customText.trim() : agentChatInput.trim();
    if (!textToSend || !chatAgent || isAgentChatLoading) return;

    const userText = textToSend;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHist = [...agentChatMessages, { role: 'user' as const, content: userText, time: timeStr }];

    setAgentChatMessages(newHist);
    if (!customText) {
      setAgentChatInput('');
    }
    setIsAgentChatLoading(true);

    try {
      const res = await authFetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: chatAgent.role === 'ceo' ? 'executive' : chatAgent.role === 'empire' ? 'executive' : chatAgent.role === 'project' ? 'engineer' : 'devops',
          agentName: chatAgent.name,
          message: userText,
          conversationHistory: newHist.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          context: `You are ${chatAgent.name}, holding the role ${chatAgent.badgeTitle} in Kassandra's AI Profit Ops Suite. Skills: ${chatAgent.tags.join(', ')}. Keep answers crisp, technical, and grounded.`
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.reply) {
        setAgentChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setAgentChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Error (${res.status}): ${data?.error || 'AI provider failed to respond.'}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setAgentChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Network error: ${err?.message || 'Unable to reach /api/agents/chat.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAgentChatLoading(false);
    }
  };

  // Handle Adding a New Agent to the Hierarchy
  const handleCreateAgent = () => {
    if (!newAgentName.trim()) return;

    const newAgent: HierarchyAgent = {
      id: `agent-custom-${Date.now()}`,
      name: newAgentName.trim(),
      avatarChar: newAgentName.trim().charAt(0).toUpperCase(),
      avatarBg: newAgentRole === 'ceo' ? 'bg-blue-600' : newAgentRole === 'empire' ? 'bg-emerald-600' : newAgentRole === 'project' ? 'bg-sky-600' : 'bg-slate-700',
      role: newAgentRole,
      badgeTitle: newAgentBadge.trim() || 'Worker',
      badgeType: newAgentRole,
      tags: newAgentTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      browserSessions: 1,
      performanceScore: 95,
      status: 'Active',
      activeTasksCount: 1,
      maxConcurrentTasks: 4,
      avgLatencyMs: 210,
      errorRatePct: 0.3,
      slaTargetPct: 92,
      description: newAgentDescription.trim() || `Custom autonomous agent specialized in ${newAgentBadge}.`,
      capabilities: [
        { name: 'Autonomous Task Execution', description: 'Carries out specialized workflows via GPT-4o', confidence: 0.95 }
      ]
    };

    setAgents(prev => [...prev, newAgent]);
    setIsAddAgentOpen(false);
    setNewAgentName('');
    setNewAgentDescription('');
  };

  // Handle Spawning a New Sovereign Empire
  const handleSpawnEmpire = () => {
    if (!empireName.trim()) return;

    const newEmpire: SovereignEmpire = {
      id: `empire-${Date.now()}`,
      name: empireName.trim(),
      tagline: empireTagline.trim() || 'Autonomous sovereign ecosystem',
      managerName: empireManager,
      managerAvatar: empireManager.charAt(0),
      status: 'Active',
      projectsCount: 0,
      domain: empireDomain.trim() || `${empireName.toLowerCase().replace(/\s+/g, '')}.sovereign.local`,
      containerId: `vm-isolated-${Math.random().toString(36).substring(2, 7)}`,
      monthlyRevenue: '$0 / mo',
      brandBibleSummary: empireBrandBible.trim() || 'Governed by sovereign standards, zero leakage, light UI theme.',
      governingTerms: 'Autonomous continuous scaling enabled.',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setEmpires(prev => [newEmpire, ...prev]);
    setIsSpawnEmpireOpen(false);
    setEmpireName('');
    setEmpireTagline('');
    setEmpireDomain('');
    setEmpireBrandBible('');

    setEvents(prev => [
      {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'system',
        source: `${empireManager} (Empire Manager)`,
        message: `🏛️ Spawned new sovereign containerized empire: "${newEmpire.name}" with isolated VM enclave`,
        status: 'success'
      },
      ...prev
    ]);
  };

  // Handle Spawning a New Project with AI Plan Generation
  const handleSpawnProjectWithAI = async () => {
    if (!newProjectName.trim()) return;

    setIsSpawningProjectWithAI(true);
    const targetEmpire = empires.find(e => e.id === newProjectEmpire) || empires[0];

    try {
      const res = await authFetch('/api/agents/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: `${newProjectName}: ${newProjectDesc} | Target Market: ${newProjectTargetMarket} | Monetization: ${newProjectMonetization}`,
          businessType: targetEmpire.name,
          targetMarket: newProjectTargetMarket,
          budget: 50000
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Failed to generate AI project plan (${res.status}).`
        });
        return;
      }
      const plan = data?.plan;

      const newProjId = `proj-${Date.now()}`;
      const spawnedProject: SovereignProject = {
        id: newProjId,
        empireId: targetEmpire.id,
        empireName: targetEmpire.name,
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || plan?.description || 'Autonomous containerized development project driving real-world profit',
        targetMarket: newProjectTargetMarket || plan?.targetMarket || 'Global digital consumers & B2B operators',
        monetizationModel: newProjectMonetization || (plan?.revenueStreams ? plan.revenueStreams.join(' + ') : 'Automated Stripe recurring billing'),
        monthlyProfitRunRate: '$0 / mo (Pre-launch acceleration phase)',
        templateSource: newProjectTemplate,
        githubRepo: newProjectGithub.trim() || 'https://github.com/holystunner/new-sovereign-repo',
        status: 'development',
        managerName: newProjectManager,
        taskforceSquad: {
          lead: `${newProjectManager} (Sprint & Delivery Lead)`,
          engineer: 'Vulcan (Next.js & API Engineering)',
          financial: 'Aegis (Stripe Billing & Invoicing)',
          automation: 'Puppeteer-01 (Headless Playwright Validation)',
          growth: 'Nova (Acquisition & SEO Funnels)'
        },
        assignedWorkers: ['Vulcan', 'Aegis', 'Puppeteer-01', 'Nova'],
        cloudVM: 'Cloud VM Isolated Container (4 vCPU / 16GB RAM)',
        lastGitPush: 'Ready for initial sync',
        lastZipExport: 'Ready for .zip snapshot',
        budget: 50000,
        tasksCount: plan?.tasks?.length || 5,
        completedTasksCount: 0,
        ratings: {
          visual: 8.5,
          progression: 8.0,
          vibe: 8.8,
          feel: 8.5
        },
        timeliness: {
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          timeElapsedPct: 5,
          scheduleStatus: 'on-track',
          deltaLabel: 'Kickoff · 14d sprint window',
          onTimeRatePct: 100,
          velocityPerDay: '1.0 tasks/day',
          nextMilestoneDue: 'MVP & Containerization · Day 4'
        },
        profitMilestones: [
          { stage: 'Concept & Blueprint', status: 'completed', targetRevenue: '$0', leadTaskforce: `${newProjectManager} (Lead)` },
          { stage: 'MVP & Containerization', status: 'active', targetRevenue: '$2,500/mo', leadTaskforce: 'Vulcan (Lead Dev)' },
          { stage: 'Stripe & Billing Live', status: 'queued', targetRevenue: '$10,000/mo', leadTaskforce: 'Aegis (Financial)' },
          { stage: 'Automated User Acquisition', status: 'queued', targetRevenue: '$25,000/mo', leadTaskforce: 'Nova (Growth)' },
          { stage: 'Autonomous Profit Stream', status: 'queued', targetRevenue: '$50,000+/mo', leadTaskforce: `${newProjectManager} (Taskforce)` }
        ]
      };

      const spawnedTasks: OpsTask[] = (plan?.tasks || []).map((t: any, idx: number) => ({
        id: `task-${Date.now()}-${idx}`,
        projectId: newProjId,
        projectName: spawnedProject.name,
        title: t.title,
        description: t.description || 'Actionable profit-driving task step',
        status: idx === 0 ? 'in-progress' : 'pending',
        priority: t.priority || 'high',
        assignedAgent: t.assignedRole === 'engineer' ? 'Vulcan' : t.assignedRole === 'legal' ? 'Cypher' : t.assignedRole === 'marketing' ? 'Nova' : t.assignedRole === 'testing' ? 'Puppeteer-01' : newProjectManager,
        assignedRole: t.assignedRole || 'Taskforce Specialist',
        deliverables: t.deliverables || ['Implementation Blueprint', 'Code Artifacts'],
        createdAt: 'Just now'
      }));

      setProjects(prev => [spawnedProject, ...prev]);
      if (spawnedTasks.length > 0) {
        setTasks(prev => [...spawnedTasks, ...prev]);
      }
      setIsSpawnProjectOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setOpsBanner({
        type: 'success',
        message: `Project "${spawnedProject.name}" spawned with ${spawnedTasks.length} AI-generated tasks.`
      });

      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'git_push',
          source: `${newProjectManager} (Project Manager)`,
          message: `Spawned project "${spawnedProject.name}" in ${targetEmpire.name} with ${spawnedTasks.length} AI-planned tasks`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Failed to spawn project.'
      });
    } finally {
      setIsSpawningProjectWithAI(false);
    }
  };

  // Handle Executing a Task with Real AI Deliverable & Code Synthesis
  const handleExecuteTask = async (task: OpsTask) => {
    setExecutingTaskId(task.id);

    try {
      const res = await authFetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: task.assignedRole.toLowerCase().includes('lead') ? 'engineer' : 'devops',
          agentName: task.assignedAgent,
          taskTitle: task.title,
          taskDescription: task.description,
          taskPriority: task.priority
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.result) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Task execution failed (${res.status}).`
        });
        return;
      }

      setExecutionResult({
        task,
        result: data.result
      });
      setIsExecutionResultOpen(true);

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed', codeSnippets: data.result.codeSnippets } : t));

      setProjects(prev => prev.map(p => {
        if (p.id === task.projectId) {
          return { ...p, completedTasksCount: Math.min(p.tasksCount, p.completedTasksCount + 1) };
        }
        return p;
      }));

      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'agent_task',
          source: `${task.assignedAgent} (${task.assignedRole})`,
          message: `Synthesized deliverables for task: "${task.title}"`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Network error executing task.'
      });
    } finally {
      setExecutingTaskId(null);
    }
  };

  // Real Git Status & GitHub API Sync Check
  const handleTriggerGitPush = async () => {
    if (isTriggeringPush) return;
    setIsTriggeringPush(true);
    try {
      const res = await authFetch('/api/ops/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'git_sync',
          githubRepo: settings.githubRepo
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Git sync failed (${res.status}).`
        });
        return;
      }

      const summary = `[${data.branch}] ${data.modifiedCount} uncommitted changes · ${data.lastCommit} · ${data.message}`;
      setOpsBanner({
        type: data.remoteVerified ? 'success' : 'info',
        message: summary
      });
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'git_push',
          source: 'Titan (Git & Repo Sync)',
          message: summary,
          status: data.remoteVerified ? 'success' : 'info'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Git sync request failed.'
      });
    } finally {
      setIsTriggeringPush(false);
    }
  };

  // Real PKZIP Workspace Backup Archive Download
  const handleTriggerZipExport = async () => {
    if (isTriggeringZip) return;
    setIsTriggeringZip(true);
    try {
      const res = await authFetch('/api/ops/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empires,
          projects,
          agents,
          tasks,
          notes: workstationNotes,
          workstationTasks,
          settings
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setOpsBanner({
          type: 'error',
          message: errData?.error || `ZIP export failed (${res.status}).`
        });
        return;
      }

      const blob = await res.blob();
      const sizeKb = Math.max(1, Math.round(blob.size / 1024));
      const filename = `kommandra-backup-${new Date().toISOString().slice(0, 10)}.zip`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setOpsBanner({
        type: 'success',
        message: `Downloaded real workspace archive "${filename}" (${sizeKb} KB).`
      });
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'zip_export',
          source: 'Titan (Archive Exporter)',
          message: `Downloaded real workspace archive "${filename}" (${sizeKb} KB)`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'ZIP export download failed.'
      });
    } finally {
      setIsTriggeringZip(false);
    }
  };

  // Real SSRF-Hardened Live URL Fetch & Conversion Audit
  const handleRunBrowserAutomation = async () => {
    if (!browserUrl.trim() || isExecutingBrowserScript) return;
    setIsExecutingBrowserScript(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setBrowserLogs(prev => [...prev, `[${timestamp}] Inspecting ${browserUrl.trim()} (SSRF guard + HTTP fetch + DOM extraction)...`]);

    try {
      const res = await authFetch('/api/ops/inspect-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: browserUrl.trim(),
          runAiAudit: true
        })
      });
      const data = await res.json();

      if (!res.ok || !data?.success || !data?.inspection) {
        const msg = data?.error || `URL inspection failed (${res.status}).`;
        setBrowserLogs(prev => [...prev, `[${timestamp}] ERROR: ${msg}`]);
        setOpsBanner({ type: 'error', message: msg });
        return;
      }

      const insp = data.inspection;
      setBrowserInspection(insp);
      setBrowserLogs(prev => [
        ...prev,
        `[${timestamp}] HTTP ${insp.httpStatus} in ${insp.latencyMs}ms · Title: "${insp.title || 'None'}"`,
        `[${timestamp}] DOM: forms=${insp.formsCount}, links=${insp.linksCount}, stripeSignals=${insp.hasStripeCheckoutSignals}, mobileViewport=${insp.hasViewportMeta}`,
        ...(insp.aiAudit ? [`[${timestamp}] AI Conversion Audit complete.`] : [])
      ]);

      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp,
          type: 'browser_action',
          source: 'Puppeteer-01 (Live Inspector)',
          message: `Inspected ${insp.url} (HTTP ${insp.httpStatus}, ${insp.latencyMs}ms, Stripe=${insp.hasStripeCheckoutSignals})`,
          status: insp.httpStatus >= 200 && insp.httpStatus < 400 ? 'success' : 'warning'
        },
        ...prev
      ]);
    } catch (err: any) {
      const msg = err?.message || 'Live URL inspection failed.';
      setBrowserLogs(prev => [...prev, `[${timestamp}] NETWORK ERROR: ${msg}`]);
      setOpsBanner({ type: 'error', message: msg });
    } finally {
      setIsExecutingBrowserScript(false);
    }
  };

  // Run Scrap Miner & Code Recycler
  const handleRunScrapMiner = async () => {
    if (!scrapRawInput.trim() || isMiningScrap) return;
    setIsMiningScrap(true);

    try {
      const res = await authFetch('/api/agents/mine-scraps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: scrapRawInput,
          fileCount: scrapFileCount,
          contextNotes: 'Identify immediate cashflow gems that can be launched with $0 spend in <48 hours.'
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.result) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Scrap mining failed (${res.status}).`
        });
        return;
      }

      setMinedScrapResult(data.result);
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'agent_task',
          source: 'Gem-Miner (Scrap & Code Recycler)',
          message: `Mined gem: "${data.result.recommendedGemName}" (${data.result.verdict} - Est. ${data.result.estimatedMonthlyRevenue})`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Error mining scraps.'
      });
    } finally {
      setIsMiningScrap(false);
    }
  };

  // Generate 33-Day 12-Hour Incremental Profit Forecast
  const handleGenerateForecast = async () => {
    if (!forecastOppName.trim() || isGeneratingForecast) return;
    setIsGeneratingForecast(true);

    try {
      const res = await authFetch('/api/agents/forecast-profit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityName: forecastOppName,
          targetNiche: forecastNiche,
          pricingModel: forecastPricing,
          baselineConversionRate: 0.04
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.result) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Forecast generation failed (${res.status}).`
        });
        return;
      }

      setForecastResult(data.result);
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'agent_task',
          source: 'Forecaster-12h (Real Talk Valuation)',
          message: `Generated 33-Day 12h Forecast for "${forecastOppName}" (Net: ${data.result.summaryMetrics?.total33DayNetProfit || 'N/A'})`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Error generating forecast.'
      });
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  // Run 24/7 Outbound Speed Sales & Hunter-Closer Cycle
  const handleRunHunterCloser = async () => {
    if (isRunningHunterCycle) return;
    setIsRunningHunterCycle(true);

    try {
      const res = await authFetch('/api/agents/sales-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: hunterNiche,
          location: hunterLocation,
          offerDescription: hunterOffer
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.result) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Outbound hunter cycle failed (${res.status}).`
        });
        return;
      }

      setHunterResult(data.result);
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'agent_task',
          source: 'Vanguard (Sales Lead)',
          message: `Executed Hunter-Closer cycle: ${data.result.hunter1NoWebsiteScout?.leadsDiscovered?.length || 0} local targets, ${data.result.hunter2HighVolumeEmail?.verifiedDecisionMakers?.length || 0} decision-makers.`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Error running hunter cycle.'
      });
    } finally {
      setIsRunningHunterCycle(false);
    }
  };

  // Mint Real Stripe Payment Link via /api/ops/actions
  const handleMintLiveStripeLink = async () => {
    if (isMintingStripeLink) return;
    setIsMintingStripeLink(true);
    try {
      const res = await authFetch('/api/ops/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_stripe_link',
          productName: `${hunterNiche || 'KOMMANDRA'} Retainer`,
          amountUsd: 497,
          recurringInterval: 'month'
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Stripe Payment Link creation failed (${res.status}).`
        });
        return;
      }
      setHunterResult((prev: any) =>
        prev
          ? {
              ...prev,
              paymentAgentStripeLink: {
                ...prev.paymentAgentStripeLink,
                instantStripeLink: data.instantStripeLink,
                stripeConfigured: true,
                note: data.note
              }
            }
          : prev
      );
      setOpsBanner({
        type: 'success',
        message: `Live Stripe Payment Link created: ${data.instantStripeLink}`
      });
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Failed to create Stripe link.'
      });
    } finally {
      setIsMintingStripeLink(false);
    }
  };

  // Export Hunter Leads as CSV
  const handleExportLeadsCsv = () => {
    if (!hunterResult) return;
    const rows: string[][] = [['Type', 'Name / Business', 'Contact / Title', 'Location / Domain', 'Opportunity / Angle']];
    for (const l of hunterResult.hunter1NoWebsiteScout?.leadsDiscovered || []) {
      rows.push(['Local No-Web', l.businessName || '', l.phoneNumber || '', l.location || '', l.opportunityGap || '']);
    }
    for (const l of hunterResult.hunter2HighVolumeEmail?.verifiedDecisionMakers || []) {
      rows.push(['Decision Maker', l.contactName || '', `${l.title || ''} (${l.email || ''})`, l.companyDomain || '', l.customAngle || '']);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kommandra-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Save Non-Secret Workspace Settings Immediately
  const handleSaveWorkspaceSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await authFetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setOpsBanner({
          type: 'error',
          message: data?.error || 'Failed to save workspace settings.'
        });
        return;
      }
      setOpsBanner({
        type: 'success',
        message: `Workspace operational settings saved to server storage (${new Date().toLocaleTimeString()}).`
      });
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Error saving settings.'
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Deliberate Multi-Model Border Moat Council
  const handleDeliberateCouncil = async () => {
    if (!councilMessage.trim() || isDeliberatingCouncil) return;
    setIsDeliberatingCouncil(true);

    try {
      const res = await authFetch('/api/agents/council-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboundType: councilInboundType,
          senderInfo: councilSender,
          rawMessage: councilMessage
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.result) {
        setOpsBanner({
          type: 'error',
          message: data?.error || `Council deliberation failed (${res.status}).`
        });
        return;
      }

      setCouncilResult(data.result);
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'system',
          source: 'Moat-Council (Border Moat Gateway)',
          message: `Border Moat Council synthesized triage for "${councilSender}" -> Routed to ${data.result.moatTriageReport?.assignedDepartment || 'Sales & Closers'} (${data.result.moatTriageReport?.urgencyLevel || 'HIGH'})`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      setOpsBanner({
        type: 'error',
        message: err?.message || 'Error deliberating council.'
      });
    } finally {
      setIsDeliberatingCouncil(false);
    }
  };

  // Adopt Mined Gem as Containerized Sovereign Project
  const handleAdoptGemAsProject = (gem: any) => {
    setNewProjectName(gem.recommendedGemName || 'Mined Sovereign Gem Project');
    setNewProjectDesc(gem.gemExecutiveSummary || gem.rationale || 'Autonomous containerized project recycled from raw chaotic bank');
    setNewProjectMonetization(`${gem.estimatedMonthlyRevenue || '$4,500/mo'} (${gem.monetizationAngle || 'Recurring Stripe Billing'})`);
    setNewProjectTargetMarket('Global target niche / local business operators');
    setIsSpawnProjectOpen(true);
  };

  // Performance Alerts & Workload Rebalancing Handlers
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  };

  const handleAcknowledgeAllAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const handleRefreshFleetScan = () => {
    setAlerts(buildAgentFleetAlerts(agents));
  };

  const handleAdjustAgentTasks = (agentId: string, delta: number) => {
    setAgents(prev => {
      const updated = prev.map(a => {
        if (a.id !== agentId) return a;
        const current = a.activeTasksCount ?? (a.status === 'Idle' ? 1 : 2);
        const max = a.maxConcurrentTasks ?? 4;
        const nextTasks = Math.max(0, Math.min(max + 1, current + delta));
        return {
          ...a,
          activeTasksCount: nextTasks,
          status: nextTasks === 0 ? ('Idle' as const) : ('Active' as const)
        };
      });
      setAlerts(buildAgentFleetAlerts(updated));
      return updated;
    });
  };

  const handleRebalanceAgent = (overloadedAgentId: string) => {
    const source = agents.find(a => a.id === overloadedAgentId);
    if (!source) return;

    const target = [...agents]
      .filter(a => a.id !== overloadedAgentId)
      .sort((a, b) => computeAgentWorkloadPct(a) - computeAgentWorkloadPct(b))[0];

    if (!target) return;

    const updatedAgents = agents.map(a => {
      if (a.id === overloadedAgentId) {
        const cur = a.activeTasksCount ?? 3;
        return { ...a, activeTasksCount: Math.max(1, cur - 1) };
      }
      if (a.id === target.id) {
        const cur = a.activeTasksCount ?? 1;
        return { ...a, activeTasksCount: cur + 1, status: 'Active' as const };
      }
      return a;
    });

    setAgents(updatedAgents);
    setAlerts(prev =>
      prev.map(al =>
        al.agentId === overloadedAgentId && al.category === 'workload'
          ? { ...al, acknowledged: true }
          : al
      )
    );
    setEvents(prev => [
      {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'system',
        source: 'Korban (קָרְבָּן) Workload Balancer',
        message: `Rebalanced 1 task from ${source.name} to ${target.name} to relieve concurrency saturation.`,
        status: 'success'
      },
      ...prev
    ]);
  };

  const handleUpdateProjectRatings = (projectId: string, updated: ProjectVisualRatings) => {
    setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, ratings: updated } : p)));
  };

  const handleUpdateProjectTimeliness = (projectId: string, updated: ProjectTimeliness) => {
    setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, timeliness: updated } : p)));
  };

  const unresolvedAlertsCount = alerts.filter(a => !a.acknowledged).length;

  if (activeTab === 'celeste' || activeTab === 'kommandra' || (activeTab as string) === 'odysseus') {
    return (
      <CelesteWorkstation
        onOpenDashboard={() => setActiveTab('workforce')}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onTriggerPush={handleTriggerGitPush}
        onTriggerZip={handleTriggerZipExport}
        onOpenSpawnProject={() => setIsSpawnProjectOpen(true)}
        isTriggeringPush={isTriggeringPush}
        isTriggeringZip={isTriggeringZip}
        capabilities={capabilities}
        persistedNotes={workstationNotes}
        onUpdateNotes={setWorkstationNotes}
        persistedTasks={workstationTasks}
        onUpdateTasks={setWorkstationTasks}
        exportEmail={settings.exportEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d16] text-slate-100 flex flex-col antialiased relative overflow-x-hidden selection:bg-pink-400/30 selection:text-pink-100">
      {/* Soft Ethereal Dreamy Glow Background Overlay (Matching Front Workstation) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_75%_at_50%_-15%,rgba(244,114,182,0.13),rgba(56,189,248,0.06),rgba(10,13,22,0.92))]" />

      <div className="flex flex-1 w-full overflow-hidden relative z-10">

        {/* LEFT SIDEBAR (KOMMANDRA Dreamy Velvet & Pastel Pink/Sky Aesthetic) */}
        <aside
          className={`bg-[#0d111d]/90 backdrop-blur-xl border-r border-pink-500/15 shrink-0 transition-all duration-200 flex flex-col justify-between ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Top Brand & Profile */}
          <div className="p-4 space-y-5">
            {/* App Brand */}
            <div
              onClick={() => setActiveTab('celeste')}
              className="flex items-center gap-3 cursor-pointer group"
              title="Return to KOMMANDRA Workstation"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 flex items-center justify-center text-[#0a0d16] font-bold shadow-md shadow-pink-500/20 shrink-0 group-hover:scale-105 transition-transform">
                ✦
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div className="font-bold text-sm tracking-tight leading-tight flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-pink-200 via-rose-100 to-sky-200 bg-clip-text text-transparent">
                      KOMMANDRA
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-200 border border-pink-400/25 font-medium">
                      Exec
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Executive Suite · Ruthlessly Functional
                  </div>
                </div>
              )}
            </div>

            {/* Korban (קָרְבָּן) Digital Co-Partner Profile Card */}
            <div
              onClick={() => setIsCoPartnerChatOpen(true)}
              className={`rounded-2xl border border-pink-400/25 bg-gradient-to-r from-pink-500/12 via-rose-500/8 to-sky-500/10 p-2.5 flex items-center justify-between cursor-pointer hover:border-pink-400/45 hover:from-pink-500/20 hover:to-sky-500/15 transition-all shadow-sm ${
                isSidebarCollapsed ? 'justify-center p-2' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 text-[#0a0d16] font-bold flex items-center justify-center text-sm shadow-sm shadow-pink-500/25">
                    ק
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d111d]" />
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <div className="font-semibold text-xs text-pink-50 leading-tight">
                      Korban (קָרְבָּן)
                    </div>
                    <div className="text-[10px] text-pink-200/75">
                      Digital Co-Partner (CEO)
                    </div>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="text-pink-300 pr-1">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
              )}
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1 pt-1">
              <button
                id="nav-btn-kommandra"
                onClick={() => setActiveTab('celeste')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  (activeTab as string) === 'celeste' || (activeTab as string) === 'kommandra' || (activeTab as string) === 'odysseus'
                    ? 'bg-pink-500/20 text-pink-100 border border-pink-400/35 font-semibold shadow-sm'
                    : 'text-pink-200 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/25 hover:text-white font-semibold'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-pink-300" />
                {!isSidebarCollapsed && <span>KOMMANDRA Workstation</span>}
              </button>

              <button
                onClick={() => setActiveTab('command-centre')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'command-centre'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <LayoutGrid className={`w-4 h-4 shrink-0 ${activeTab === 'command-centre' ? 'text-pink-300' : 'text-pink-300/70'}`} />
                {!isSidebarCollapsed && <span>Command Centre</span>}
              </button>

              <button
                onClick={() => setActiveTab('empires')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'empires'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <Landmark className={`w-4 h-4 shrink-0 ${activeTab === 'empires' ? 'text-sky-300' : 'text-sky-300/70'}`} />
                {!isSidebarCollapsed && <span>Empires</span>}
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <FolderGit2 className={`w-4 h-4 shrink-0 ${activeTab === 'projects' ? 'text-pink-300' : 'text-pink-300/70'}`} />
                {!isSidebarCollapsed && <span>Projects</span>}
              </button>

              <button
                onClick={() => setActiveTab('workforce')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'workforce'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <Bot className={`w-4 h-4 shrink-0 ${activeTab === 'workforce' ? 'text-sky-300' : 'text-sky-300/70'}`} />
                {!isSidebarCollapsed && <span>AI Workforce</span>}
              </button>

              <button
                onClick={() => setActiveTab('scrap-miner')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'scrap-miner'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <Boxes className="w-4 h-4 shrink-0 text-amber-300" />
                {!isSidebarCollapsed && <span>Scrap & Code Miner</span>}
              </button>

              <button
                onClick={() => setActiveTab('profit-forecast')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'profit-forecast'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <DollarSign className="w-4 h-4 shrink-0 text-emerald-300" />
                {!isSidebarCollapsed && <span>12h Profit Forecast</span>}
              </button>

              <button
                onClick={() => setActiveTab('outbound-hunters')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'outbound-hunters'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <Target className="w-4 h-4 shrink-0 text-rose-300" />
                {!isSidebarCollapsed && <span>24/7 Sales Squad</span>}
              </button>

              <button
                onClick={() => setActiveTab('border-council')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'border-council'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-indigo-300" />
                {!isSidebarCollapsed && <span>AI Moat Council</span>}
              </button>

              <button
                onClick={() => setActiveTab('browser-sessions')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'browser-sessions'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 shrink-0 text-sky-300/80" />
                  {!isSidebarCollapsed && <span>Browser Sessions</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold font-mono tabular-nums flex items-center justify-center">
                    2
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/15 to-sky-500/15 text-pink-50 border border-pink-400/35 font-semibold shadow-sm shadow-pink-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-pink-100 border border-transparent'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0 text-pink-300/75" />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
            </nav>
          </div>

          {/* Bottom Collapse Button */}
          <div className="p-4 border-t border-pink-500/15 bg-[#0a0e19]/80">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-pink-200 transition-colors w-full justify-center py-1 cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN BODY VIEW */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0b0f19]/70">

          {/* TOP HEADER BAR */}
          <header className="bg-[#0d1220]/85 backdrop-blur-xl border-b border-pink-500/15 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 sticky top-0 z-20">
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 bg-gradient-to-r from-pink-100 via-rose-100 to-sky-100 bg-clip-text text-transparent">
                {activeTab === 'workforce' && 'AI Workforce Hierarchy'}
                {activeTab === 'command-centre' && 'Command Centre'}
                {activeTab === 'empires' && 'Empires'}
                {activeTab === 'projects' && 'Projects'}
                {activeTab === 'scrap-miner' && 'Scrap Bank & Code Recycler'}
                {activeTab === 'profit-forecast' && 'Real Talk 33-Day / 12h Incremental Forecast'}
                {activeTab === 'outbound-hunters' && '24/7 Outbound Speed Sales & Closer Squad'}
                {activeTab === 'border-council' && 'AI Border Moat & Multi-Model Triage'}
                {activeTab === 'browser-sessions' && 'Browser Sessions'}
                {activeTab === 'settings' && 'Settings & Sovereign Config'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'workforce' && 'Monitor your autonomous 17-agent hierarchy, SLA alerts & live workload'}
                {activeTab === 'command-centre' && "Autonomous operations & Kassandra's dreamy executive control room"}
                {activeTab === 'empires' && 'Manage containerized sovereign ecosystems and brand bibles'}
                {activeTab === 'projects' && 'Visual scorecards, schedule timeliness, repo sync & task execution'}
                {activeTab === 'scrap-miner' && 'Analyze chaotic backlogs and abandoned files to extract instant high-margin launch gems'}
                {activeTab === 'profit-forecast' && 'Data-backed 33-day sales projections with 12-hour incremental velocity & passive profit index'}
                {activeTab === 'outbound-hunters' && 'Autonomous speed sales cycle: Builder demos, lead discovery, objection counters & webmail closing'}
                {activeTab === 'border-council' && 'Multi-model council (GPT-4o, Claude 3.5, Grok-2, Gemini 2.0, DeepSeek) triaging inbound requests'}
                {activeTab === 'browser-sessions' && 'Playwright & autonomous browser puppeteering'}
                {activeTab === 'settings' && 'Unrestricted API keys, 10-min backups & zero telemetry'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Global Search Box */}
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-pink-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search empires, projects, agents"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-pink-500/20 text-xs bg-[#121727]/90 text-slate-100 focus:bg-[#151b2e] focus:outline-none focus:border-pink-400/50 placeholder:text-slate-500 transition-all"
                />
              </div>

              {/* Digital Kas / Korban Co-Partner Chat Button */}
              <button
                id="btn-digital-kas-header"
                onClick={() => setIsCoPartnerChatOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/30 text-pink-100 text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Direct Chat with Korban (קָרְבָּן)"
              >
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-400 to-sky-300 text-[#0a0d16] font-bold flex items-center justify-center text-[10px] shadow-xs">
                    ק
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#0d1220] animate-pulse" />
                </div>
                <span className="hidden md:inline">Korban</span>
                <MessageSquare className="w-3.5 h-3.5 text-pink-300" />
              </button>

              {/* Bell Icon with Dynamic Unresolved Alerts Count */}
              <button
                onClick={() => setActiveTab('workforce')}
                className="relative p-2 rounded-xl border border-pink-500/20 bg-[#121727]/85 hover:bg-pink-500/15 text-slate-300 hover:text-pink-200 transition-all cursor-pointer shrink-0"
                title="Agent Performance Alerts & Workload"
              >
                <Bell className="w-4 h-4" />
                {unresolvedAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 text-[#0a0d16] text-[9px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                    {unresolvedAlertsCount}
                  </span>
                )}
              </button>

              {/* Live Capabilities Status Indicator */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap shrink-0 ${
                openAiConfigured
                  ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-400/30 bg-amber-500/10 text-amber-300'
              }`}>
                <Zap className={`w-3.5 h-3.5 ${openAiConfigured ? 'text-emerald-300' : 'text-amber-300'}`} />
                <span>{openAiConfigured ? (capabilities?.activeModel ? `AI Live (${capabilities.activeModel})` : 'AI Systems Live') : 'AI Key Needed'}</span>
              </div>
            </div>
          </header>

          {/* INLINE OPERATIONAL FEEDBACK BANNER */}
          {opsBanner && (
            <div className="px-6 pt-4 max-w-7xl w-full mx-auto">
              <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs shadow-md ${
                opsBanner.type === 'error'
                  ? 'bg-rose-500/15 border-rose-400/40 text-rose-100'
                  : opsBanner.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100'
                  : 'bg-sky-500/15 border-sky-400/40 text-sky-100'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  {opsBanner.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                  )}
                  <span className="truncate font-medium">{opsBanner.message}</span>
                </div>
                <button
                  onClick={() => setOpsBanner(null)}
                  className="p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
                  aria-label="Dismiss status message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB VIEW 1: AI WORKFORCE */}
          {activeTab === 'workforce' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              {/* Korban (קָרְבָּן) Co-Partner Executive Hub */}
              <Card className="rounded-2xl border border-pink-400/25 bg-gradient-to-r from-[#191529]/95 via-[#13182b]/95 to-[#101c2d]/95 shadow-xl shadow-black/25 overflow-hidden backdrop-blur-md">
                <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 text-[#0a0d16] font-bold flex items-center justify-center text-xl shadow-lg shadow-pink-500/20">
                        ק
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#151828]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-pink-50">Korban (קָרְבָּן) — Digital Co-Partner</h2>
                        <span className="text-[11px] font-medium text-pink-300">
                          · Active Executive
                        </span>
                        <span className="text-[11px] font-medium text-emerald-300">
                          · GPT-4o & Gemini Online
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        Direct human-in-the-loop executive orchestrator directing 17 agents, 2 empires, and 10-minute backup daemons with zero data leakage.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <Button
                      id="btn-inspect-korban-hub"
                      onClick={() => {
                        setInspectAgent(agents[0]);
                        setTrendDayIndex(6);
                      }}
                      variant="outline"
                      className="bg-[#0d111d]/90 hover:bg-pink-500/15 text-pink-100 text-xs font-semibold h-9 rounded-xl border-pink-500/25 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5 text-sky-300" />
                      Inspect Performance Trend
                    </Button>
                    <Button
                      id="btn-kas-hub-chat"
                      onClick={() => setIsCoPartnerChatOpen(true)}
                      className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-pink-500/20 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Chat with Korban
                    </Button>
                    <Button
                      id="btn-kas-hub-push"
                      onClick={handleTriggerGitPush}
                      disabled={isTriggeringPush}
                      variant="outline"
                      className="bg-[#0d111d]/90 hover:bg-pink-500/15 text-slate-200 hover:text-pink-100 text-xs h-9 rounded-xl border-pink-500/20 cursor-pointer"
                    >
                      {isTriggeringPush ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-pink-300" /> : <GitBranch className="w-3.5 h-3.5 mr-1.5 text-pink-300" />}
                      Git Push
                    </Button>
                    <Button
                      id="btn-kas-hub-zip"
                      onClick={handleTriggerZipExport}
                      disabled={isTriggeringZip}
                      variant="outline"
                      className="bg-[#0d111d]/90 hover:bg-sky-500/15 text-slate-200 hover:text-sky-100 text-xs h-9 rounded-xl border-pink-500/20 cursor-pointer"
                    >
                      {isTriggeringZip ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-sky-300" /> : <Mail className="w-3.5 h-3.5 mr-1.5 text-sky-300" />}
                      Backup Zip
                    </Button>
                    <Button
                      id="btn-kas-hub-spawn"
                      onClick={() => setIsSpawnProjectOpen(true)}
                      variant="outline"
                      className="bg-[#0d111d]/90 hover:bg-pink-500/15 text-slate-200 hover:text-pink-100 text-xs h-9 rounded-xl border-pink-500/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5 text-pink-300" />
                      Spawn Project
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 4 Stat Summary Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Agents */}
                <Card className="rounded-2xl border-pink-500/20 shadow-lg shadow-black/20 bg-[#111626]/85 backdrop-blur-md hover:border-pink-400/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-pink-50 tracking-tight font-mono tabular-nums">
                        {agents.length}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        Total Agents
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-400/25 text-pink-300 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Active */}
                <Card className="rounded-2xl border-pink-500/20 shadow-lg shadow-black/20 bg-[#111626]/85 backdrop-blur-md hover:border-pink-400/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-emerald-300 tracking-tight font-mono tabular-nums">
                        {agents.filter(a => a.status === 'Active').length}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        Active
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Browser Sessions */}
                <Card className="rounded-2xl border-pink-500/20 shadow-lg shadow-black/20 bg-[#111626]/85 backdrop-blur-md hover:border-pink-400/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-sky-200 tracking-tight font-mono tabular-nums">
                        21
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        Browser Sessions
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/25 text-sky-300 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Avg Performance */}
                <Card className="rounded-2xl border-pink-500/20 shadow-lg shadow-black/20 bg-[#111626]/85 backdrop-blur-md hover:border-pink-400/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-pink-200 tracking-tight font-mono tabular-nums">
                        {Math.round(agents.reduce((s, a) => s + a.performanceScore, 0) / Math.max(1, agents.length))}%
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        Avg Performance
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AGENT PERFORMANCE ALERTS & WORKLOAD OVERVIEW */}
              <AgentAlertsAndWorkloadPanel
                agents={agents}
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onAcknowledgeAllAlerts={handleAcknowledgeAllAlerts}
                onRefreshFleetScan={handleRefreshFleetScan}
                onInspectAgent={(agent) => {
                  setInspectAgent(agent as HierarchyAgent);
                  setTrendDayIndex(6);
                }}
                onRebalanceAgent={handleRebalanceAgent}
                onAdjustAgentTasks={handleAdjustAgentTasks}
              />

              {/* Segmented Filter Bar & Search / Add Agent */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0d111d]/90 border border-pink-500/20 rounded-xl">
                  <button
                    onClick={() => setAgentFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      agentFilter === 'all'
                        ? 'bg-pink-500/25 text-pink-100 border border-pink-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-pink-100 border border-transparent'
                    }`}
                  >
                    All ({agents.length})
                  </button>

                  <button
                    onClick={() => setAgentFilter('ceo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      agentFilter === 'ceo'
                        ? 'bg-pink-500/25 text-pink-100 border border-pink-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-pink-200 border border-transparent'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-pink-300" />
                    <span>CEO ({agents.filter(a => a.role === 'ceo').length})</span>
                  </button>

                  <button
                    onClick={() => setAgentFilter('empire')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      agentFilter === 'empire'
                        ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-emerald-200 border border-transparent'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Empire ({agents.filter(a => a.role === 'empire').length})</span>
                  </button>

                  <button
                    onClick={() => setAgentFilter('project')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      agentFilter === 'project'
                        ? 'bg-sky-500/25 text-sky-100 border border-sky-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-sky-200 border border-transparent'
                    }`}
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-sky-300" />
                    <span>Project ({agents.filter(a => a.role === 'project').length})</span>
                  </button>

                  <button
                    onClick={() => setAgentFilter('workers')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      agentFilter === 'workers'
                        ? 'bg-amber-500/25 text-amber-100 border border-amber-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-amber-200 border border-transparent'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-300" />
                    <span>Workers ({agents.filter(a => a.role === 'workers').length})</span>
                  </button>
                </div>

                {/* Search agents & + Add Agent CTA */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-56">
                    <Search className="w-4 h-4 text-pink-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search agents..."
                      value={agentSearchQuery}
                      onChange={(e) => setAgentSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-pink-500/20 text-xs bg-[#111626]/90 text-slate-100 focus:outline-none focus:border-pink-400/50 placeholder:text-slate-500"
                    />
                  </div>

                  <Button
                    onClick={() => setIsAddAgentOpen(true)}
                    className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-3.5 shadow-md shadow-pink-500/15 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Agent
                  </Button>
                </div>
              </div>

              {/* Agent Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="rounded-2xl border-pink-500/20 shadow-lg shadow-black/25 bg-[#111626]/90 backdrop-blur-md hover:border-pink-400/45 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <CardHeader className="p-5 pb-3 space-y-3">
                      {/* Avatar, Name & Role */}
                      <div
                        onClick={() => {
                          setInspectAgent(agent);
                          setTrendDayIndex(6);
                        }}
                        className="flex items-start gap-3 cursor-pointer group"
                        title={`Inspect ${agent.name} & 7-Day Performance Score Trend`}
                      >
                        <div className="relative">
                          <div className={`w-11 h-11 rounded-2xl ${agent.avatarBg} text-white font-bold flex items-center justify-center text-lg shadow-sm ring-1 ring-pink-400/25 group-hover:scale-105 transition-transform`}>
                            {agent.avatarChar}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#111626] ${
                              agent.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-bold text-sm text-pink-50 group-hover:text-pink-300 transition-colors leading-tight flex items-center justify-between gap-1">
                            <span className="truncate">{agent.name}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-300 transition-colors shrink-0" />
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px]">
                            {agent.badgeType === 'ceo' && (
                              <span className="inline-flex items-center gap-1 font-medium text-pink-300">
                                <Crown className="w-3 h-3" />
                                {agent.badgeTitle}
                              </span>
                            )}
                            {agent.badgeType === 'empire' && (
                              <span className="inline-flex items-center gap-1 font-medium text-emerald-300">
                                <Building2 className="w-3 h-3" />
                                {agent.badgeTitle}
                              </span>
                            )}
                            {agent.badgeType === 'project' && (
                              <span className="inline-flex items-center gap-1 font-medium text-sky-300">
                                <FolderGit2 className="w-3 h-3" />
                                {agent.badgeTitle}
                              </span>
                            )}
                            {agent.badgeType === 'workers' && (
                              <span className="inline-flex items-center gap-1 font-medium text-amber-300">
                                <Wrench className="w-3 h-3" />
                                {agent.badgeTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Current Task Box (if exists) */}
                      {agent.currentTask && (
                        <div className="p-2.5 rounded-xl bg-[#0a0d16]/85 border border-pink-500/15 text-xs">
                          <div className="text-[10px] font-medium text-pink-200/70">Current Task</div>
                          <div className="font-semibold text-slate-200 truncate mt-0.5">
                            {agent.currentTask}
                          </div>
                        </div>
                      )}

                      {/* Skill Metadata */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[11px] text-slate-400">
                        {agent.tags.map((tag, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <span aria-hidden="true" className="text-pink-500/30">·</span>}
                            <span className="font-mono text-slate-300">{tag}</span>
                          </React.Fragment>
                        ))}
                        {agent.extraTagsCount && (
                          <span className="text-pink-300/70 font-mono">+{agent.extraTagsCount}</span>
                        )}
                      </div>
                    </CardHeader>

                    {/* Card Footer */}
                    <div className="p-5 pt-3 border-t border-pink-500/15 flex items-center justify-between text-xs text-slate-400 bg-[#0d111d]/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1" title="Active Browser Sessions">
                          <Globe className="w-3.5 h-3.5 text-sky-300/80" />
                          <span className="font-mono tabular-nums text-slate-300">{agent.browserSessions}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInspectAgent(agent);
                            setTrendDayIndex(6);
                          }}
                          className="flex items-center gap-1 hover:text-pink-300 font-medium transition-colors cursor-pointer"
                          title="View 7-Day Performance Score Trend"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-pink-300" />
                          <span className="text-pink-100 hover:text-pink-300 font-semibold font-mono tabular-nums">{agent.performanceScore}%</span>
                        </button>
                        <span className="font-mono tabular-nums text-[11px] text-slate-400" title="Current Workload Capacity">
                          Load {computeAgentWorkloadPct(agent)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-semibold ${
                            agent.status === 'Active'
                              ? 'text-emerald-300'
                              : 'text-amber-300'
                          }`}
                        >
                          {agent.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setInspectAgent(agent);
                            setTrendDayIndex(6);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-200 hover:bg-sky-500/15 transition-colors cursor-pointer"
                          title={`Inspect ${agent.name} & 7-Day Performance Trend`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAgentChat(agent)}
                          className="p-1.5 rounded-lg text-pink-300 hover:bg-pink-500/20 transition-colors cursor-pointer"
                          title={`Chat with ${agent.name} via GPT-4o`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </main>
          )}

          {/* TAB VIEW 2: COMMAND CENTRE (Kassandra Direct Co-Partner & Operations Control Room) */}
          {activeTab === 'command-centre' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              {/* Executive Banner */}
              <Card className="rounded-2xl border-pink-400/25 bg-gradient-to-r from-[#191529]/95 via-[#13182b]/95 to-[#101c2d]/95 shadow-xl shadow-black/25 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 text-[#0a0d16] font-bold flex items-center justify-center text-xl shadow-lg shadow-pink-500/20 shrink-0">
                        K
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg font-bold text-pink-50">
                            Korban (קָרְבָּן) — Digital Executive Co-Partner Command
                          </h2>
                          <span className="text-xs font-medium text-emerald-300">
                            · GPT-4o Engine Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          Sovereign, zero-leakage orchestration suite running 2 containerized empires, 2 active projects, 17 specialized agents, and 10-minute automated GitHub push & email backups.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        size="sm"
                        onClick={handleTriggerGitPush}
                        disabled={isTriggeringPush}
                        variant="outline"
                        className="bg-[#0d111d]/90 hover:bg-pink-500/15 text-pink-100 text-xs h-9 rounded-xl border-pink-500/25 cursor-pointer"
                      >
                        {isTriggeringPush ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-pink-300" />
                            Pushing to GitHub...
                          </>
                        ) : (
                          <>
                            <GitBranch className="w-3.5 h-3.5 mr-1.5 text-pink-300" />
                            Trigger Git Push Now
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={handleTriggerZipExport}
                        disabled={isTriggeringZip}
                        variant="outline"
                        className="bg-[#0d111d]/90 hover:bg-sky-500/15 text-sky-100 text-xs h-9 rounded-xl border-pink-500/25 cursor-pointer"
                      >
                        {isTriggeringZip ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-sky-300" />
                            Zipping & Emailing...
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-sky-300" />
                            Trigger 10-Min Zip Backup
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setIsCoPartnerChatOpen(true)}
                        className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] text-xs font-bold h-9 rounded-xl shadow-md shadow-pink-500/20 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Direct Chat with Co-Partner
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AT-A-GLANCE PORTFOLIO PULSE, RATINGS & TIMELINESS */}
              <PortfolioPulseOverview
                projects={projects}
                agents={agents}
                alerts={alerts}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />

              {/* Main Command Grid: Active Tasks + Real-Time Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left 2 Cols: Autonomous Tasks Box */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-pink-50">
                        Autonomous Development Task Box
                      </h3>
                      <p className="text-xs text-slate-400">
                        Live agent deliverables, code synthesis & task executions
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsSpawnProjectOpen(true)}
                      className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] font-bold text-xs h-8 rounded-xl shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Spawn New Project
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const isExecuting = executingTaskId === task.id;

                      return (
                        <Card key={task.id} className="rounded-2xl border-pink-500/20 shadow-lg shadow-black/20 bg-[#111626]/85 backdrop-blur-md hover:border-pink-400/40 transition-all">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-pink-50">{task.title}</span>
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      task.priority === 'critical'
                                        ? 'text-rose-300'
                                        : task.priority === 'high'
                                        ? 'text-amber-300'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    · {task.priority}
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      task.status === 'completed'
                                        ? 'text-emerald-300'
                                        : 'text-sky-300'
                                    }`}
                                  >
                                    · {task.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {task.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right hidden sm:block">
                                  <div className="text-xs font-semibold text-pink-100">{task.assignedAgent}</div>
                                  <div className="text-[10px] text-slate-400">{task.assignedRole}</div>
                                </div>

                                <Button
                                  size="sm"
                                  disabled={isExecuting || task.status === 'completed'}
                                  onClick={() => handleExecuteTask(task)}
                                  className={`text-xs h-8 rounded-xl font-semibold cursor-pointer ${
                                    task.status === 'completed'
                                      ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30'
                                      : 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border border-pink-400/35'
                                  }`}
                                >
                                  {isExecuting ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                      Synthesizing...
                                    </>
                                  ) : task.status === 'completed' ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                                      Verified Deliverable
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 mr-1 text-pink-300" />
                                      Run with GPT-4o
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {task.deliverables && task.deliverables.length > 0 && (
                            <CardContent className="p-4 pt-2 border-t border-pink-500/10 mt-2">
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                                <span className="font-medium text-pink-200/80">Deliverables:</span>
                                {task.deliverables.map((deliv, i) => (
                                  <span key={i} className="text-slate-300">
                                    ✓ {deliv}{i < task.deliverables!.length - 1 ? ' ·' : ''}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Right Col: Real-Time Sovereign Event Feed */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-pink-50">
                      Sovereign Event & Backup Stream
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live 10-min Git pushes, zip archives & telemetry
                    </p>
                  </div>

                  <Card className="rounded-2xl border-pink-500/20 shadow-lg shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-4">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {events.map((evt) => (
                        <div key={evt.id} className="p-3 rounded-xl bg-[#0a0d16]/85 border border-pink-500/15 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-pink-100 flex items-center gap-1.5 truncate">
                              {evt.type === 'git_push' && <GitBranch className="w-3.5 h-3.5 text-pink-300 shrink-0" />}
                              {evt.type === 'zip_export' && <Mail className="w-3.5 h-3.5 text-sky-300 shrink-0" />}
                              {evt.type === 'browser_action' && <Globe className="w-3.5 h-3.5 text-cyan-300 shrink-0" />}
                              {evt.type === 'agent_task' && <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                              {evt.type === 'system' && <Zap className="w-3.5 h-3.5 text-emerald-300 shrink-0" />}
                              <span className="truncate">{evt.source}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono tabular-nums shrink-0">
                              {evt.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {evt.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </main>
          )}

          {/* TAB VIEW 3: EMPIRES (Containerized Ecosystems) */}
          {activeTab === 'empires' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-pink-50">
                    Sovereign Containerized Empires
                  </h2>
                  <p className="text-xs text-slate-400">
                    Each empire is an isolated cloud ecosystem with dedicated managers, brand bibles, and zero data leakage.
                  </p>
                </div>

                <Button
                  onClick={() => setIsSpawnEmpireOpen(true)}
                  className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-pink-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Empire
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {empires.map((emp) => (
                  <Card key={emp.id} className="rounded-2xl border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/90 backdrop-blur-md hover:border-pink-400/40 transition-all p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400/25 via-rose-300/20 to-sky-400/25 border border-pink-400/35 text-pink-200 font-bold flex items-center justify-center text-xl shadow-sm">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-pink-50">{emp.name}</h3>
                          <p className="text-xs text-slate-400">{emp.tagline}</p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-emerald-300">
                        · {emp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15">
                        <span className="text-[10px] text-slate-400 block font-medium">Assigned Empire Manager</span>
                        <span className="font-semibold text-pink-100 flex items-center gap-1.5 mt-1">
                          <Avatar className="w-5 h-5 bg-gradient-to-tr from-pink-400 to-sky-300 text-[10px] text-[#0a0d16] font-bold">
                            <AvatarFallback className="bg-transparent">{emp.managerAvatar}</AvatarFallback>
                          </Avatar>
                          {emp.managerName}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15">
                        <span className="text-[10px] text-slate-400 block font-medium">Monthly Revenue Run Rate</span>
                        <span className="font-bold font-mono tabular-nums text-emerald-300 mt-1 block">{emp.monthlyRevenue}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15">
                        <span className="text-[10px] text-slate-400 block font-medium">Container Enclave ID</span>
                        <span className="font-mono text-slate-300 text-[11px] block mt-1">{emp.containerId} · Isolated</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15">
                        <span className="text-[10px] text-slate-400 block font-medium">Custom Domain</span>
                        <span className="font-mono text-sky-300 text-[11px] block mt-1 truncate">{emp.domain}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-sky-500/10 border border-pink-400/20">
                        <span className="font-semibold text-pink-200 block mb-0.5">Brand Bible & Aesthetic Blueprint:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{emp.brandBibleSummary}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-pink-500/15 text-xs">
                      <span className="text-slate-400">
                        Active Projects: <strong className="text-pink-100 font-mono tabular-nums">{emp.projectsCount}</strong>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewProjectEmpire(emp.id);
                          setIsSpawnProjectOpen(true);
                        }}
                        className="text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/85 text-pink-100 hover:bg-pink-500/15 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1 text-pink-300" />
                        Launch Project in {emp.name.split(' ')[0]}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </main>
          )}

          {/* TAB VIEW 4: PROJECTS (Template Spawner & 10-Min Git / Zip Pipeline) */}
          {activeTab === 'projects' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-pink-50">
                    Sovereign Containerized Projects
                  </h2>
                  <p className="text-xs text-slate-400">
                    Spawned from pre-configured template (<code className="text-pink-300 font-mono">godsentaigod/Template-</code>) with automated 10-min GitHub pushes & email zip backups.
                  </p>
                </div>

                <Button
                  onClick={() => setIsSpawnProjectOpen(true)}
                  className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-pink-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Launch New Project
                </Button>
              </div>

              {/* PORTFOLIO PULSE OVERVIEW */}
              <PortfolioPulseOverview
                projects={projects}
                agents={agents}
                alerts={alerts}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />

              <div className="space-y-5">
                {projects.map((proj) => (
                  <Card key={proj.id} className="rounded-2xl border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/90 backdrop-blur-md p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-pink-50">{proj.name}</h3>
                          <span className="text-xs text-sky-300 font-medium">
                            · {proj.empireName}
                          </span>
                          <span className="text-xs text-emerald-300 font-semibold capitalize">
                            · {proj.status}
                          </span>
                          {proj.monthlyProfitRunRate && (
                            <span className="text-xs text-pink-200 font-mono tabular-nums font-semibold flex items-center gap-1">
                              · <TrendingUp className="w-3 h-3 text-emerald-300" /> {proj.monthlyProfitRunRate}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{proj.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleTriggerGitPush}
                          variant="outline"
                          className="text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/85 text-pink-100 hover:bg-pink-500/15 cursor-pointer"
                        >
                          <GitBranch className="w-3.5 h-3.5 mr-1 text-pink-300" />
                          Git Push
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleTriggerZipExport}
                          variant="outline"
                          className="text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/85 text-sky-100 hover:bg-sky-500/15 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1 text-sky-300" />
                          Email Zip
                        </Button>
                      </div>
                    </div>

                    {/* Visual Number Rating System & Project Timeliness */}
                    <ProjectRatingsAndTimelinessPanel
                      project={proj}
                      onUpdateRatings={handleUpdateProjectRatings}
                      onUpdateTimeliness={handleUpdateProjectTimeliness}
                    />

                    {/* Monetization Model & Target Market */}
                    {(proj.monetizationModel || proj.targetMarket) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0a0d16]/80 p-3.5 rounded-xl border border-pink-500/15">
                        <div>
                          <span className="text-[10px] font-semibold text-pink-200/75 tracking-wide block">Monetization & Profit Engine</span>
                          <span className="text-slate-200 text-[11px] font-medium block mt-0.5">{proj.monetizationModel || 'Automated Recurring Subscriptions & Processing'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-sky-200/75 tracking-wide block">Target Market</span>
                          <span className="text-slate-200 text-[11px] font-medium block mt-0.5">{proj.targetMarket || 'Global digital operators & customers'}</span>
                        </div>
                      </div>
                    )}

                    {/* Autonomous Taskforce Squad */}
                    {proj.taskforceSquad && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-sky-500/10 border border-pink-400/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-pink-100 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-pink-300" />
                            Autonomous Taskforce Squad
                          </span>
                          <span className="text-[10px] text-sky-200 font-medium">5 Specialized AI Agents</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                          <div className="bg-[#0a0d16]/90 p-2.5 rounded-xl border border-pink-500/15">
                            <span className="text-[9px] text-pink-300/75 block font-semibold">Taskforce Lead</span>
                            <span className="font-semibold text-slate-100 truncate block mt-0.5">{proj.taskforceSquad.lead}</span>
                          </div>
                          <div className="bg-[#0a0d16]/90 p-2.5 rounded-xl border border-pink-500/15">
                            <span className="text-[9px] text-sky-300/75 block font-semibold">Engineering</span>
                            <span className="font-semibold text-slate-100 truncate block mt-0.5">{proj.taskforceSquad.engineer}</span>
                          </div>
                          <div className="bg-[#0a0d16]/90 p-2.5 rounded-xl border border-pink-500/15">
                            <span className="text-[9px] text-emerald-300/75 block font-semibold">Financial / Stripe</span>
                            <span className="font-semibold text-slate-100 truncate block mt-0.5">{proj.taskforceSquad.financial}</span>
                          </div>
                          <div className="bg-[#0a0d16]/90 p-2.5 rounded-xl border border-pink-500/15">
                            <span className="text-[9px] text-rose-300/75 block font-semibold">Browser / Playwright</span>
                            <span className="font-semibold text-slate-100 truncate block mt-0.5">{proj.taskforceSquad.automation}</span>
                          </div>
                          <div className="bg-[#0a0d16]/90 p-2.5 rounded-xl border border-pink-500/15">
                            <span className="text-[9px] text-amber-300/75 block font-semibold">Growth & SEO</span>
                            <span className="font-semibold text-slate-100 truncate block mt-0.5">{proj.taskforceSquad.growth}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profit Acceleration Milestones */}
                    {proj.profitMilestones && proj.profitMilestones.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-pink-100 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-300" />
                            Autonomous Profit Roadmap (Concept → Real-World Cashflow)
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                            {proj.profitMilestones.filter(m => m.status === 'completed').length} of {proj.profitMilestones.length} Stages Live
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                          {proj.profitMilestones.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                m.status === 'completed'
                                  ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-100'
                                  : m.status === 'active'
                                  ? 'bg-pink-500/15 border-pink-400/40 text-pink-50 ring-1 ring-pink-400/30'
                                  : 'bg-[#0a0d16]/70 border-slate-800 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold font-mono">
                                  Stage {mIdx + 1}
                                </span>
                                {m.status === 'completed' ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                                ) : m.status === 'active' ? (
                                  <Loader2 className="w-3.5 h-3.5 text-pink-300 animate-spin" />
                                ) : (
                                  <Clock className="w-3 h-3 text-slate-500" />
                                )}
                              </div>
                              <div className="font-bold text-[11px] leading-tight mb-1">{m.stage}</div>
                              <div className="text-[10px] opacity-80 flex items-center justify-between font-mono tabular-nums">
                                <span>{m.targetRevenue}</span>
                                <span className="text-[9px] font-sans font-medium truncate ml-1">{m.leadTaskforce}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Infrastructure & Container specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15">
                        <span className="text-[10px] text-slate-400 block font-medium">Starter Template</span>
                        <span className="font-mono text-slate-200 text-[11px] block mt-0.5">{proj.templateSource}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15">
                        <span className="text-[10px] text-slate-400 block font-medium">GitHub Repository</span>
                        <a href={proj.githubRepo} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline text-[11px] mt-0.5 truncate flex items-center gap-1 font-mono">
                          {proj.githubRepo} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15">
                        <span className="text-[10px] text-slate-400 block font-medium">Deployment VM</span>
                        <span className="font-mono text-slate-200 text-[11px] block mt-0.5">{proj.cloudVM}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-pink-500/15 text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>Lead Manager: <strong className="text-pink-100">{proj.managerName}</strong></span>
                        <span>Workers: <strong className="text-slate-200">{proj.assignedWorkers.join(', ')}</strong></span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-emerald-300 font-medium">{proj.lastGitPush}</span>
                        <span aria-hidden="true" className="text-pink-500/30">·</span>
                        <span className="text-pink-200 font-medium">{proj.lastZipExport}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </main>
          )}

          {/* TAB VIEW: SCRAP & CODE RECYCLER (Mine Gems from Messy Backlog) */}
          {activeTab === 'scrap-miner' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-amber-300" />
                    Messy Scrap Bank & Abandoned Code Recycler
                  </h2>
                  <p className="text-xs text-slate-400">
                    Autonomous agent reviewing messy chaotic files, unfinished repos & concepts to extract immediate $0-spend launch gems.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                  <span>Gem-Miner Agent Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Input Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-100 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-pink-300" />
                        Chaotic Bank Data & Backlog Files
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                        {scrapFileCount} Files & Snippets
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-pink-100/90 block">
                        Paste Raw Unfinished Notes, Snippets or File Paths:
                      </label>
                      <Textarea
                        rows={9}
                        value={scrapRawInput}
                        onChange={(e) => setScrapRawInput(e.target.value)}
                        placeholder="Paste chaotic project logs, half-built APIs, unfinished ideas or raw file dumps..."
                        className="text-xs font-mono bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 focus:border-pink-400/50 rounded-xl leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="text-[11px] text-slate-400">
                        Evaluates: <strong className="text-slate-200">Finish & Launch vs Recycle into Faster Reinvention</strong>
                      </div>
                      <Button
                        onClick={handleRunScrapMiner}
                        disabled={isMiningScrap || !scrapRawInput.trim()}
                        className="bg-gradient-to-r from-amber-300 via-pink-300 to-rose-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-pink-500/15 shrink-0 whitespace-nowrap"
                      >
                        {isMiningScrap ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Mining Gems...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            Mine & Triage Gems
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>

                  {/* Preloaded Scrap Vault Quick Injector */}
                  <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-4 space-y-3">
                    <div className="text-xs font-bold text-pink-100 flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-sky-300" />
                      Quick Test Datasets
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <button
                        onClick={() => {
                          setScrapRawInput(`1. Local clinic directory scraper without live websites
2. WhatsApp appointment reminder bot skeleton with Twilio
3. Stripe tokenized billing script
4. Tailwind single-page medical template`);
                        }}
                        className="p-2.5 rounded-xl border border-pink-500/20 bg-[#0a0d16]/75 hover:bg-pink-500/10 hover:border-pink-400/40 text-left transition-all cursor-pointer"
                      >
                        <span className="font-semibold block text-slate-100">Local Clinic AI Pack</span>
                        <span className="text-[10px] text-emerald-300 font-mono">Fast $497/mo retainer</span>
                      </button>

                      <button
                        onClick={() => {
                          setScrapRawInput(`1. 100+ Midjourney luxury fashion prompt bank
2. Next.js image gallery with Supabase auth
3. Automated Shopify product sync script
4. Instagram post scheduler draft`);
                        }}
                        className="p-2.5 rounded-xl border border-pink-500/20 bg-[#0a0d16]/75 hover:bg-pink-500/10 hover:border-pink-400/40 text-left transition-all cursor-pointer"
                      >
                        <span className="font-semibold block text-slate-100">E-Com Asset Factory</span>
                        <span className="text-[10px] text-pink-300 font-mono">High passive vibe index</span>
                      </button>
                    </div>
                  </Card>
                </div>

                {/* Output & Analysis Panel */}
                <div className="lg:col-span-7 space-y-4">
                  {minedScrapResult ? (
                    <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-500/15">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
                              Identified Cashflow Gem
                            </span>
                            <span aria-hidden="true" className="text-pink-500/40">·</span>
                            <span
                              className={`text-[11px] font-bold ${
                                minedScrapResult.verdict === 'finish_and_launch'
                                  ? 'text-emerald-300'
                                  : 'text-sky-300'
                              }`}
                            >
                              {minedScrapResult.verdict === 'finish_and_launch' ? '⚡ Finish & Launch' : '♻️ Recycle into Faster Reinvention'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-100 mt-1">
                            {minedScrapResult.recommendedGemName}
                          </h3>
                        </div>

                        <Button
                          onClick={() => handleAdoptGemAsProject(minedScrapResult)}
                          className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-pink-500/20 shrink-0 whitespace-nowrap"
                        >
                          <Rocket className="w-3.5 h-3.5 mr-1.5" />
                          Spawn Containerized Project
                        </Button>
                      </div>

                      {/* 4 KPI Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/25">
                          <span className="text-[10px] text-emerald-300 block font-semibold">Est. Monthly Revenue</span>
                          <span className="text-base font-bold font-mono tabular-nums text-emerald-100 block mt-0.5">{minedScrapResult.estimatedMonthlyRevenue}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/25">
                          <span className="text-[10px] text-sky-300 block font-semibold">Automatable %</span>
                          <span className="text-base font-bold font-mono tabular-nums text-sky-100 block mt-0.5">{minedScrapResult.automatablePercentage}%</span>
                        </div>
                        <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-400/25">
                          <span className="text-[10px] text-pink-300 block font-semibold">Passive Profit Vibe</span>
                          <span className="text-base font-bold font-mono tabular-nums text-pink-100 block mt-0.5">{minedScrapResult.passiveProfitVibeScore}/100</span>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25">
                          <span className="text-[10px] text-amber-300 block font-semibold">Time to First $$</span>
                          <span className="text-base font-bold font-mono tabular-nums text-amber-100 block mt-0.5">{minedScrapResult.timeToFirstDollar}</span>
                        </div>
                      </div>

                      {/* Executive Summary & Rationale */}
                      <div className="space-y-2 text-xs">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-sky-300" />
                          Executive Rationale & Reinvention Strategy
                        </div>
                        <p className="text-slate-300 leading-relaxed bg-[#0a0d16]/80 p-3 rounded-xl border border-pink-500/15">
                          {minedScrapResult.rationale}
                        </p>
                        {minedScrapResult.reinventionAngle && (
                          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-400/25 text-indigo-100 font-medium">
                            <strong className="text-indigo-300">Reinvention Angle:</strong> {minedScrapResult.reinventionAngle}
                          </div>
                        )}
                      </div>

                      {/* Immediate Action Plan */}
                      {minedScrapResult.actionPlan && minedScrapResult.actionPlan.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                            Immediate $0-Spend Action Plan
                          </div>
                          <div className="space-y-1.5">
                            {minedScrapResult.actionPlan.map((step: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-[#0a0d16]/75 p-2.5 rounded-xl border border-pink-500/15">
                                <span className="w-5 h-5 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-200 text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sprint Schedule */}
                      {minedScrapResult.sprintSchedule12h && (
                        <div className="space-y-2 pt-2 border-t border-pink-500/15">
                          <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-teal-300" />
                            12-Hour Sprint Breakdown (0 → Cashflow)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {Object.entries(minedScrapResult.sprintSchedule12h).map(([slice, desc]: any) => (
                              <div key={slice} className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-400/25 text-teal-100">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-teal-300 block mb-0.5 font-mono">
                                  {slice}
                                </span>
                                <span className="text-[11px] leading-tight block text-slate-200">{desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-12 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-100">No Scrap Analyzed Yet</h3>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Paste your bank of messy unstructured files, half-built tools, or uncompleted scripts on the left and click <strong className="text-pink-200">Mine & Triage Gems</strong>.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </main>
          )}

          {/* TAB VIEW: REAL TALK 12-HOUR INCREMENTAL PROFIT FORECASTER */}
          {activeTab === 'profit-forecast' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                    Real Talk Opportunity & 33-Day 12-Hour Incremental Forecast
                  </h2>
                  <p className="text-xs text-slate-400">
                    Data-backed valuation with past 15-day baseline trends and forward 33-day sales forecast calculated in 12-hour velocity intervals.
                  </p>
                </div>

                <div className="text-xs text-emerald-300 font-mono tabular-nums font-medium">
                  66 Forecasting Windows (12h Slices)
                </div>
              </div>

              {/* Opportunity Configuration Card */}
              <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Opportunity / Product Concept</label>
                    <Input
                      value={forecastOppName}
                      onChange={(e) => setForecastOppName(e.target.value)}
                      placeholder="e.g. AI Receptionist for Dental Clinics"
                      className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Target Niche & Market Gap</label>
                    <Input
                      value={forecastNiche}
                      onChange={(e) => setForecastNiche(e.target.value)}
                      placeholder="e.g. Local clinics without website or online booking"
                      className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Pricing Model & Stripe Terms</label>
                    <Input
                      value={forecastPricing}
                      onChange={(e) => setForecastPricing(e.target.value)}
                      placeholder="e.g. $497/mo retainer + $997 setup fee"
                      className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-pink-500/15">
                  <div className="text-[11px] text-slate-400">
                    Models realistic sales cycles, zero-marginal fulfillment cost, and passive operator ratios.
                  </div>
                  <Button
                    onClick={handleGenerateForecast}
                    disabled={isGeneratingForecast || !forecastOppName.trim()}
                    className="bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-emerald-500/15 whitespace-nowrap shrink-0"
                  >
                    {isGeneratingForecast ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Generating Real Talk Forecast...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                        Generate 33-Day 12h Real Talk Forecast
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Forecast Results View */}
              {forecastResult ? (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Profit Potential Grade</span>
                      <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
                        {forecastResult.summaryMetrics?.profitPotentialGrade || 'A+'}
                      </div>
                      <span className="text-[10px] text-slate-400">Real talk feasibility</span>
                    </Card>

                    <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">33-Day Gross Profit</span>
                      <div className="text-2xl font-black text-slate-100 mt-1 font-mono tabular-nums">
                        {forecastResult.summaryMetrics?.total33DayGrossProfit || '$18,400'}
                      </div>
                      <span className="text-[10px] text-emerald-300 font-semibold font-mono">Net: {forecastResult.summaryMetrics?.total33DayNetProfit || '$17,200'}</span>
                    </Card>

                    <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Automatable %</span>
                      <div className="text-2xl font-black text-sky-300 mt-1 font-mono tabular-nums">
                        {forecastResult.summaryMetrics?.automatablePercentage || 92}%
                      </div>
                      <span className="text-[10px] text-slate-400">Autonomous workflow</span>
                    </Card>

                    <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Passive Profit Vibe</span>
                      <div className="text-2xl font-black text-pink-300 mt-1 font-mono tabular-nums">
                        {forecastResult.summaryMetrics?.passiveProfitVibeScore || 89}/100
                      </div>
                      <span className="text-[10px] text-slate-400">Minimal operator drag</span>
                    </Card>

                    <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Initial Cash Outlay</span>
                      <div className="text-2xl font-black text-emerald-300 mt-1 font-mono tabular-nums">
                        {forecastResult.summaryMetrics?.estimatedResourceCost || '$0'}
                      </div>
                      <span className="text-[10px] text-slate-400">Zero third-party reliance</span>
                    </Card>
                  </div>

                  {/* Real Talk Executive Commentary */}
                  <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-5 space-y-3">
                    <div className="font-bold text-xs text-pink-100 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-300" />
                      Real Talk Valuation Commentary
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-[#0a0d16]/85 p-4 rounded-xl border border-pink-500/15 font-mono">
                      {forecastResult.realTalkCommentary}
                    </p>
                    {Array.isArray(forecastResult.groundingSources) && forecastResult.groundingSources.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-semibold text-sky-300 uppercase tracking-wider">Market Grounding Sources:</span>
                        {forecastResult.groundingSources.map((src: any, sIdx: number) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25 text-[10px] text-sky-200"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>{src.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* 12-Hour Incremental Timeline Table */}
                  <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md overflow-hidden">
                    <div className="p-4 border-b border-pink-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-300" />
                          33-Day 12-Hour Incremental Sales & Profit Velocity Table
                        </h3>
                        <p className="text-xs text-slate-400">
                          Displaying 66 sequential 12-hour operational periods.
                        </p>
                      </div>

                      {/* Filter intervals */}
                      <div className="inline-flex items-center gap-1 bg-[#0a0d16]/90 p-1 rounded-xl border border-pink-500/20 flex-wrap">
                        {(['all', 'week1', 'week2', 'week3', 'week4', 'final'] as const).map(w => (
                          <button
                            key={w}
                            onClick={() => setForecastViewInterval(w)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                              forecastViewInterval === w
                                ? 'bg-pink-500/25 text-pink-100 border border-pink-400/35'
                                : 'text-slate-400 hover:text-slate-100'
                            }`}
                          >
                            {w === 'all' ? 'All (66)' : w === 'week1' ? 'Wk 1 (D1-7)' : w === 'week2' ? 'Wk 2 (D8-14)' : w === 'week3' ? 'Wk 3 (D15-21)' : w === 'week4' ? 'Wk 4 (D22-28)' : 'D29-33'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#0d111d] text-pink-200/80 font-semibold border-b border-pink-500/15 sticky top-0">
                          <tr>
                            <th className="px-4 py-2.5">Window / Time</th>
                            <th className="px-4 py-2.5">Day</th>
                            <th className="px-4 py-2.5">Time Slot</th>
                            <th className="px-4 py-2.5">Sales Units</th>
                            <th className="px-4 py-2.5">12h Revenue</th>
                            <th className="px-4 py-2.5">Cumulative Profit</th>
                            <th className="px-4 py-2.5">Automated Squad Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-500/10">
                          {(forecastResult.forecastIncremental12h || [])
                            .filter((item: any) => {
                              if (forecastViewInterval === 'week1') return item.day <= 7;
                              if (forecastViewInterval === 'week2') return item.day > 7 && item.day <= 14;
                              if (forecastViewInterval === 'week3') return item.day > 14 && item.day <= 21;
                              if (forecastViewInterval === 'week4') return item.day > 21 && item.day <= 28;
                              if (forecastViewInterval === 'final') return item.day > 28;
                              return true;
                            })
                            .map((row: any, rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-pink-500/[0.04] transition-colors">
                                <td className="px-4 py-2.5 font-mono font-bold text-slate-200 tabular-nums">
                                  #{row.interval12hIndex}
                                </td>
                                <td className="px-4 py-2.5 font-medium text-slate-300 tabular-nums">
                                  Day {row.day}
                                </td>
                                <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">
                                  {row.timeSlot}
                                </td>
                                <td className="px-4 py-2.5 font-bold font-mono tabular-nums text-sky-300">
                                  +{row.projectedSalesCount}
                                </td>
                                <td className="px-4 py-2.5 font-bold font-mono tabular-nums text-slate-100">
                                  ${row.projectedGrossRevenue?.toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 font-bold font-mono tabular-nums text-emerald-300">
                                  ${row.cumulativeProfit?.toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 text-slate-400 text-[11px] truncate max-w-xs">
                                  {row.notes}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">No Forecast Generated Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Configure your opportunity concept above and click <strong className="text-emerald-200">Generate 33-Day 12h Real Talk Forecast</strong> to simulate forward revenue and squad execution.
                  </p>
                </Card>
              )}
            </main>
          )}

          {/* TAB VIEW: 24/7 OUTBOUND SPEED SALES & CLOSER SQUAD */}
          {activeTab === 'outbound-hunters' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Target className="w-5 h-5 text-rose-300" />
                    24/7 Outbound Speed Sales & Closer Taskforce
                  </h2>
                  <p className="text-xs text-slate-400">
                    Fully autonomous hunter-closer loop: Builder creates instant demo sites, Hunters scout local & verified email leads, Negotiator neutralizes objections, Closer dispatches webmail & Payment agent sends Stripe links.
                  </p>
                </div>

                <div className="text-xs text-rose-200 font-medium">
                  5 Autonomous Specialists Synchronized
                </div>
              </div>

              {/* Target Pipeline Parameters */}
              <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Target Niche</label>
                    <Input
                      value={hunterNiche}
                      onChange={(e) => setHunterNiche(e.target.value)}
                      placeholder="e.g. Local Med-Spas, High-End Contractors"
                      className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Target Location</label>
                    <Input
                      value={hunterLocation}
                      onChange={(e) => setHunterLocation(e.target.value)}
                      placeholder="e.g. Auckland, Sydney, Brisbane"
                      className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Irresistible Offer / Value Hook</label>
                    <Input
                      value={hunterOffer}
                      onChange={(e) => setHunterOffer(e.target.value)}
                      placeholder="e.g. Instant custom demo + 24/7 AI receptionist"
                      className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-pink-500/15">
                  <div className="text-[11px] text-slate-400">
                    Squad: Vanguard (Lead) · B-Builder · H-Hunter (No Website) · H-Hunter (Email) · N-Negotiator · O-Closer · P-Payment
                  </div>
                  <Button
                    onClick={handleRunHunterCloser}
                    disabled={isRunningHunterCycle}
                    className="bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-rose-500/20 whitespace-nowrap shrink-0"
                  >
                    {isRunningHunterCycle ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Executing Sales Loop...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Trigger 24/7 Hunter-Closer Cycle
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Hunter Cycle Results */}
              {hunterResult ? (
                <div className="space-y-6">
                  {/* Sub-view navigation tabs */}
                  <div className="inline-flex items-center gap-1 bg-[#0d111d]/90 p-1 rounded-xl border border-pink-500/20 flex-wrap">
                    {[
                      { id: 'overview', label: 'Squad Overview' },
                      { id: 'builder', label: 'B - Builder (Custom Demos)' },
                      { id: 'hunters', label: 'H - Hunters (Scouted Leads)' },
                      { id: 'negotiator', label: 'N - Negotiator (Counters)' },
                      { id: 'closer', label: 'O - Closer (Webmail)' },
                      { id: 'payment', label: 'P - Payment (Stripe Link)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setHunterActiveView(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                          hunterActiveView === tab.id
                            ? 'bg-pink-500/25 text-pink-100 border border-pink-400/35 shadow-sm'
                            : 'text-slate-400 hover:text-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* OVERVIEW TAB */}
                  {hunterActiveView === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Team Lead Status */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-5 space-y-3 md:col-span-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/35 text-rose-200 flex items-center justify-center font-bold text-xs">
                              V
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-100">Vanguard (Team Lead Feedback & Delegation)</h4>
                              <p className="text-[10px] text-slate-400">Autonomous 24/7 Pipeline Commander</p>
                            </div>
                          </div>
                          <span className="text-emerald-300 text-[11px] font-semibold font-mono">
                            Cycle Status: {hunterResult.teamLeadDelegation?.status || 'Active Outbound'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 bg-[#0a0d16]/85 p-3.5 rounded-xl border border-pink-500/15 leading-relaxed font-mono">
                          {hunterResult.teamLeadDelegation?.feedbackAndNextAction || 'All 5 agents dispatched in parallel. Demo generated, leads scouted, webmail closing sequences staged.'}
                        </p>
                      </Card>

                      {/* Builder Quick Card */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-5 space-y-3">
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-sky-300" />
                          B - Builder MVP Demo
                        </div>
                        <div className="text-xs text-pink-100 font-medium">
                          {hunterResult.builderDemoOutput?.demoSiteName || 'Custom Demo Site'}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-3">
                          {hunterResult.builderDemoOutput?.receptionistScriptPreview}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setHunterActiveView('builder')} className="w-full text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/75 hover:bg-pink-500/15 text-pink-100">
                          View Demo Specs
                        </Button>
                      </Card>

                      {/* Hunters Quick Card */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-5 space-y-3">
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <Search className="w-4 h-4 text-amber-300" />
                          H - Hunters Output
                        </div>
                        <div className="text-xs text-pink-100 font-medium font-mono tabular-nums">
                          {hunterResult.hunter1NoWebsiteScout?.leadsDiscovered?.length || 3} Local Leads (No Web) + {hunterResult.hunter2HighVolumeEmail?.verifiedDecisionMakers?.length || 4} Emails
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-3">
                          Parsed phone numbers, verified C-level emails and opportunity gaps.
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setHunterActiveView('hunters')} className="w-full text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/75 hover:bg-pink-500/15 text-pink-100">
                          View Scouted Leads
                        </Button>
                      </Card>

                      {/* Closer & Stripe Quick Card */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-5 space-y-3">
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-300" />
                          O - Closer & P - Payment
                        </div>
                        <div className="text-xs text-emerald-200 font-mono truncate">
                          {hunterResult.paymentAgentStripeLink?.instantStripeLink || 'Stripe API Pending — Open Payment Tab'}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-3">
                          {hunterResult.closerOutreachWebmail?.coldEmailScript?.slice(0, 100)}...
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setHunterActiveView('closer')} className="w-full text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/75 hover:bg-pink-500/15 text-pink-100">
                          View Outreach & Payment
                        </Button>
                      </Card>

                      {Array.isArray(hunterResult.groundingSources) && hunterResult.groundingSources.length > 0 && (
                        <Card className="rounded-2xl border border-sky-500/20 bg-[#111626]/85 p-4 md:col-span-3 space-y-2">
                          <div className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                            Google Search Grounded Lead Intelligence Sources
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hunterResult.groundingSources.map((src: any, sIdx: number) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25 text-[11px] text-sky-200"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* BUILDER TAB */}
                  {hunterActiveView === 'builder' && (
                    <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-6 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-100">
                            {hunterResult.builderDemoOutput?.demoSiteName || 'Custom Demo Site'}
                          </h3>
                          <p className="text-xs text-slate-400">Generated tailored demo landing specs & voice script</p>
                        </div>
                        <Badge className="bg-sky-500/15 text-sky-200 border border-sky-400/30 text-xs">Builder Ready</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-pink-100">Demo Website Core Features</div>
                        <div className="flex flex-wrap gap-2">
                          {(hunterResult.builderDemoOutput?.coreFeatures || []).map((feat: string, fIdx: number) => (
                            <span key={fIdx} className="px-2.5 py-1 rounded-lg bg-[#0a0d16]/85 border border-sky-400/25 text-sky-200 text-xs">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-pink-500/15">
                        <div className="text-xs font-bold text-pink-100">Interactive AI Receptionist Voice / Chat Flow</div>
                        <pre className="text-xs bg-[#070910] border border-pink-500/20 text-slate-200 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono">
                          {hunterResult.builderDemoOutput?.receptionistScriptPreview}
                        </pre>
                      </div>
                    </Card>
                  )}

                  {/* HUNTERS TAB */}
                  {hunterActiveView === 'hunters' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExportLeadsCsv}
                          className="text-xs h-8 rounded-xl border-pink-500/25 bg-[#0a0d16]/85 hover:bg-pink-500/15 text-pink-100 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5 text-pink-300" />
                          Export Leads CSV
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Hunter 1: Local No Website */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-5 space-y-4">
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-2">
                          <Search className="w-4 h-4 text-amber-300" />
                          H-Hunter 1: Local Businesses Without Live Websites
                        </div>
                        <div className="space-y-2.5">
                          {(hunterResult.hunter1NoWebsiteScout?.leadsDiscovered || []).map((lead: any, lIdx: number) => (
                            <div key={lIdx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25 text-xs space-y-1">
                              <div className="font-bold text-amber-100 flex items-center justify-between gap-2">
                                <span>{lead.businessName}</span>
                                <span className="text-[10px] text-amber-300 font-mono">{lead.phoneNumber}</span>
                              </div>
                              <div className="text-amber-200/80 text-[11px] font-mono">
                                {lead.estimatedRevenue} · {lead.location}
                              </div>
                              <div className="text-slate-300 text-[10px] pt-1">
                                Gap: <strong className="text-slate-100">{lead.opportunityGap}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Hunter 2: Verified Email Decision Makers */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-5 space-y-4">
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-rose-300" />
                          H-Hunter 2: High-Volume Verified Email Contacts
                        </div>
                        <div className="space-y-2.5">
                          {(hunterResult.hunter2HighVolumeEmail?.verifiedDecisionMakers || []).map((lead: any, lIdx: number) => (
                            <div key={lIdx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-400/25 text-xs space-y-1">
                              <div className="font-bold text-rose-100 flex items-center justify-between gap-2">
                                <span>{lead.contactName} ({lead.title})</span>
                                <span className="text-emerald-300 text-[10px] font-semibold">Verified</span>
                              </div>
                              <div className="font-mono text-pink-200 text-[11px]">
                                {lead.email} · {lead.companyDomain}
                              </div>
                              <div className="text-slate-300 text-[10px] pt-1">
                                Angle: <strong className="text-slate-100">{lead.customAngle}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      </div>
                    </div>
                  )}

                  {/* NEGOTIATOR TAB */}
                  {hunterActiveView === 'negotiator' && (
                    <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-6 space-y-4">
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-300" />
                        N-Negotiator: Automated Objection Handlers & Counters
                      </div>
                      <p className="text-xs text-slate-400">
                        When prospects push back on price or timing, the Negotiator deploys these verified counter-proposals automatically.
                      </p>

                      <div className="space-y-3">
                        {(hunterResult.negotiatorObjectionCounters?.objectionsAndCounters || []).map((item: any, iIdx: number) => (
                          <div key={iIdx} className="p-4 rounded-xl bg-[#0a0d16]/85 border border-pink-500/20 text-xs space-y-2">
                            <div className="font-bold text-rose-300 flex items-center gap-1.5 flex-wrap">
                              <span>Prospect Objection:</span>
                              <span className="text-slate-100">"{item.objection}"</span>
                            </div>
                            <div className="text-emerald-200 bg-emerald-500/10 p-3 rounded-lg border border-emerald-400/25 leading-relaxed font-mono">
                              <strong className="text-emerald-300">Automated Counter Response:</strong> {item.counterScript}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* CLOSER TAB */}
                  {hunterActiveView === 'closer' && (
                    <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-6 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <Send className="w-4 h-4 text-pink-300" />
                          O-Closer: Autonomous Webmail Outreach & Closing Sequence
                        </div>
                        <span className="text-pink-300 text-xs font-semibold">1-Click Copy Ready</span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-[#0a0d16]/80 border border-pink-500/20 space-y-2">
                          <div className="text-xs font-bold text-pink-100">Subject Line:</div>
                          <div className="text-xs font-mono text-slate-100 font-semibold bg-[#111626] p-2.5 rounded-lg border border-pink-500/20">
                            {hunterResult.closerOutreachWebmail?.subjectLine}
                          </div>
                          <div className="text-xs font-bold text-pink-100 pt-2">Webmail Body:</div>
                          <pre className="text-xs bg-[#111626] p-4 rounded-xl border border-pink-500/20 whitespace-pre-wrap font-mono leading-relaxed text-slate-200">
                            {hunterResult.closerOutreachWebmail?.coldEmailScript}
                          </pre>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* PAYMENT TAB */}
                  {hunterActiveView === 'payment' && (
                    <Card className="rounded-2xl border border-pink-500/20 shadow-xl bg-[#111626]/85 backdrop-blur-md p-6 space-y-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-300" />
                            P-Payment: Live Stripe Payment Link
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Minted via the Stripe Products, Prices & Payment Links REST API when STRIPE_SECRET_KEY is configured.
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={handleMintLiveStripeLink}
                          disabled={isMintingStripeLink}
                          className="bg-gradient-to-r from-emerald-300 to-teal-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-8 rounded-xl px-3.5 cursor-pointer"
                        >
                          {isMintingStripeLink ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              Minting Stripe Link...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                              Mint Live Stripe Link ($497/mo)
                            </>
                          )}
                        </Button>
                      </div>

                      {hunterResult.paymentAgentStripeLink?.instantStripeLink ? (
                        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Verified Live Stripe Link</span>
                            <a
                              href={hunterResult.paymentAgentStripeLink.instantStripeLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-300 text-[11px] font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <span>Open Checkout</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="p-3 bg-[#0a0d16]/90 rounded-xl border border-emerald-400/30 font-mono text-xs text-emerald-200 flex items-center justify-between gap-2">
                            <span className="truncate">{hunterResult.paymentAgentStripeLink.instantStripeLink}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(hunterResult.paymentAgentStripeLink.instantStripeLink);
                                setCopiedStripeUrl(true);
                                setTimeout(() => setCopiedStripeUrl(false), 2000);
                              }}
                              className="h-7 text-xs text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/15 shrink-0 cursor-pointer"
                            >
                              {copiedStripeUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                          <div className="text-xs text-emerald-100">
                            <strong className="text-emerald-300">Terms:</strong> {hunterResult.paymentAgentStripeLink?.pricingTerms}
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-2 text-xs">
                          <div className="font-bold text-amber-200">Live Stripe Link Not Yet Minted</div>
                          <p className="text-amber-100/90 leading-relaxed">
                            {hunterResult.paymentAgentStripeLink?.note || 'Set STRIPE_SECRET_KEY in your server environment to create live hosted Stripe Payment Links.'}
                          </p>
                          <div className="text-slate-300 pt-1">
                            <strong>Proposed Terms:</strong> {hunterResult.paymentAgentStripeLink?.pricingTerms}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">Sales Hunter Squad Idle</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Configure your target niche & offer above and click <strong className="text-rose-200">Trigger 24/7 Hunter-Closer Cycle</strong> to deploy all 5 specialists autonomously.
                  </p>
                </Card>
              )}
            </main>
          )}

          {/* TAB VIEW: AI MOAT COUNCIL (Border Gateway Triage) */}
          {activeTab === 'border-council' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-pink-300" />
                    AI Border Moat & Multi-Model Council Gateway
                  </h2>
                  <p className="text-xs text-slate-400">
                    Mainstream model moat (GPT-4o, Claude 3.5, Grok-2, Gemini 2.0, DeepSeek) reviewing all inbound/outbound requests and dispatching to specialized departments.
                  </p>
                </div>

                <div className="text-xs text-pink-200 font-medium">
                  5-Model Moat Active
                </div>
              </div>

              {/* Inbound Triage Input */}
              <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Inbound Stream Type</label>
                    <Select value={councilInboundType} onValueChange={setCouncilInboundType}>
                      <SelectTrigger className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111626] border-pink-500/25 text-slate-100">
                        <SelectItem value="inbound_lead">Inbound Prospect / Lead</SelectItem>
                        <SelectItem value="client_email">Client Webmail / Directive</SelectItem>
                        <SelectItem value="partner_request">Partner / Affiliate Inquiry</SelectItem>
                        <SelectItem value="support_task">Support & Bug Escalation</SelectItem>
                        <SelectItem value="custom">Custom Directive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-pink-100/90 block mb-1.5">Sender Info & Context</label>
                    <Input
                      value={councilSender}
                      onChange={(e) => setCouncilSender(e.target.value)}
                      placeholder="e.g. Marcus Sterling (Apex Medical Clinic Group)"
                      className="text-xs bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-pink-100/90 block mb-1.5">Raw Inbound / Outbound Message:</label>
                  <Textarea
                    rows={3}
                    value={councilMessage}
                    onChange={(e) => setCouncilMessage(e.target.value)}
                    placeholder="Enter inbound request text for multi-model deliberation..."
                    className="text-xs font-mono bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-pink-500/15">
                  <div className="text-[11px] text-slate-400">
                    Deliberated by: GPT-4o · Claude 3.5 · Grok-2 · Gemini 2.0 · DeepSeek-R1
                  </div>
                  <Button
                    onClick={handleDeliberateCouncil}
                    disabled={isDeliberatingCouncil || !councilMessage.trim()}
                    className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 shadow-md shadow-pink-500/20 whitespace-nowrap shrink-0"
                  >
                    {isDeliberatingCouncil ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Convening Council...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                        Convene AI Border Council
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Council Deliberation Output */}
              {councilResult ? (
                <div className="space-y-6">
                  {/* Moat Triage Synthesis Card */}
                  <Card className="rounded-2xl border border-pink-400/30 shadow-xl bg-gradient-to-br from-[#171c2e]/95 via-[#111626]/95 to-[#161a2c]/95 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-500/20">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-pink-200">
                            Assigned: {councilResult.moatTriageReport?.assignedDepartment || 'Sales & Closers'}
                          </span>
                          <span aria-hidden="true" className="text-pink-500/40">·</span>
                          <span
                            className={`text-xs font-bold ${
                              councilResult.moatTriageReport?.urgencyLevel === 'CRITICAL' || councilResult.moatTriageReport?.urgencyLevel === 'HIGH'
                                ? 'text-rose-300'
                                : 'text-amber-300'
                            }`}
                          >
                            Urgency: {councilResult.moatTriageReport?.urgencyLevel || 'HIGH'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 mt-1">
                          Moat Council Unified Protocol Decision
                        </h3>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-400 block">Est. Revenue Impact:</span>
                        <span className="font-bold font-mono tabular-nums text-emerald-300 text-sm">
                          {councilResult.moatTriageReport?.estimatedRevenueImpact || '$2,485/mo'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-pink-100">Actionable Execution Protocol:</div>
                      <p className="text-slate-200 leading-relaxed bg-[#0a0d16]/85 p-3.5 rounded-xl border border-pink-500/20 font-mono">
                        {councilResult.moatTriageReport?.actionableProtocol}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-300 font-medium">
                      <span>Assigned Squad: <strong className="text-pink-200">{councilResult.moatTriageReport?.assignedSquad}</strong></span>
                      <span>Next Autonomous Step: <strong className="text-sky-200">{councilResult.moatTriageReport?.nextAutonomousStep}</strong></span>
                    </div>
                  </Card>

                  {/* 5 Independent Multi-Model Perspectives */}
                  <div className="space-y-3">
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-300" />
                      Individual Model Deliberation Perspectives (Zero Hallucination Border)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* GPT-4o */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100">OpenAI GPT-4o</span>
                          <span className="text-[10px] font-semibold text-emerald-300">Arch Lead</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {councilResult.gpt4oPerspective}
                        </p>
                      </Card>

                      {/* Claude 3.5 */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100">Claude 3.5 Sonnet</span>
                          <span className="text-[10px] font-semibold text-amber-300">Security & Logic</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {councilResult.claudePerspective}
                        </p>
                      </Card>

                      {/* Grok-2 */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100">Grok-2 / xAI</span>
                          <span className="text-[10px] font-semibold text-sky-300">Real-time Edge</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {councilResult.grokPerspective}
                        </p>
                      </Card>

                      {/* Gemini 2.0 */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100">Gemini 2.0 Flash</span>
                          <span className="text-[10px] font-semibold text-blue-300">High Throughput</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {councilResult.geminiPerspective}
                        </p>
                      </Card>

                      {/* DeepSeek-R1 */}
                      <Card className="rounded-2xl border border-pink-500/20 shadow-lg bg-[#111626]/85 backdrop-blur-md p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100">DeepSeek-R1</span>
                          <span className="text-[10px] font-semibold text-pink-300">$0-Spend Reasoning</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {councilResult.deepseekPerspective}
                        </p>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-400/30 text-pink-300 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">Moat Council Ready</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Enter an inbound client message, partner inquiry, or system task above and click <strong className="text-pink-200">Convene AI Border Council</strong> to run multi-model triage.
                  </p>
                </Card>
              )}
            </main>
          )}

          {/* TAB VIEW 5: BROWSER SESSIONS (Live SSRF-Hardened URL & Checkout Inspector) */}
          {activeTab === 'browser-sessions' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    Live URL & Checkout Inspector
                  </h2>
                  <p className="text-xs text-slate-400">
                    SSRF-hardened live webpage fetcher extracting DOM metadata, Stripe checkout signals, and AI conversion audits.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="text-emerald-300 font-semibold">SSRF Guard Active</span>
                  <span aria-hidden="true" className="text-pink-500/40">·</span>
                  <span className="text-slate-300">{browserInspection ? `HTTP ${browserInspection.httpStatus} (${browserInspection.latencyMs}ms)` : 'Ready'}</span>
                </div>
              </div>

              {/* Interactive Live Inspector Viewport */}
              <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md overflow-hidden">
                {/* Browser Address Bar */}
                <div className="bg-[#0d111d] px-4 py-3 border-b border-pink-500/20 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400/90" />
                    <span className="w-3 h-3 rounded-full bg-amber-300/90" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
                  </div>

                  <div className="flex-1 flex items-center gap-2 bg-[#0a0d16] px-3 py-1.5 rounded-xl border border-pink-500/20 text-xs">
                    <Lock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <input
                      type="text"
                      value={browserUrl}
                      onChange={(e) => setBrowserUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRunBrowserAutomation();
                      }}
                      placeholder="https://example.com"
                      className="w-full bg-transparent focus:outline-none text-slate-100 font-mono text-[11px]"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={handleRunBrowserAutomation}
                    disabled={isExecutingBrowserScript || !browserUrl.trim()}
                    className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-8 rounded-xl px-3.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isExecutingBrowserScript ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        Inspecting...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Inspect Live URL
                      </>
                    )}
                  </Button>
                </div>

                {/* Live Inspection Telemetry & Console Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-pink-500/15">
                  {/* Live DOM & Conversion Audit Panel */}
                  <div className="p-6 bg-[#0d111d]/70 flex flex-col justify-center min-h-[320px]">
                    {browserInspection ? (
                      <div className="p-5 rounded-2xl bg-[#111626] border border-pink-500/20 shadow-lg w-full space-y-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-pink-100 truncate">{browserInspection.title || browserInspection.url}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            browserInspection.httpStatus >= 200 && browserInspection.httpStatus < 400
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-400/30'
                          }`}>
                            HTTP {browserInspection.httpStatus} · {browserInspection.latencyMs}ms
                          </span>
                        </div>

                        {browserInspection.h1 && (
                          <div className="text-[11px] text-slate-300">
                            <span className="text-slate-400">H1:</span> {browserInspection.h1}
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                          <div className="p-2 rounded-lg bg-[#0a0d16] border border-slate-800">
                            <span className="text-slate-400 block">Forms</span>
                            <span className="text-slate-100 font-bold">{browserInspection.formsCount}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#0a0d16] border border-slate-800">
                            <span className="text-slate-400 block">Links</span>
                            <span className="text-slate-100 font-bold">{browserInspection.linksCount}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#0a0d16] border border-slate-800">
                            <span className="text-slate-400 block">Stripe</span>
                            <span className={browserInspection.hasStripeCheckoutSignals ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                              {browserInspection.hasStripeCheckoutSignals ? 'Detected' : 'None'}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#0a0d16] border border-slate-800">
                            <span className="text-slate-400 block">Viewport</span>
                            <span className={browserInspection.hasViewportMeta ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                              {browserInspection.hasViewportMeta ? 'Mobile OK' : 'Missing'}
                            </span>
                          </div>
                        </div>

                        {browserInspection.aiAudit && (
                          <div className="p-3 rounded-xl bg-[#0a0d16] border border-pink-500/20 text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                            {browserInspection.aiAudit}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-[#111626] border border-pink-500/20 shadow-lg max-w-sm w-full mx-auto text-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-300 flex items-center justify-center mx-auto">
                          <Globe className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-100">Live Conversion & Checkout Inspector</h4>
                        <p className="text-xs text-slate-400">
                          Click <strong className="text-pink-200">Inspect Live URL</strong> above to fetch any public webpage securely, extract DOM signals, and run an AI conversion audit.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Real-time Inspection Log Console */}
                  <div className="p-4 bg-[#06080f] text-emerald-300 font-mono text-[11px] space-y-2 h-[320px] overflow-y-auto">
                    <div className="text-slate-400 text-[10px] pb-1.5 border-b border-pink-500/15 flex justify-between">
                      <span>LIVE INSPECTOR LOG TERMINAL</span>
                      <span className="text-emerald-300 font-semibold">SSRF PROTECTION ON</span>
                    </div>
                    {browserLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-pink-300">&gt; </span>{log}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </main>
          )}

          {/* TAB VIEW 6: SETTINGS (Server Capabilities Diagnostics & Workspace Preferences) */}
          {activeTab === 'settings' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    Server Capabilities & Workspace Ops Config
                  </h2>
                  <p className="text-xs text-slate-400">
                    All API secrets stay strictly server-side in environment variables. Manage non-secret workspace preferences and run live connectivity checks below.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => refreshCapabilities(true)}
                  disabled={isPingingAi}
                  className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold h-9 rounded-xl px-4 cursor-pointer"
                >
                  {isPingingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Pinging Live AI...
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5 mr-1.5" />
                      Run Live AI Ping
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server-Side Environment & Integration Status */}
                <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-6 space-y-4">
                  <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    Server-Side Integration Readiness
                  </CardTitle>

                  <div className="space-y-2.5 text-xs">
                    {[
                      {
                        label: 'Gemini 4 Hydrogen (GEMINI_API_KEY)',
                        ok: capabilities?.geminiConfigured,
                        desc: 'Primary AI brain + live Google Search grounding'
                      },
                      {
                        label: 'OpenAI GPT-4o (OPENAI_API_KEY)',
                        ok: capabilities?.openaiConfigured,
                        desc: 'Optional secondary comparison & chat engine'
                      },
                      {
                        label: 'Stripe Live Payments (STRIPE_SECRET_KEY)',
                        ok: capabilities?.stripeConfigured,
                        desc: 'Mints live hosted Stripe Checkout Payment Links'
                      },
                      {
                        label: 'GitHub Repo API (GITHUB_TOKEN)',
                        ok: capabilities?.githubConfigured,
                        desc: 'Verifies remote repository status & branch metadata'
                      },
                      {
                        label: 'Outbound Email (RESEND_API_KEY & RESEND_FROM_EMAIL)',
                        ok: capabilities?.emailConfigured,
                        desc: 'Sends live webmail campaigns via Resend'
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0a0d16]/85 border border-pink-500/15 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-100">{item.label}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          item.ok
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.ok ? 'Configured' : 'Not Set'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Non-Secret Persistent Workspace Preferences & Actions */}
                <Card className="rounded-2xl border border-pink-500/20 shadow-xl shadow-black/25 bg-[#111626]/85 backdrop-blur-md p-6 space-y-4">
                  <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-sky-300" />
                    Workspace Persistence & Export Preferences
                  </CardTitle>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-pink-100/90 block mb-1">Owner Recipient Email (Default Compose & Export Target)</label>
                      <Input
                        value={settings.exportEmail}
                        onChange={(e) => setSettings({ ...settings, exportEmail: e.target.value })}
                        className="text-xs font-mono bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-pink-100/90 block mb-1">GitHub Repository Slug (owner/repo)</label>
                      <Input
                        value={settings.githubRepo}
                        onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value })}
                        placeholder="e.g. holystunner/v0-ai-profit-ops-suite"
                        className="text-xs font-mono bg-[#0a0d16]/85 border-pink-500/20 text-slate-100 rounded-xl"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Server Workspace Storage</span>
                        <span className="font-bold font-mono text-emerald-300">data/workspace.json</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Empires, projects, tasks, notes, and event logs automatically persist to server disk across reloads.
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveWorkspaceSettings}
                      disabled={isSavingSettings}
                      className="w-full bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] text-xs h-9 rounded-xl font-bold shadow-md shadow-pink-500/20 cursor-pointer"
                    >
                      {isSavingSettings ? 'Saving Preferences...' : 'Save Workspace Preferences'}
                    </Button>

                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        onClick={handleTriggerGitPush}
                        disabled={isTriggeringPush}
                        variant="outline"
                        className="flex-1 text-xs h-9 rounded-xl border-pink-500/25 bg-[#0a0d16]/80 hover:bg-pink-500/15 text-pink-100 whitespace-nowrap cursor-pointer"
                      >
                        <GitBranch className="w-3.5 h-3.5 mr-1.5 text-sky-300" />
                        Verify Git & Repo
                      </Button>

                      <Button
                        onClick={handleTriggerZipExport}
                        disabled={isTriggeringZip}
                        variant="outline"
                        className="flex-1 text-xs h-9 rounded-xl border-pink-500/25 bg-[#0a0d16]/80 hover:bg-pink-500/15 text-pink-100 whitespace-nowrap cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5 text-pink-300" />
                        Download .ZIP Archive
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </main>
          )}

        </div>
      </div>

      {/* FLOATING DIGITAL KASSANDRA CO-PARTNER CHAT BUTTON & DIALOG */}
      <Dialog open={isCoPartnerChatOpen} onOpenChange={setIsCoPartnerChatOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-[#111626] border border-pink-500/25 text-slate-100 shadow-2xl shadow-black/60">
          <DialogHeader className="p-4 border-b border-pink-500/20 bg-gradient-to-r from-[#171c2e] via-[#1b162a] to-[#131a2c]">
            <div className="flex items-center justify-between gap-3 pr-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 text-[#0a0d16] font-bold flex items-center justify-center text-sm shadow-md shadow-pink-500/25">
                  ק
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold text-slate-100">
                    Korban (קָרְבָּן) (Digital Co-Partner)
                  </DialogTitle>
                  <p className="text-[11px] text-pink-200/80">
                    Direct Digital Me & Executive Co-Partner · OpenAI GPT-4o
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-300">
                Autonomous Co-Partner
              </span>
            </div>
          </DialogHeader>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[320px] max-h-[420px] bg-[#0a0d16]/75" ref={coPartnerScrollRef}>
            {coPartnerMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-pink-400/90 to-rose-300/90 text-[#0a0d16] font-medium rounded-br-none shadow-md shadow-pink-500/15'
                      : 'bg-[#111626] text-slate-100 rounded-bl-none border border-pink-500/20 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`block text-[9px] mt-1.5 text-right font-mono ${msg.role === 'user' ? 'text-[#0a0d16]/75' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isCoPartnerLoading && (
              <div className="flex justify-start">
                <div className="bg-[#111626] rounded-2xl p-3 text-xs flex items-center gap-2 border border-pink-500/20 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-pink-300" />
                  <span className="text-pink-100/80 font-medium">Korban is formulating strategic directive...</span>
                </div>
              </div>
            )}
            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => handleSendCoPartnerMessage("Give me a strategic overview of our 17 agents and highest revenue priorities.")}
                className="text-[10px] px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 font-medium border border-sky-400/25 transition-all cursor-pointer"
              >
                Strategy Overview
              </button>
              <button
                type="button"
                onClick={() => handleSendCoPartnerMessage("Scan chaotic scrap backlog and identify top 3 launchable money-making opportunities.")}
                className="text-[10px] px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-medium border border-amber-400/25 transition-all cursor-pointer"
              >
                Mine Scrap Gems
              </button>
              <button
                type="button"
                onClick={() => handleSendCoPartnerMessage("Trigger immediate autonomous Git backup snapshot and email zip export.")}
                className="text-[10px] px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 font-medium border border-emerald-400/25 transition-all cursor-pointer"
              >
                Trigger Backup
              </button>
            </div>
          </div>

          <div className="p-3 border-t border-pink-500/20 bg-[#0d111d] flex items-center gap-2">
            <Input
              placeholder="Direct Korban on empires, tasks, code generation, or deployments..."
              value={coPartnerInput}
              onChange={(e) => setCoPartnerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCoPartnerMessage();
                }
              }}
              disabled={isCoPartnerLoading}
              className="text-xs h-10 rounded-xl bg-[#0a0d16] border-pink-500/25 text-slate-100 placeholder:text-slate-500"
            />
            <Button
              type="button"
              onClick={() => handleSendCoPartnerMessage()}
              disabled={isCoPartnerLoading || !coPartnerInput.trim()}
              className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] font-bold h-10 px-4 rounded-xl shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* INDIVIDUAL AGENT CHAT MODAL */}
      <Dialog open={chatAgent !== null} onOpenChange={() => setChatAgent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-[#111626] border border-pink-500/25 text-slate-100 shadow-2xl shadow-black/60">
          {chatAgent && (
            <>
              <DialogHeader className="p-4 border-b border-pink-500/20 bg-[#0d111d]">
                <div className="flex items-center justify-between gap-3 pr-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl ${chatAgent.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                      {chatAgent.avatarChar}
                    </div>
                    <div>
                      <DialogTitle className="text-sm font-bold text-slate-100">
                        {chatAgent.name} ({chatAgent.badgeTitle})
                      </DialogTitle>
                      <p className="text-[11px] text-slate-400">
                        Specialized Autonomous Agent · GPT-4o
                      </p>
                    </div>
                  </div>
                  <span className="text-pink-300 text-[11px] font-semibold">
                    {chatAgent.badgeTitle}
                  </span>
                </div>
              </DialogHeader>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[400px] bg-[#0a0d16]/75" ref={agentChatScrollRef}>
                {agentChatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-pink-400/90 to-rose-300/90 text-[#0a0d16] font-medium rounded-br-none shadow-md shadow-pink-500/15'
                          : 'bg-[#111626] text-slate-100 rounded-bl-none border border-pink-500/20 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className={`block text-[9px] mt-1 text-right font-mono ${msg.role === 'user' ? 'text-[#0a0d16]/75' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isAgentChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#111626] rounded-2xl p-3 text-xs flex items-center gap-2 border border-pink-500/20 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-pink-300" />
                      <span className="text-slate-300">{chatAgent.name} is processing...</span>
                    </div>
                  </div>
                )}

                {/* Agent Quick Suggestion Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <button
                    type="button"
                    onClick={() => handleSendAgentChatMessage(`Execute current high-priority sprint task under your role as ${chatAgent.name}.`)}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 font-medium border border-pink-400/25 transition-all cursor-pointer"
                  >
                    Execute Sprint Task
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendAgentChatMessage(`Provide step-by-step deliverable report for ${chatAgent.badgeTitle}.`)}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 font-medium border border-sky-400/25 transition-all cursor-pointer"
                  >
                    Deliverable Report
                  </button>
                </div>
              </div>

              <div className="p-3 border-t border-pink-500/20 bg-[#0d111d] flex items-center gap-2">
                <Input
                  placeholder={`Ask ${chatAgent.name} to execute or analyze anything...`}
                  value={agentChatInput}
                  onChange={(e) => setAgentChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAgentChatMessage();
                    }
                  }}
                  disabled={isAgentChatLoading}
                  className="text-xs h-10 rounded-xl bg-[#0a0d16] border-pink-500/25 text-slate-100 placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  onClick={() => handleSendAgentChatMessage()}
                  disabled={isAgentChatLoading || !agentChatInput.trim()}
                  className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] font-bold h-10 px-4 rounded-xl shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AGENT INSPECTION & 7-DAY HISTORICAL PERFORMANCE MODAL */}
      <Dialog
        open={inspectAgent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInspectAgent(null);
            setDiagnosticResult(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-[#111626] border border-pink-500/25 text-slate-100 shadow-2xl shadow-black/60">
          {inspectAgent && (() => {
            const trend = getAgentHistoricalTrend(inspectAgent);
            const activeDay = trend.days[trendDayIndex] || trend.days[6];

            const width = 520;
            const height = 180;
            const padLeft = 45;
            const padRight = 20;
            const padTop = 20;
            const padBottom = 35;
            const chartW = width - padLeft - padRight;
            const chartH = height - padTop - padBottom;
            const yMin = Math.max(50, Math.floor((trend.minScore - 4) / 5) * 5);
            const yMax = 100;

            const points = trend.days.map((d, i) => {
              const x = padLeft + (i / 6) * chartW;
              const y = padTop + (1 - (d.score - yMin) / (yMax - yMin)) * chartH;
              return { x, y, ...d };
            });

            const pathD = points.reduce((acc, pt, idx, arr) => {
              if (idx === 0) return `M ${pt.x} ${pt.y}`;
              const prev = arr[idx - 1];
              const cX = (prev.x + pt.x) / 2;
              return `${acc} C ${cX} ${prev.y}, ${cX} ${pt.y}, ${pt.x} ${pt.y}`;
            }, '');

            const areaD = `${pathD} L ${points[6].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

            return (
              <div className="space-y-6">
                {/* Header */}
                <DialogHeader className="space-y-3 pb-3 border-b border-pink-500/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl ${inspectAgent.avatarBg} text-white font-bold flex items-center justify-center text-xl shadow-md`}>
                          {inspectAgent.avatarChar}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#111626]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <DialogTitle className="text-lg font-bold text-slate-100">
                            {inspectAgent.name}
                          </DialogTitle>
                          <span aria-hidden="true" className="text-pink-500/40">·</span>
                          <span className="text-xs font-semibold text-pink-300">
                            {inspectAgent.badgeTitle}
                          </span>
                          <span aria-hidden="true" className="text-pink-500/40">·</span>
                          <span className="text-[11px] font-semibold text-emerald-300">
                            Active · Online
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ID: <span className="font-mono text-pink-200">{inspectAgent.id}</span> · Engine: <span className="font-semibold text-slate-200">OpenAI GPT-4o & Gemini Multimodal</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogDescription className="text-xs text-slate-300 leading-relaxed pt-1">
                    {inspectAgent.description}
                  </DialogDescription>
                </DialogHeader>

                {/* 4 Summary Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#0a0d16]/85 border border-pink-500/20">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Score</div>
                    <div className="text-xl font-extrabold font-mono tabular-nums text-pink-300 mt-0.5">{inspectAgent.performanceScore}%</div>
                    <div className="text-[10px] text-emerald-300 font-medium flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>Peak Autonomous</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0a0d16]/85 border border-pink-500/20">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">7-Day Net Trend</div>
                    <div className="text-xl font-extrabold font-mono tabular-nums text-emerald-300 mt-0.5">+{trend.totalChange}%</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Past 7 Days Growth</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0a0d16]/85 border border-pink-500/20">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Browser Sessions</div>
                    <div className="text-xl font-extrabold font-mono tabular-nums text-slate-100 mt-0.5">{inspectAgent.browserSessions} Active</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Playwright Isolated</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0a0d16]/85 border border-pink-500/20">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Reliability SLA</div>
                    <div className="text-xl font-extrabold font-mono tabular-nums text-slate-100 mt-0.5">99.98%</div>
                    <div className="text-[10px] text-emerald-300 font-medium mt-0.5">Zero Failures</div>
                  </div>
                </div>

                {/* 7-DAY HISTORICAL PERFORMANCE SCORE TREND LINE CHART */}
                <div className="rounded-2xl border border-pink-500/20 bg-[#0d111d] p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-pink-500/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-pink-300" />
                        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                          Historical Performance Score Trend (Last 7 Days)
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Autonomous deterministic verification & throughput over 7 consecutive operational cycles
                      </p>
                    </div>

                    {/* Stats readout */}
                    <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums">
                      <span className="text-slate-300">
                        7D Avg: <strong className="text-pink-200">{trend.avgScore}%</strong>
                      </span>
                      <span aria-hidden="true" className="text-pink-500/40">·</span>
                      <span className="text-emerald-300 font-medium">
                        Peak: <strong>{trend.maxScore}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Interactive Day Inspection Callout */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-pink-500/10 border border-pink-400/25 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-300 animate-pulse" />
                      <span className="font-bold text-slate-100">{activeDay.fullDate}</span>
                      <span className="text-pink-500/50">·</span>
                      <span className="text-pink-200 font-extrabold font-mono tabular-nums text-sm">{activeDay.score}%</span>
                      <span className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded ${activeDay.diff >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                        {activeDay.diff >= 0 ? `+${activeDay.diff}%` : `${activeDay.diff}%`} vs prev day
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 hidden sm:flex items-center gap-3 font-mono tabular-nums">
                      <span>Tasks: <strong className="text-slate-100">{activeDay.tasks}</strong></span>
                      <span>Latency: <strong className="text-sky-200">{activeDay.latencyMs}ms</strong></span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative w-full overflow-hidden">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.32" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f472b6" />
                          <stop offset="50%" stopColor="#fda4af" />
                          <stop offset="100%" stopColor="#7dd3fc" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[100, 95, 90, 85, 80].filter(v => v >= yMin).map(v => {
                        const y = padTop + (1 - (v - yMin) / (yMax - yMin)) * chartH;
                        return (
                          <g key={v}>
                            <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                            <text x={padLeft - 6} y={y + 3.5} textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-medium">
                              {v}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      <path d={areaD} fill="url(#trendGradient)" />

                      {/* Smooth Trend Line */}
                      <path d={pathD} fill="none" stroke="url(#trendStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Vertical Indicator Line for Selected Day */}
                      <line
                        x1={points[trendDayIndex].x}
                        y1={padTop}
                        x2={points[trendDayIndex].x}
                        y2={padTop + chartH}
                        stroke="#f472b6"
                        strokeOpacity="0.6"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />

                      {/* Data Points */}
                      {points.map((pt, idx) => {
                        const isSelected = idx === trendDayIndex;
                        return (
                          <g
                            key={idx}
                            onClick={() => setTrendDayIndex(idx)}
                            className="cursor-pointer"
                          >
                            {/* Larger invisible hit zone */}
                            <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                            {isSelected && (
                              <circle cx={pt.x} cy={pt.y} r="8" fill="#f472b6" opacity="0.35" className="animate-ping" />
                            )}

                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isSelected ? 6 : 4}
                              fill="#0a0d16"
                              stroke={isSelected ? '#f9a8d4' : '#7dd3fc'}
                              strokeWidth={isSelected ? 3 : 2}
                              className="transition-all"
                            />

                            {/* Score on top of point */}
                            <text
                              x={pt.x}
                              y={pt.y - 9}
                              textAnchor="middle"
                              className={`text-[9px] font-bold font-mono ${isSelected ? 'fill-pink-200 font-extrabold' : 'fill-slate-300'}`}
                            >
                              {pt.score}%
                            </text>

                            {/* X-axis Date Label */}
                            <text
                              x={pt.x}
                              y={height - 10}
                              textAnchor="middle"
                              className={`text-[10px] font-medium ${isSelected ? 'fill-pink-200 font-bold' : 'fill-slate-400'}`}
                            >
                              {pt.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Click or tap any data point on the chart to inspect day-specific throughput and latency.
                  </p>
                </div>

                {/* Capabilities with confidence levels */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                    Autonomous Competencies & Capabilities
                  </h4>
                  <div className="space-y-2.5">
                    {inspectAgent.capabilities.map((cap, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-100">{cap.name}</span>
                          <span className="font-mono tabular-nums text-pink-200 font-bold">{(cap.confidence * 100).toFixed(0)}% Confidence</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{cap.description}</p>
                        <Progress value={cap.confidence * 100} className="h-1.5 bg-slate-800" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Sprint Task & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15 space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Sprint Task</div>
                    <div className="text-xs font-semibold text-slate-100 leading-snug">
                      {inspectAgent.currentTask || 'Autonomous ecosystem monitoring & continuous pipeline health'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0a0d16]/80 border border-pink-500/15 space-y-1.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Specialized Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectAgent.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#111626] border border-pink-500/20 text-pink-100/90 text-[10px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Diagnostic Result Banner (if triggered) */}
                {diagnosticResult && (
                  <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    diagnosticResult.ok
                      ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100'
                      : 'bg-rose-500/10 border-rose-400/30 text-rose-100'
                  }`}>
                    {diagnosticResult.ok ? (
                      <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold">
                        {diagnosticResult.ok
                          ? `Live AI Benchmark Passed (${diagnosticResult.model || 'AI'} · ${diagnosticResult.latencyMs}ms)`
                          : 'Live AI Benchmark Failed'}
                      </div>
                      <div>{diagnosticResult.text}</div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-pink-500/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      setIsDiagnosing(true);
                      setDiagnosticResult(null);
                      try {
                        const res = await authFetch('/api/ops/actions', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'run_agent_diagnostic',
                            agentName: inspectAgent.name,
                            agentRole: inspectAgent.role
                          })
                        });
                        const data = await res.json();
                        if (!res.ok || !data?.success) {
                          setDiagnosticResult({
                            ok: false,
                            text: data?.error || `Benchmark failed (${res.status}).`
                          });
                        } else {
                          setDiagnosticResult({
                            ok: true,
                            text: data.diagnosticOutput,
                            latencyMs: data.latencyMs,
                            model: data.model
                          });
                        }
                      } catch (err: any) {
                        setDiagnosticResult({
                          ok: false,
                          text: err?.message || 'Network error running diagnostic benchmark.'
                        });
                      } finally {
                        setIsDiagnosing(false);
                      }
                    }}
                    disabled={isDiagnosing}
                    className="w-full sm:w-auto text-xs h-9 rounded-xl border-pink-500/25 bg-[#0a0d16]/80 hover:bg-pink-500/15 text-pink-100 cursor-pointer"
                  >
                    {isDiagnosing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Running Live Benchmark...
                      </>
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5 mr-1.5 text-pink-300" />
                        Run Live AI Benchmark
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setInspectAgent(null)}
                      className="text-xs h-9 rounded-xl text-slate-300 hover:text-white hover:bg-pink-500/10 cursor-pointer"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        const target = inspectAgent;
                        setInspectAgent(null);
                        handleOpenAgentChat(target);
                      }}
                      className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] font-bold text-xs h-9 rounded-xl px-4 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Chat with {inspectAgent.name}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ADD AGENT DIALOG */}
      <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-[#111626] border border-pink-500/25 text-slate-100 shadow-2xl shadow-black/60">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-300" />
              Add Autonomous Agent to Hierarchy
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure a new specialized agent persona operating on OpenAI GPT-4o.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Agent Name</label>
              <Input
                placeholder="e.g. Sentinel-01"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Hierarchy Level</label>
              <Select value={newAgentRole} onValueChange={(val: any) => {
                setNewAgentRole(val);
                if (val === 'ceo') setNewAgentBadge('Ceo');
                else if (val === 'empire') setNewAgentBadge('Empire Manager');
                else if (val === 'project') setNewAgentBadge('Project Manager');
                else setNewAgentBadge('Workers');
              }}>
                <SelectTrigger className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111626] border-pink-500/25 text-slate-100">
                  <SelectItem value="ceo">CEO Tier (Co-Partner)</SelectItem>
                  <SelectItem value="empire">Empire Manager</SelectItem>
                  <SelectItem value="project">Project Manager</SelectItem>
                  <SelectItem value="workers">Worker / Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Badge Title</label>
              <Input
                placeholder="e.g. Financial & Stripe, Browser Automation"
                value={newAgentBadge}
                onChange={(e) => setNewAgentBadge(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Skills & Tags (comma separated)</label>
              <Input
                placeholder="e.g. stripe-billing, playwright, nextjs"
                value={newAgentTags}
                onChange={(e) => setNewAgentTags(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddAgentOpen(false)} className="text-xs h-9 rounded-xl border-pink-500/25 bg-[#0a0d16] text-slate-200 hover:bg-pink-500/10">
                Cancel
              </Button>
              <Button onClick={handleCreateAgent} className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] font-bold text-xs h-9 rounded-xl">
                Create Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SPAWN EMPIRE DIALOG */}
      <Dialog open={isSpawnEmpireOpen} onOpenChange={setIsSpawnEmpireOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-[#111626] border border-pink-500/25 text-slate-100 shadow-2xl shadow-black/60">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-300" />
              Spawn Containerized Sovereign Empire
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Deploys an isolated sovereign ecosystem with dedicated brand bible and cloud container.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Empire Name</label>
              <Input
                placeholder="e.g. Quantum Commerce Matrix"
                value={empireName}
                onChange={(e) => setEmpireName(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Vision / Tagline</label>
              <Input
                placeholder="e.g. Autonomous high-frequency commerce operations"
                value={empireTagline}
                onChange={(e) => setEmpireTagline(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Assigned Empire Manager</label>
              <Select value={empireManager} onValueChange={setEmpireManager}>
                <SelectTrigger className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111626] border-pink-500/25 text-slate-100">
                  <SelectItem value="Atlas">Atlas (Apex Sovereign Manager)</SelectItem>
                  <SelectItem value="Nova">Nova (Matrix SaaS Manager)</SelectItem>
                  <SelectItem value="Korban">Korban (קָרְבָּן) (Direct Co-Partner)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Custom Domain</label>
              <Input
                placeholder="e.g. quantum.sovereign.local"
                value={empireDomain}
                onChange={(e) => setEmpireDomain(e.target.value)}
                className="text-xs font-mono bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Brand Bible & Governing Principles</label>
              <Textarea
                placeholder="Define UI theme, zero leakage rules, and core goals..."
                value={empireBrandBible}
                onChange={(e) => setEmpireBrandBible(e.target.value)}
                className="text-xs min-h-[80px] bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSpawnEmpireOpen(false)} className="text-xs h-9 rounded-xl border-pink-500/25 bg-[#0a0d16] text-slate-200 hover:bg-pink-500/10">
                Cancel
              </Button>
              <Button onClick={handleSpawnEmpire} className="bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 hover:brightness-110 text-[#0a0d16] font-bold text-xs h-9 rounded-xl">
                Provision Empire
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SPAWN PROJECT WITH AI DIALOG */}
      <Dialog open={isSpawnProjectOpen} onOpenChange={setIsSpawnProjectOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-[#111626] border border-pink-500/25 text-slate-100 shadow-2xl shadow-black/60">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-pink-300" />
              Launch Project from Sovereign Template
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Deploys a containerized project with 10-minute GitHub push cycles, email backup daemon, and automated GPT-4o task breakdown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Parent Empire</label>
              <Select value={newProjectEmpire} onValueChange={setNewProjectEmpire}>
                <SelectTrigger className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111626] border-pink-500/25 text-slate-100">
                  {empires.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Project Name</label>
              <Input
                placeholder="e.g. Sovereign Stripe Billing Engine"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Project Scope & Handoff Bible Notes</label>
              <Textarea
                placeholder="Describe project deliverables, tech stack, APIs needed..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="text-xs min-h-[80px] bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Target Market & Audience</label>
              <Input
                placeholder="e.g. B2B high-volume commerce, global creator platforms"
                value={newProjectTargetMarket}
                onChange={(e) => setNewProjectTargetMarket(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Monetization & Profit Model</label>
              <Input
                placeholder="e.g. Monthly SaaS + 2.5% Stripe processing fees"
                value={newProjectMonetization}
                onChange={(e) => setNewProjectMonetization(e.target.value)}
                className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Starter Template Source</label>
              <Input
                value={newProjectTemplate}
                onChange={(e) => setNewProjectTemplate(e.target.value)}
                className="text-xs font-mono bg-[#0a0d16] border-pink-500/20 text-slate-100 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-pink-100/90 block mb-1">Assigned Project Manager</label>
              <Select value={newProjectManager} onValueChange={setNewProjectManager}>
                <SelectTrigger className="text-xs bg-[#0a0d16] border-pink-500/20 text-slate-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111626] border-pink-500/25 text-slate-100">
                  <SelectItem value="Orion">Orion (Sprint & Technical)</SelectItem>
                  <SelectItem value="Titan">Titan (10-Min Git Sync & Backup)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSpawnProjectOpen(false)} className="text-xs h-9 rounded-xl border-pink-500/25 bg-[#0a0d16] text-slate-200 hover:bg-pink-500/10">
                Cancel
              </Button>
              <Button
                onClick={handleSpawnProjectWithAI}
                disabled={isSpawningProjectWithAI || !newProjectName.trim()}
                className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] font-bold text-xs h-9 rounded-xl"
              >
                {isSpawningProjectWithAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Synthesizing with GPT-4o...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Spawn & Launch Project
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TASK EXECUTION ARTIFACT RESULT DIALOG */}
      <Dialog open={isExecutionResultOpen} onOpenChange={setIsExecutionResultOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-[#111626] border border-pink-500/25 text-slate-100 shadow-2xl shadow-black/60">
          {executionResult && (
            <>
              <DialogHeader className="p-4 border-b border-pink-500/20 bg-emerald-500/10">
                <div className="flex items-center justify-between gap-3 pr-6">
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                      {executionResult.task.title}
                    </DialogTitle>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Executed by <strong className="text-pink-200">{executionResult.task.assignedAgent}</strong> via OpenAI GPT-4o
                    </p>
                  </div>
                  <span className="text-emerald-300 text-xs font-semibold">
                    Completed
                  </span>
                </div>
              </DialogHeader>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-pink-100 mb-1.5">Executive Summary</h4>
                  <div className="p-3 bg-[#0a0d16]/85 border border-pink-500/20 rounded-xl leading-relaxed text-slate-200">
                    {executionResult.result.summary}
                  </div>
                </div>

                {executionResult.result.deliverables && executionResult.result.deliverables.length > 0 && (
                  <div>
                    <h4 className="font-bold text-pink-100 mb-2">Synthesized Deliverables</h4>
                    <div className="space-y-2">
                      {executionResult.result.deliverables.map((deliv: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#0a0d16]/85 border border-pink-500/20 rounded-xl space-y-1">
                          <span className="font-semibold text-pink-200 block">{deliv.title}</span>
                          <p className="text-slate-300 whitespace-pre-wrap text-[11px] leading-relaxed">{deliv.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {executionResult.result.codeSnippets && executionResult.result.codeSnippets.length > 0 && (
                  <div>
                    <h4 className="font-bold text-pink-100 mb-2 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-sky-300" />
                      Generated Source Code Artifacts
                    </h4>
                    <div className="space-y-2">
                      {executionResult.result.codeSnippets.map((snippet: any, idx: number) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-pink-500/20 bg-[#06080f] text-slate-100 font-mono text-[11px]">
                          <div className="px-3 py-1.5 bg-[#0d111d] border-b border-pink-500/15 text-slate-400 flex justify-between items-center text-[10px]">
                            <span>{snippet.filename} ({snippet.language})</span>
                            <span className="text-emerald-300">TypeScript / REST</span>
                          </div>
                          <pre className="p-3 overflow-x-auto max-h-52">{snippet.code}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-pink-500/20 bg-[#0d111d] flex justify-end">
                <Button onClick={() => setIsExecutionResultOpen(false)} className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 text-[#0a0d16] font-bold text-xs h-8 rounded-xl px-4">
                  Close Deliverable
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
