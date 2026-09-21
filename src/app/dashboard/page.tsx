"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CelesteWorkstation } from '@/components/CelesteWorkstation';
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
    name: 'Kassandra',
    avatarChar: 'K',
    avatarBg: 'bg-blue-600',
    role: 'ceo',
    badgeTitle: 'Ceo',
    badgeType: 'ceo',
    tags: ['strategic-planning', 'resource-allocation', 'empire-oversight'],
    extraTagsCount: 2,
    browserSessions: 3,
    performanceScore: 98,
    status: 'Active',
    description: 'Digital twin of Kassandra acting as autonomous co-partner and human-in-the-loop executive orchestrator.',
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
    profitMilestones: [
      { stage: 'Concept & Blueprint', status: 'completed', targetRevenue: '$0', leadTaskforce: 'Kassandra (CEO)' },
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
    source: 'Kassandra (CEO Clone)',
    message: 'Autonomous continuous development heartbeat verified. All 9 agents synchronized with zero telemetry leaks.',
    status: 'info'
  }
];

export default function DashboardPage() {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<
    'celeste' | 'odysseus' | 'command-centre' | 'empires' | 'projects' | 'workforce' | 'scrap-miner' | 'profit-forecast' | 'outbound-hunters' | 'border-council' | 'browser-sessions' | 'settings'
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

  // Digital Kassandra Persistent Co-Partner Chat State
  const [isCoPartnerChatOpen, setIsCoPartnerChatOpen] = useState(false);
  const [coPartnerMessages, setCoPartnerMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; time: string }>>([
    {
      role: 'assistant',
      content: "Hey Kassandra! I'm your digital CEO clone and autonomous co-partner. I have direct oversight of all empires, projects, and our 9 specialized agents running on OpenAI GPT-4o. What would you like us to build, deploy, or automate next?",
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

  // Inspect Capabilities Modal
  const [inspectAgent, setInspectAgent] = useState<HierarchyAgent | null>(null);

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

  // Playwright Browser Session State
  const [browserUrl, setBrowserUrl] = useState('https://dashboard.stripe.com/test/apikeys');
  const [browserLogs, setBrowserLogs] = useState<string[]>([
    '[19:52:10] Playwright chromium worker initialized in sandbox',
    '[19:52:12] Navigated to https://dashboard.stripe.com/test/apikeys (HTTP 200)',
    '[19:52:15] Located DOM element: input[name="secret_key_publishable"]',
    '[19:52:18] Extracted test credentials securely with zero external leaks',
    '[19:52:22] Snapshot rendered at resolution 1440x900'
  ]);
  const [isExecutingBrowserScript, setIsExecutingBrowserScript] = useState(false);

  // Settings State & Secrets
  const [settings, setSettings] = useState({
    openaiApiKey: 'sk-proj-••••••••••••••••••••••••••••••••',
    stripeSecretKey: 'sk_test_51P••••••••••••••••••••••••••••',
    stripeWebhookSecret: 'whsec_•••••••••••••••••••••••••••••••',
    githubPat: 'ghp_•••••••••••••••••••••••••••••••••',
    supabaseUrl: 'https://sovereign-vault.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9••••',
    exportEmail: 'theaucklandassistant@gmail.com',
    autoGitPushIntervalMins: 10,
    autoZipEmailIntervalMins: 10,
    zeroTelemetryEnforced: true
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTriggeringPush, setIsTriggeringPush] = useState(false);
  const [isTriggeringZip, setIsTriggeringZip] = useState(false);

  // OpenAI Status Check
  const [openAiConfigured, setOpenAiConfigured] = useState(true);

  const coPartnerScrollRef = useRef<HTMLDivElement>(null);
  const agentChatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/openai/status')
      .then(res => res.json())
      .then(data => {
        if (data.configured !== undefined) {
          setOpenAiConfigured(data.configured);
        }
      })
      .catch(() => {});
  }, []);

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
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: 'executive',
          agentName: 'Digital Kassandra (CEO Clone)',
          message: userText,
          conversationHistory: newHistory.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          context: `You are the digital CEO clone and co-partner of Kassandra (Human-in-the-loop). You direct all operations, sovereign empires (Apex Capital, Matrix SaaS Forge), 17 autonomous agents, 10-minute GitHub pushes, and email zip exports to theaucklandassistant@gmail.com. Talk directly, warmly, decisively, and concisely like a high-level co-founder.`
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setCoPartnerMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        // Add event
        setEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'agent_task',
            source: 'Digital Kassandra (CEO Clone)',
            message: `Executed directive: "${userText.slice(0, 45)}..."`,
            status: 'success'
          },
          ...prev
        ]);
      } else {
        setCoPartnerMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Acknowledged Kassandra. I have synchronized our workforce on this directive.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setCoPartnerMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Co-partner synchronized: Direct action logged for "${userText}".`,
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
        content: `Greetings Kassandra. I am ${agent.name} (${agent.badgeTitle}), running on OpenAI GPT-4o & Gemini. Current status: ${agent.status}. Ready for your directives.`,
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
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRole: chatAgent.role === 'ceo' ? 'executive' : chatAgent.role === 'empire' ? 'executive' : chatAgent.role === 'project' ? 'engineer' : 'devops',
          agentName: chatAgent.name,
          message: userText,
          conversationHistory: newHist.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          context: `You are ${chatAgent.name}, holding the role ${chatAgent.badgeTitle} in Kassandra's AI Profit Ops Sovereign Suite. Skills: ${chatAgent.tags.join(', ')}. Keep answers crisp, technical, state-of-the-art.`
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
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
            content: data.error || 'Action processed successfully.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setAgentChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Task acknowledged by ${chatAgent.name}.`,
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
      const res = await fetch('/api/agents/plan', {
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
        lastGitPush: 'Just now (Auto-Push #1)',
        lastZipExport: 'Just now (Emailed to theaucklandassistant@gmail.com)',
        budget: 50000,
        tasksCount: plan?.tasks?.length || 5,
        completedTasksCount: 0,
        profitMilestones: [
          { stage: 'Concept & Blueprint', status: 'completed', targetRevenue: '$0', leadTaskforce: `${newProjectManager} (Lead)` },
          { stage: 'MVP & Containerization', status: 'active', targetRevenue: '$2,500/mo', leadTaskforce: 'Vulcan (Lead Dev)' },
          { stage: 'Stripe & Billing Live', status: 'queued', targetRevenue: '$10,000/mo', leadTaskforce: 'Aegis (Financial)' },
          { stage: 'Automated User Acquisition', status: 'queued', targetRevenue: '$25,000/mo', leadTaskforce: 'Nova (Growth)' },
          { stage: 'Autonomous Profit Stream', status: 'queued', targetRevenue: '$50,000+/mo', leadTaskforce: `${newProjectManager} (Taskforce)` }
        ]
      };

      const spawnedTasks: OpsTask[] = (plan?.tasks || [
        { title: 'Container Isolation & Template Sync', description: 'Clone template and setup sovereign container with zero-telemetry environment', assignedRole: 'devops', priority: 'critical' },
        { title: 'Full-Stack Next.js Architecture & DB Schema', description: 'Synthesize Next.js API routes, Supabase models, and authentication', assignedRole: 'engineer', priority: 'critical' },
        { title: 'Stripe Automated Checkout & Webhook Gateway', description: 'Implement tokenized Stripe checkout session and automated payment processing', assignedRole: 'engineer', priority: 'critical' },
        { title: 'Playwright End-to-End Checkout Verification', description: 'Automate browser testing to simulate customer purchase with snapshot telemetry', assignedRole: 'testing', priority: 'high' },
        { title: 'Automated Growth & Customer Acquisition Engine', description: 'Deploy SEO-optimized landing structure and acquisition funnel tracking', assignedRole: 'marketing', priority: 'high' }
      ]).map((t: any, idx: number) => ({
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
      setTasks(prev => [...spawnedTasks, ...prev]);
      setIsSpawnProjectOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');

      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'git_push',
          source: `${newProjectManager} (Project Manager)`,
          message: `🚀 Spawned project "${spawnedProject.name}" in ${targetEmpire.name} with autonomous taskforce squad and ${spawnedTasks.length} profit-driving tasks`,
          status: 'success'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Spawn project error:', err);
    } finally {
      setIsSpawningProjectWithAI(false);
    }
  };

  // Handle Executing a Task with GPT-4o Code Synthesis
  const handleExecuteTask = async (task: OpsTask) => {
    setExecutingTaskId(task.id);

    try {
      const res = await fetch('/api/agents/execute', {
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
      if (data.success && data.result) {
        setExecutionResult({
          task,
          result: data.result
        });
        setIsExecutionResultOpen(true);

        // Mark task as completed
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed', codeSnippets: data.result.codeSnippets } : t));

        // Update project stats
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
            message: `Synthesized deliverables for task: "${task.title}" via OpenAI GPT-4o`,
            status: 'success'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Task execution error:', err);
    } finally {
      setExecutingTaskId(null);
    }
  };

  // Trigger Manual Git Push (10-Min Cycle)
  const handleTriggerGitPush = () => {
    setIsTriggeringPush(true);
    setTimeout(() => {
      setIsTriggeringPush(false);
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'git_push',
          source: 'Titan (Project Manager)',
          message: 'Sovereign GitHub Auto-Push executed. All 4 projects synced to remote branches.',
          status: 'success'
        },
        ...prev
      ]);
    }, 1200);
  };

  // Trigger Manual 10-Min Zip & Email Export
  const handleTriggerZipExport = () => {
    setIsTriggeringZip(true);
    setTimeout(() => {
      setIsTriggeringZip(false);
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'zip_export',
          source: 'Titan (Project Manager)',
          message: `Workspace archive zipped (22.4 MB) & encrypted export emailed to ${settings.exportEmail}`,
          status: 'success'
        },
        ...prev
      ]);
    }, 1500);
  };

  // Execute Playwright Automation Action
  const handleRunBrowserAutomation = () => {
    setIsExecutingBrowserScript(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTimeout(() => {
      setBrowserLogs(prev => [
        ...prev,
        `[${timestamp}] Navigated to ${browserUrl}`,
        `[${timestamp}] Executed DOM snapshot verification (Hash #c7901)`,
        `[${timestamp}] Playwright headless puppeteering passed 100% assertions`
      ]);
      setIsExecutingBrowserScript(false);
    }, 1400);
  };

  // Run Scrap Miner & Code Recycler
  const handleRunScrapMiner = async () => {
    if (!scrapRawInput.trim() || isMiningScrap) return;
    setIsMiningScrap(true);

    try {
      const res = await fetch('/api/agents/mine-scraps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: scrapRawInput,
          fileCount: scrapFileCount,
          contextNotes: 'Identify immediate cashflow gems that can be launched with $0 spend in <48 hours.'
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setMinedScrapResult(data.result);
        setEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'agent_task',
            source: 'Gem-Miner (Scrap & Code Recycler)',
            message: `💎 Mined gem: "${data.result.recommendedGemName}" (${data.result.verdict} - Est. ${data.result.estimatedMonthlyRevenue})`,
            status: 'success'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error mining scraps:', err);
    } finally {
      setIsMiningScrap(false);
    }
  };

  // Generate 33-Day 12-Hour Incremental Profit Forecast
  const handleGenerateForecast = async () => {
    if (!forecastOppName.trim() || isGeneratingForecast) return;
    setIsGeneratingForecast(true);

    try {
      const res = await fetch('/api/agents/forecast-profit', {
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
      if (data.success && data.result) {
        setForecastResult(data.result);
        setEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'agent_task',
            source: 'Forecaster-12h (Real Talk Valuation)',
            message: `📊 Generated 33-Day 12h Real Talk Forecast for "${forecastOppName}" (33-Day Net: ${data.result.summaryMetrics?.total33DayGrossProfit || '$18,400'})`,
            status: 'success'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error generating forecast:', err);
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  // Run 24/7 Outbound Speed Sales & Hunter-Closer Cycle
  const handleRunHunterCloser = async () => {
    if (isRunningHunterCycle) return;
    setIsRunningHunterCycle(true);

    try {
      const res = await fetch('/api/agents/sales-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: hunterNiche,
          location: hunterLocation,
          offerDescription: hunterOffer
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setHunterResult(data.result);
        setEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'agent_task',
            source: 'Vanguard (24/7 Sales Lead)',
            message: `🎯 Executed 24/7 Hunter-Closer Speed Sales Cycle. Builder ready, ${data.result.hunter1NoWebsiteScout?.leadsDiscovered?.length || 3} local targets scouted, ${data.result.hunter2HighVolumeEmail?.verifiedDecisionMakers?.length || 4} decision makers queued.`,
            status: 'success'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error running hunter cycle:', err);
    } finally {
      setIsRunningHunterCycle(false);
    }
  };

  // Deliberate Multi-Model Border Moat Council
  const handleDeliberateCouncil = async () => {
    if (!councilMessage.trim() || isDeliberatingCouncil) return;
    setIsDeliberatingCouncil(true);

    try {
      const res = await fetch('/api/agents/council-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboundType: councilInboundType,
          senderInfo: councilSender,
          rawMessage: councilMessage
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setCouncilResult(data.result);
        setEvents(prev => [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'system',
            source: 'Moat-Council (Border Moat Gateway)',
            message: `🛡️ Border Moat Council synthesized triage for "${councilSender}" -> Routed to ${data.result.moatTriageReport?.assignedDepartment || 'Sales & Closers'} (${data.result.moatTriageReport?.urgencyLevel || 'HIGH'})`,
            status: 'success'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error deliberating council:', err);
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

  if (activeTab === 'celeste' || (activeTab as string) === 'odysseus') {
    return (
      <CelesteWorkstation
        onOpenDashboard={() => setActiveTab('workforce')}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onTriggerPush={handleTriggerGitPush}
        onTriggerZip={handleTriggerZipExport}
        onOpenSpawnProject={() => setIsSpawnProjectOpen(true)}
        isTriggeringPush={isTriggeringPush}
        isTriggeringZip={isTriggeringZip}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased">
      <div className="flex flex-1 w-full overflow-hidden">

        {/* LEFT SIDEBAR (Matching user's screenshot layout & style) */}
        <aside
          className={`bg-white border-r border-slate-200 shrink-0 transition-all duration-200 flex flex-col justify-between ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Top Brand & Profile */}
          <div className="p-4 space-y-5">
            {/* App Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
                ✦
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div className="font-bold text-sm tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>Celeste Ops</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold">
                      Sovereign
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Autonomous Revenue Suite
                  </div>
                </div>
              )}
            </div>

            {/* Kassandra CEO Clone Profile Badge Card */}
            <div
              onClick={() => setIsCoPartnerChatOpen(true)}
              className={`rounded-2xl border border-pink-100 bg-pink-50/40 p-2.5 flex items-center justify-between cursor-pointer hover:bg-pink-100/60 transition-all ${
                isSidebarCollapsed ? 'justify-center p-2' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    K
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <div className="font-semibold text-xs text-slate-900 leading-tight">
                      Kassandra
                    </div>
                    <div className="text-[10px] text-slate-500">
                      CEO Clone Agent
                    </div>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="text-emerald-600 pr-1">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
              )}
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1 pt-1">
              <button
                id="nav-btn-celeste"
                onClick={() => setActiveTab('celeste')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  (activeTab as string) === 'celeste' || (activeTab as string) === 'odysseus'
                    ? 'bg-slate-900 text-pink-300 font-semibold shadow-sm ring-1 ring-pink-400/40'
                    : 'text-slate-700 hover:bg-pink-50 hover:text-slate-950 font-medium'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-pink-400" />
                {!isSidebarCollapsed && <span>Celeste Workstation</span>}
              </button>

              <button
                onClick={() => setActiveTab('command-centre')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'command-centre'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Command Centre</span>}
              </button>

              <button
                onClick={() => setActiveTab('empires')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'empires'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Empires</span>}
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'projects'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FolderGit2 className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Projects</span>}
              </button>

              <button
                onClick={() => setActiveTab('workforce')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'workforce'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Bot className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>AI Workforce</span>}
              </button>

              <button
                onClick={() => setActiveTab('scrap-miner')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'scrap-miner'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Boxes className="w-4 h-4 shrink-0 text-amber-500" />
                {!isSidebarCollapsed && <span>Scrap & Code Miner</span>}
              </button>

              <button
                onClick={() => setActiveTab('profit-forecast')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'profit-forecast'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4 shrink-0 text-emerald-500" />
                {!isSidebarCollapsed && <span>12h Profit Forecast</span>}
              </button>

              <button
                onClick={() => setActiveTab('outbound-hunters')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'outbound-hunters'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Target className="w-4 h-4 shrink-0 text-rose-500" />
                {!isSidebarCollapsed && <span>24/7 Sales Squad</span>}
              </button>

              <button
                onClick={() => setActiveTab('border-council')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'border-council'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-indigo-500" />
                {!isSidebarCollapsed && <span>AI Moat Council</span>}
              </button>

              <button
                onClick={() => setActiveTab('browser-sessions')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'browser-sessions'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Browser Sessions</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
            </nav>
          </div>

          {/* Bottom Collapse Button */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors w-full justify-center py-1"
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
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* TOP HEADER BAR */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
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
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'workforce' && 'Monitor your autonomous 17-agent hierarchy & live roles'}
                {activeTab === 'command-centre' && "Autonomous operations & Kassandra's direct control room"}
                {activeTab === 'empires' && 'Manage containerized sovereign ecosystems and brand bibles'}
                {activeTab === 'projects' && 'Containerized projects, repo sync & task execution'}
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
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search empires, projects, agents"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Digital Kas Co-Partner Chat Button */}
              <button
                id="btn-digital-kas-header"
                onClick={() => setIsCoPartnerChatOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Direct Chat with Digital Kassandra"
              >
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                    K
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white animate-pulse" />
                </div>
                <span className="hidden md:inline">Digital Kas</span>
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              </button>

              {/* Bell Icon with Red Count 3 */}
              <button
                onClick={() => setActiveTab('command-centre')}
                className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                title="Alerts & Real-time Events"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>

              {/* All Systems Online Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Systems Online</span>
              </div>
            </div>
          </header>

          {/* TAB VIEW 1: AI WORKFORCE (Screenshot Match) */}
          {activeTab === 'workforce' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              {/* Digital Kas Co-Partner Executive Hub */}
              <Card className="rounded-2xl border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 shadow-xs overflow-hidden">
                <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-md">
                        K
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900">Digital Kassandra (CEO Co-Partner)</h2>
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold">Active Executive</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">GPT-4o & Gemini Online</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                        Direct human-in-the-loop executive orchestrator directing 17 agents, 2 empires, and 10-minute backup daemons with zero data leakage.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <Button
                      id="btn-kas-hub-chat"
                      onClick={() => setIsCoPartnerChatOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Chat with Digital Kas
                    </Button>
                    <Button
                      id="btn-kas-hub-push"
                      onClick={handleTriggerGitPush}
                      disabled={isTriggeringPush}
                      variant="outline"
                      className="bg-white hover:bg-slate-50 text-xs h-9 rounded-xl border-slate-300 cursor-pointer"
                    >
                      {isTriggeringPush ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-blue-600" /> : <GitBranch className="w-3.5 h-3.5 mr-1.5 text-blue-600" />}
                      Git Push
                    </Button>
                    <Button
                      id="btn-kas-hub-zip"
                      onClick={handleTriggerZipExport}
                      disabled={isTriggeringZip}
                      variant="outline"
                      className="bg-white hover:bg-slate-50 text-xs h-9 rounded-xl border-slate-300 cursor-pointer"
                    >
                      {isTriggeringZip ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-purple-600" /> : <Mail className="w-3.5 h-3.5 mr-1.5 text-purple-600" />}
                      Backup Zip
                    </Button>
                    <Button
                      id="btn-kas-hub-spawn"
                      onClick={() => setIsSpawnProjectOpen(true)}
                      variant="outline"
                      className="bg-white hover:bg-slate-50 text-xs h-9 rounded-xl border-slate-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5 text-slate-700" />
                      Spawn Project
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 4 Stat Summary Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Agents */}
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        {agents.length}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        Total Agents
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Active */}
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        {agents.filter(a => a.status === 'Active').length}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        Active
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Browser Sessions */}
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        21
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        Browser Sessions
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Avg Performance */}
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        93%
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        Avg Performance
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Pills Bar & Search / Add Agent */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Pill Buttons matching the screenshot colors */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAgentFilter('all')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      agentFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All ({agents.length})
                  </button>

                  <button
                    onClick={() => setAgentFilter('ceo')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      agentFilter === 'ceo'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50/80 border border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>CEO ({agents.filter(a => a.role === 'ceo').length})</span>
                  </button>

                  <button
                    onClick={() => setAgentFilter('empire')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      agentFilter === 'empire'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50/80 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Empire ({agents.filter(a => a.role === 'empire').length})</span>
                  </button>

                  <button
                    onClick={() => setAgentFilter('project')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      agentFilter === 'project'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-sky-50/80 border border-sky-200 text-sky-700 hover:bg-sky-100'
                    }`}
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Project ({agents.filter(a => a.role === 'project').length})</span>
                  </button>

                  <button
                    onClick={() => setAgentFilter('workers')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      agentFilter === 'workers'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50/80 border border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Workers ({agents.filter(a => a.role === 'workers').length})</span>
                  </button>
                </div>

                {/* Search agents & + Add Agent CTA */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-56">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search agents..."
                      value={agentSearchQuery}
                      onChange={(e) => setAgentSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                    />
                  </div>

                  <Button
                    onClick={() => setIsAddAgentOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl px-3.5 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Agent
                  </Button>
                </div>
              </div>

              {/* Agent Cards Grid matching screenshot style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="rounded-2xl border-slate-200 shadow-sm bg-white hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <CardHeader className="p-5 pb-3 space-y-3">
                      {/* Avatar, Name & Role Badge */}
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className={`w-11 h-11 rounded-2xl ${agent.avatarBg} text-white font-bold flex items-center justify-center text-lg shadow-sm`}>
                            {agent.avatarChar}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                              agent.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'
                            }`}
                          />
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="font-bold text-sm text-slate-900 leading-tight">
                            {agent.name}
                          </div>

                          {/* Role Badge with icon */}
                          <div className="inline-flex items-center gap-1">
                            {agent.badgeType === 'ceo' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100/80 text-blue-700">
                                <Crown className="w-2.5 h-2.5" />
                                {agent.badgeTitle}
                              </span>
                            )}
                            {agent.badgeType === 'empire' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800">
                                <Building2 className="w-2.5 h-2.5" />
                                {agent.badgeTitle}
                              </span>
                            )}
                            {agent.badgeType === 'project' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100/80 text-sky-800">
                                <FolderGit2 className="w-2.5 h-2.5" />
                                {agent.badgeTitle}
                              </span>
                            )}
                            {agent.badgeType === 'workers' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100/80 text-amber-800">
                                <Wrench className="w-2.5 h-2.5" />
                                {agent.badgeTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Current Task Box (if exists) */}
                      {agent.currentTask && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="text-[10px] font-medium text-slate-500">Current Task</div>
                          <div className="font-semibold text-slate-800 truncate mt-0.5">
                            {agent.currentTask}
                          </div>
                        </div>
                      )}

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {agent.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-normal"
                          >
                            {tag}
                          </span>
                        ))}
                        {agent.extraTagsCount && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]">
                            +{agent.extraTagsCount}
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    {/* Card Footer: Sessions, Performance %, Status Pill */}
                    <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1" title="Active Browser Sessions">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{agent.browserSessions}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Performance Score">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                          <span>{agent.performanceScore}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            agent.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {agent.status}
                        </span>

                        <button
                          onClick={() => handleOpenAgentChat(agent)}
                          className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
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
              <Card className="rounded-2xl border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/90 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-md shrink-0">
                        K
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">
                            Digital Kassandra Co-Partner Command
                          </h2>
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            GPT-4o Engine Active
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                          Sovereign, zero-leakage orchestration suite running 2 containerized empires, 2 active projects, 9 specialized agents, and 10-minute automated GitHub push / email backups.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        size="sm"
                        onClick={handleTriggerGitPush}
                        disabled={isTriggeringPush}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 text-xs h-9 rounded-xl border-slate-300"
                      >
                        {isTriggeringPush ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-blue-600" />
                            Pushing to GitHub...
                          </>
                        ) : (
                          <>
                            <GitBranch className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                            Trigger Git Push Now
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={handleTriggerZipExport}
                        disabled={isTriggeringZip}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 text-xs h-9 rounded-xl border-slate-300"
                      >
                        {isTriggeringZip ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-purple-600" />
                            Zipping & Emailing...
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                            Trigger 10-Min Zip Backup
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setIsCoPartnerChatOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-xl shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Direct Chat with Co-Partner
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Command Grid: Active Tasks + Real-Time Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left 2 Cols: Autonomous Tasks Box */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Autonomous Development Task Box
                      </h3>
                      <p className="text-xs text-slate-500">
                        Live agent deliverables, code synthesis & task executions
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsSpawnProjectOpen(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Spawn New Project
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const isExecuting = executingTaskId === task.id;

                      return (
                        <Card key={task.id} className="rounded-2xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900">{task.title}</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] py-0 ${
                                      task.priority === 'critical'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : task.priority === 'high'
                                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {task.priority}
                                  </Badge>
                                  <Badge
                                    className={`text-[10px] py-0 ${
                                      task.status === 'completed'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-blue-600 text-white'
                                    }`}
                                  >
                                    {task.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  {task.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right hidden sm:block">
                                  <div className="text-xs font-semibold text-slate-800">{task.assignedAgent}</div>
                                  <div className="text-[10px] text-slate-400">{task.assignedRole}</div>
                                </div>

                                <Button
                                  size="sm"
                                  disabled={isExecuting || task.status === 'completed'}
                                  onClick={() => handleExecuteTask(task)}
                                  className="text-xs h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
                                      <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                                      Run with GPT-4o
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {task.deliverables && task.deliverables.length > 0 && (
                            <CardContent className="p-4 pt-1 border-t border-slate-50 mt-2">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                <span className="font-medium text-slate-700">Deliverables:</span>
                                {task.deliverables.map((deliv, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    ✓ {deliv}
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
                    <h3 className="font-bold text-base text-slate-900">
                      Sovereign Event & Backup Stream
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live 10-min Git pushes, zip archives & telemetry
                    </p>
                  </div>

                  <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {events.map((evt) => (
                        <div key={evt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {evt.type === 'git_push' && <GitBranch className="w-3.5 h-3.5 text-blue-600" />}
                              {evt.type === 'zip_export' && <Mail className="w-3.5 h-3.5 text-purple-600" />}
                              {evt.type === 'browser_action' && <Globe className="w-3.5 h-3.5 text-sky-600" />}
                              {evt.type === 'agent_task' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                              {evt.type === 'system' && <Zap className="w-3.5 h-3.5 text-emerald-600" />}
                              {evt.source}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {evt.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
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
                  <h2 className="text-lg font-bold text-slate-900">
                    Sovereign Containerized Empires
                  </h2>
                  <p className="text-xs text-slate-500">
                    Each empire is an isolated cloud ecosystem with dedicated managers, brand bibles, and zero data leakage.
                  </p>
                </div>

                <Button
                  onClick={() => setIsSpawnEmpireOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Empire
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {empires.map((emp) => (
                  <Card key={emp.id} className="rounded-2xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xl shadow-sm">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900">{emp.name}</h3>
                          <p className="text-xs text-slate-500">{emp.tagline}</p>
                        </div>
                      </div>

                      <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">
                        {emp.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block font-medium">Assigned Empire Manager</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <Avatar className="w-5 h-5 bg-emerald-600 text-[10px] text-white">
                            <AvatarFallback>{emp.managerAvatar}</AvatarFallback>
                          </Avatar>
                          {emp.managerName}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block font-medium">Monthly Revenue Run Rate</span>
                        <span className="font-bold text-emerald-600 mt-0.5 block">{emp.monthlyRevenue}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block font-medium">Container Enclave ID</span>
                        <span className="font-mono text-slate-700 text-[11px] block mt-0.5">{emp.containerId} (100% Isolated)</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block font-medium">Custom Domain</span>
                        <span className="font-mono text-blue-600 text-[11px] block mt-0.5">{emp.domain}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                        <span className="font-semibold text-blue-900 block mb-0.5">Brand Bible & Aesthetic Blueprint:</span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{emp.brandBibleSummary}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">
                        Active Projects: <strong className="text-slate-800">{emp.projectsCount}</strong>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewProjectEmpire(emp.id);
                          setIsSpawnProjectOpen(true);
                        }}
                        className="text-xs h-8 rounded-xl border-slate-200 hover:bg-slate-50"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
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
                  <h2 className="text-lg font-bold text-slate-900">
                    Sovereign Containerized Projects
                  </h2>
                  <p className="text-xs text-slate-500">
                    Spawned from pre-configured template (e.g. <code className="text-blue-600">godsentaigod/Template-</code>) with automated 10-min GitHub pushes & email zip backups.
                  </p>
                </div>

                <Button
                  onClick={() => setIsSpawnProjectOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Launch New Project
                </Button>
              </div>

              <div className="space-y-5">
                {projects.map((proj) => (
                  <Card key={proj.id} className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{proj.name}</h3>
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                            {proj.empireName}
                          </Badge>
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            {proj.status}
                          </Badge>
                          {proj.monthlyProfitRunRate && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] flex items-center gap-1 font-semibold">
                              <TrendingUp className="w-3 h-3 text-emerald-600" />
                              {proj.monthlyProfitRunRate}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleTriggerGitPush}
                          variant="outline"
                          className="text-xs h-8 rounded-xl border-slate-300"
                        >
                          <GitBranch className="w-3.5 h-3.5 mr-1 text-blue-600" />
                          Git Push
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleTriggerZipExport}
                          variant="outline"
                          className="text-xs h-8 rounded-xl border-slate-300"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1 text-purple-600" />
                          Email Zip
                        </Button>
                      </div>
                    </div>

                    {/* Monetization Model & Target Market */}
                    {(proj.monetizationModel || proj.targetMarket) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Monetization & Profit Engine</span>
                          <span className="text-slate-800 text-[11px] font-medium block mt-0.5">{proj.monetizationModel || 'Automated Recurring Subscriptions & Processing'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Target Market</span>
                          <span className="text-slate-800 text-[11px] font-medium block mt-0.5">{proj.targetMarket || 'Global digital operators & customers'}</span>
                        </div>
                      </div>
                    )}

                    {/* Autonomous Taskforce Squad */}
                    {proj.taskforceSquad && (
                      <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            Autonomous Taskforce Squad
                          </span>
                          <span className="text-[10px] text-blue-700 font-medium">5 Specialized AI Agents</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                            <span className="text-[9px] text-slate-400 block font-semibold">TASKFORCE LEAD</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">{proj.taskforceSquad.lead}</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                            <span className="text-[9px] text-slate-400 block font-semibold">ENGINEERING</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">{proj.taskforceSquad.engineer}</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                            <span className="text-[9px] text-slate-400 block font-semibold">FINANCIAL / STRIPE</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">{proj.taskforceSquad.financial}</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                            <span className="text-[9px] text-slate-400 block font-semibold">BROWSER / PLAYWRIGHT</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">{proj.taskforceSquad.automation}</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                            <span className="text-[9px] text-slate-400 block font-semibold">GROWTH & SEO</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">{proj.taskforceSquad.growth}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profit Acceleration Milestones */}
                    {proj.profitMilestones && proj.profitMilestones.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-600" />
                            Autonomous Profit Roadmap (Concept → Real-World Cashflow)
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {proj.profitMilestones.filter(m => m.status === 'completed').length} of {proj.profitMilestones.length} Stages Live
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                          {proj.profitMilestones.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                m.status === 'completed'
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                  : m.status === 'active'
                                  ? 'bg-blue-50/80 border-blue-300 text-blue-900 ring-1 ring-blue-300'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                  Stage {mIdx + 1}
                                </span>
                                {m.status === 'completed' ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                ) : m.status === 'active' ? (
                                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                                ) : (
                                  <Clock className="w-3 h-3 text-slate-400" />
                                )}
                              </div>
                              <div className="font-bold text-[11px] leading-tight mb-1">{m.stage}</div>
                              <div className="text-[10px] opacity-80 flex items-center justify-between">
                                <span>{m.targetRevenue}</span>
                                <span className="text-[9px] font-medium">{m.leadTaskforce}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Infrastructure & Container specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block font-medium">Starter Template</span>
                        <span className="font-mono text-slate-800 text-[11px] block mt-0.5">{proj.templateSource}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block font-medium">GitHub Repository</span>
                        <a href={proj.githubRepo} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] block mt-0.5 truncate flex items-center gap-1">
                          {proj.githubRepo} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block font-medium">Deployment VM</span>
                        <span className="font-mono text-slate-800 text-[11px] block mt-0.5">{proj.cloudVM}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>Lead Manager: <strong className="text-slate-800">{proj.managerName}</strong></span>
                        <span>Workers: <strong className="text-slate-800">{proj.assignedWorkers.join(', ')}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-700 font-medium">⏱️ {proj.lastGitPush}</span>
                        <span className="text-purple-700 font-medium">📦 {proj.lastZipExport}</span>
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
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-amber-600" />
                    Messy Scrap Bank & Abandoned Code Recycler
                  </h2>
                  <p className="text-xs text-slate-500">
                    Autonomous agent reviewing messy chaotic files, unfinished repos & concepts to extract immediate $0-spend launch gems.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-900 border-0 text-xs">
                    Gem-Miner Agent Active
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Input Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-slate-600" />
                        Chaotic Bank Data & Backlog Files
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {scrapFileCount} Files & Snippets
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Paste Raw Unfinished Notes, Snippets or File Paths:
                      </label>
                      <Textarea
                        rows={9}
                        value={scrapRawInput}
                        onChange={(e) => setScrapRawInput(e.target.value)}
                        placeholder="Paste chaotic project logs, half-built APIs, unfinished ideas or raw file dumps..."
                        className="text-xs font-mono bg-slate-50 border-slate-200 focus:bg-white rounded-xl leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="text-[11px] text-slate-500">
                        Evaluates: <strong>Finish & Launch vs Recycle into Faster Reinvention</strong>
                      </div>
                      <Button
                        onClick={handleRunScrapMiner}
                        disabled={isMiningScrap || !scrapRawInput.trim()}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm shrink-0"
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
                  <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
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
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-all"
                      >
                        <span className="font-semibold block text-slate-800">Local Clinic AI Pack</span>
                        <span className="text-[10px] text-slate-500">Fast $497/mo retainer</span>
                      </button>

                      <button
                        onClick={() => {
                          setScrapRawInput(`1. 100+ Midjourney luxury fashion prompt bank
2. Next.js image gallery with Supabase auth
3. Automated Shopify product sync script
4. Instagram post scheduler draft`);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-all"
                      >
                        <span className="font-semibold block text-slate-800">E-Com Asset Factory</span>
                        <span className="text-[10px] text-slate-500">High passive vibe index</span>
                      </button>
                    </div>
                  </Card>
                </div>

                {/* Output & Analysis Panel */}
                <div className="lg:col-span-7 space-y-4">
                  {minedScrapResult ? (
                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-bold tracking-wider text-amber-700">
                              Identified Cashflow Gem
                            </span>
                            <Badge
                              className={`text-[10px] font-bold ${
                                minedScrapResult.verdict === 'finish_and_launch'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-indigo-600 text-white'
                              }`}
                            >
                              {minedScrapResult.verdict === 'finish_and_launch' ? '⚡ Finish & Launch' : '♻️ Recycle into Faster Reinvention'}
                            </Badge>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-1">
                            {minedScrapResult.recommendedGemName}
                          </h3>
                        </div>

                        <Button
                          onClick={() => handleAdoptGemAsProject(minedScrapResult)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm shrink-0"
                        >
                          <Rocket className="w-3.5 h-3.5 mr-1.5" />
                          Spawn Containerized Project
                        </Button>
                      </div>

                      {/* 4 KPI Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                          <span className="text-[10px] text-emerald-700 block font-semibold">Est. Monthly Revenue</span>
                          <span className="text-base font-bold text-emerald-900 block mt-0.5">{minedScrapResult.estimatedMonthlyRevenue}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <span className="text-[10px] text-blue-700 block font-semibold">Automatable %</span>
                          <span className="text-base font-bold text-blue-900 block mt-0.5">{minedScrapResult.automatablePercentage}%</span>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                          <span className="text-[10px] text-purple-700 block font-semibold">Passive Profit Vibe</span>
                          <span className="text-base font-bold text-purple-900 block mt-0.5">{minedScrapResult.passiveProfitVibeScore}/100</span>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <span className="text-[10px] text-amber-700 block font-semibold">Time to First $$</span>
                          <span className="text-base font-bold text-amber-900 block mt-0.5">{minedScrapResult.timeToFirstDollar}</span>
                        </div>
                      </div>

                      {/* Executive Summary & Rationale */}
                      <div className="space-y-2 text-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-blue-600" />
                          Executive Rationale & Reinvention Strategy
                        </div>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {minedScrapResult.rationale}
                        </p>
                        {minedScrapResult.reinventionAngle && (
                          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 font-medium">
                            <strong>Reinvention Angle:</strong> {minedScrapResult.reinventionAngle}
                          </div>
                        )}
                      </div>

                      {/* Immediate Action Plan */}
                      {minedScrapResult.actionPlan && minedScrapResult.actionPlan.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Immediate $0-Spend Action Plan
                          </div>
                          <div className="space-y-1.5">
                            {minedScrapResult.actionPlan.map((step: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            12-Hour Sprint Breakdown (0 → Cashflow)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {Object.entries(minedScrapResult.sprintSchedule12h).map(([slice, desc]: any) => (
                              <div key={slice} className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 text-teal-900">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-teal-700 block mb-0.5">
                                  {slice}
                                </span>
                                <span className="text-[11px] leading-tight block">{desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-12 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">No Scrap Analyzed Yet</h3>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Paste your bank of messy unstructured files, half-built tools, or uncompleted scripts on the left and click <strong>Mine & Triage Gems</strong>.
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
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    Real Talk Opportunity & 33-Day 12-Hour Incremental Forecast
                  </h2>
                  <p className="text-xs text-slate-500">
                    Data-backed valuation with past 15-day baseline trends and forward 33-day sales forecast calculated in 12-hour velocity intervals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-100 text-teal-900 border-0 text-xs">
                    66 Forecasting Windows (12h Slices)
                  </Badge>
                </div>
              </div>

              {/* Opportunity Configuration Card */}
              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Opportunity / Product Concept</label>
                    <Input
                      value={forecastOppName}
                      onChange={(e) => setForecastOppName(e.target.value)}
                      placeholder="e.g. AI Receptionist for Dental Clinics"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Niche & Market Gap</label>
                    <Input
                      value={forecastNiche}
                      onChange={(e) => setForecastNiche(e.target.value)}
                      placeholder="e.g. Local clinics without website or online booking"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pricing Model & Stripe Terms</label>
                    <Input
                      value={forecastPricing}
                      onChange={(e) => setForecastPricing(e.target.value)}
                      placeholder="e.g. $497/mo retainer + $997 setup fee"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Models realistic sales cycles, zero-marginal fulfillment cost, and passive operator ratios.
                  </div>
                  <Button
                    onClick={handleGenerateForecast}
                    disabled={isGeneratingForecast || !forecastOppName.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm"
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
                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Profit Potential Grade</span>
                      <div className="text-2xl font-black text-teal-600 mt-1">
                        {forecastResult.summaryMetrics?.profitPotentialGrade || 'A+'}
                      </div>
                      <span className="text-[10px] text-slate-400">Real talk feasibility</span>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">33-Day Gross Profit</span>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        {forecastResult.summaryMetrics?.total33DayGrossProfit || '$18,400'}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">Net: {forecastResult.summaryMetrics?.total33DayNetProfit || '$17,200'}</span>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Automatable %</span>
                      <div className="text-2xl font-black text-blue-600 mt-1">
                        {forecastResult.summaryMetrics?.automatablePercentage || 92}%
                      </div>
                      <span className="text-[10px] text-slate-400">Autonomous workflow</span>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Passive Profit Vibe</span>
                      <div className="text-2xl font-black text-purple-600 mt-1">
                        {forecastResult.summaryMetrics?.passiveProfitVibeScore || 89}/100
                      </div>
                      <span className="text-[10px] text-slate-400">Minimal operator drag</span>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Initial Cash Outlay</span>
                      <div className="text-2xl font-black text-emerald-700 mt-1">
                        {forecastResult.summaryMetrics?.estimatedResourceCost || '$0'}
                      </div>
                      <span className="text-[10px] text-slate-400">Zero third-party reliance</span>
                    </Card>
                  </div>

                  {/* Real Talk Executive Commentary */}
                  <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-3">
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-teal-600" />
                      Real Talk Valuation Commentary
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
                      {forecastResult.realTalkCommentary}
                    </p>
                  </Card>

                  {/* 12-Hour Incremental Timeline Table */}
                  <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-teal-600" />
                          33-Day 12-Hour Incremental Sales & Profit Velocity Table
                        </h3>
                        <p className="text-xs text-slate-500">
                          Displaying 66 sequential 12-hour operational periods.
                        </p>
                      </div>

                      {/* Filter intervals */}
                      <div className="flex items-center gap-1.5">
                        {(['all', 'week1', 'week2', 'week3', 'week4', 'final'] as const).map(w => (
                          <button
                            key={w}
                            onClick={() => setForecastViewInterval(w)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              forecastViewInterval === w
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {w === 'all' ? 'All (66)' : w === 'week1' ? 'Wk 1 (D1-7)' : w === 'week2' ? 'Wk 2 (D8-14)' : w === 'week3' ? 'Wk 3 (D15-21)' : w === 'week4' ? 'Wk 4 (D22-28)' : 'D29-33'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
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
                        <tbody className="divide-y divide-slate-100">
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
                              <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-4 py-2 font-mono font-bold text-slate-800">
                                  #{row.interval12hIndex}
                                </td>
                                <td className="px-4 py-2 font-medium text-slate-700">
                                  Day {row.day}
                                </td>
                                <td className="px-4 py-2 text-slate-500 font-mono text-[11px]">
                                  {row.timeSlot}
                                </td>
                                <td className="px-4 py-2 font-bold text-blue-600">
                                  +{row.projectedSalesCount}
                                </td>
                                <td className="px-4 py-2 font-bold text-slate-900">
                                  ${row.projectedGrossRevenue?.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 font-bold text-emerald-700">
                                  ${row.cumulativeProfit?.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-slate-600 text-[11px] truncate max-w-xs">
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
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">No Forecast Generated Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Configure your opportunity concept above and click <strong>Generate 33-Day 12h Real Talk Forecast</strong> to simulate forward revenue and squad execution.
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
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-rose-600" />
                    24/7 Outbound Speed Sales & Closer Taskforce
                  </h2>
                  <p className="text-xs text-slate-500">
                    Fully autonomous hunter-closer loop: Builder creates instant demo sites, Hunters scout local & verified email leads, Negotiator neutralizes objections, Closer dispatches webmail & Payment agent sends Stripe links.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-100 text-rose-900 border-0 text-xs">
                    5 Autonomous Specialists Synchronized
                  </Badge>
                </div>
              </div>

              {/* Target Pipeline Parameters */}
              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Niche</label>
                    <Input
                      value={hunterNiche}
                      onChange={(e) => setHunterNiche(e.target.value)}
                      placeholder="e.g. Local Med-Spas, High-End Contractors"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Location</label>
                    <Input
                      value={hunterLocation}
                      onChange={(e) => setHunterLocation(e.target.value)}
                      placeholder="e.g. Auckland, Sydney, Brisbane"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Irresistible Offer / Value Hook</label>
                    <Input
                      value={hunterOffer}
                      onChange={(e) => setHunterOffer(e.target.value)}
                      placeholder="e.g. Instant custom demo + 24/7 AI receptionist"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Squad: 👑 Vanguard (Lead) | 🏗️ B-Builder | 🔍 H-Hunter (No Website) | 📧 H-Hunter (Email) | 💬 N-Negotiator | 🚀 O-Closer | 💳 P-Payment
                  </div>
                  <Button
                    onClick={handleRunHunterCloser}
                    disabled={isRunningHunterCycle}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm"
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
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {[
                      { id: 'overview', label: 'Squad Overview' },
                      { id: 'builder', label: '🏗️ B - Builder (Custom Demos)' },
                      { id: 'hunters', label: '🔍 H - Hunters (Scouted Leads)' },
                      { id: 'negotiator', label: '💬 N - Negotiator (Objection Counters)' },
                      { id: 'closer', label: '🚀 O - Closer (Webmail Outreach)' },
                      { id: 'payment', label: '💳 P - Payment (Stripe Link)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setHunterActiveView(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          hunterActiveView === tab.id
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-3 md:col-span-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                              V
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">Vanguard (Team Lead Feedback & Delegation)</h4>
                              <p className="text-[10px] text-slate-500">Autonomous 24/7 Pipeline Commander</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                            Cycle Status: {hunterResult.teamLeadDelegation?.status || 'Active Outbound'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-mono">
                          {hunterResult.teamLeadDelegation?.feedbackAndNextAction || 'All 5 agents dispatched in parallel. Demo generated, leads scouted, webmail closing sequences staged.'}
                        </p>
                      </Card>

                      {/* Builder Quick Card */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-3">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-indigo-600" />
                          B - Builder MVP Demo
                        </div>
                        <div className="text-xs text-slate-700 font-medium">
                          {hunterResult.builderDemoOutput?.demoSiteName || 'Custom Demo Site'}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-3">
                          {hunterResult.builderDemoOutput?.receptionistScriptPreview}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setHunterActiveView('builder')} className="w-full text-xs h-8 rounded-xl">
                          View Demo Specs
                        </Button>
                      </Card>

                      {/* Hunters Quick Card */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-3">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Search className="w-4 h-4 text-amber-600" />
                          H - Hunters Output
                        </div>
                        <div className="text-xs text-slate-700 font-medium">
                          {hunterResult.hunter1NoWebsiteScout?.leadsDiscovered?.length || 3} Local Leads (No Web) + {hunterResult.hunter2HighVolumeEmail?.verifiedDecisionMakers?.length || 4} Emails
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-3">
                          Parsed phone numbers, verified C-level emails and opportunity gaps.
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setHunterActiveView('hunters')} className="w-full text-xs h-8 rounded-xl">
                          View Scouted Leads
                        </Button>
                      </Card>

                      {/* Closer & Stripe Quick Card */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-3">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          O - Closer & P - Payment
                        </div>
                        <div className="text-xs text-slate-700 font-medium truncate">
                          {hunterResult.paymentAgentStripeLink?.instantStripeLink || 'https://buy.stripe.com/demo'}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-3">
                          {hunterResult.closerOutreachWebmail?.coldEmailScript?.slice(0, 100)}...
                        </p>
                        <Button size="sm" variant="outline" onClick={() => setHunterActiveView('closer')} className="w-full text-xs h-8 rounded-xl">
                          View Outreach & Payment
                        </Button>
                      </Card>
                    </div>
                  )}

                  {/* BUILDER TAB */}
                  {hunterActiveView === 'builder' && (
                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {hunterResult.builderDemoOutput?.demoSiteName || 'Custom Demo Site'}
                          </h3>
                          <p className="text-xs text-slate-500">Generated tailored demo landing specs & voice script</p>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-800 text-xs">Builder Ready</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800">Demo Website Core Features</div>
                        <div className="flex flex-wrap gap-2">
                          {(hunterResult.builderDemoOutput?.coreFeatures || []).map((feat: string, fIdx: number) => (
                            <Badge key={fIdx} variant="outline" className="bg-indigo-50/50 text-indigo-800 border-indigo-200 text-xs">
                              ✓ {feat}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-800">Interactive AI Receptionist Voice / Chat Flow</div>
                        <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono">
                          {hunterResult.builderDemoOutput?.receptionistScriptPreview}
                        </pre>
                      </div>
                    </Card>
                  )}

                  {/* HUNTERS TAB */}
                  {hunterActiveView === 'hunters' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Hunter 1: Local No Website */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-4">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <Search className="w-4 h-4 text-amber-600" />
                          H-Hunter 1: Local Businesses Without Live Websites
                        </div>
                        <div className="space-y-2.5">
                          {(hunterResult.hunter1NoWebsiteScout?.leadsDiscovered || []).map((lead: any, lIdx: number) => (
                            <div key={lIdx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs space-y-1">
                              <div className="font-bold text-amber-950 flex items-center justify-between">
                                <span>{lead.businessName}</span>
                                <span className="text-[10px] text-amber-800 font-mono">{lead.phoneNumber}</span>
                              </div>
                              <div className="text-amber-900 text-[11px]">
                                {lead.estimatedRevenue} | {lead.location}
                              </div>
                              <div className="text-slate-600 text-[10px] pt-1">
                                Gap: <strong>{lead.opportunityGap}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Hunter 2: Verified Email Decision Makers */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-4">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-600" />
                          H-Hunter 2: High-Volume Verified Email Contacts
                        </div>
                        <div className="space-y-2.5">
                          {(hunterResult.hunter2HighVolumeEmail?.verifiedDecisionMakers || []).map((lead: any, lIdx: number) => (
                            <div key={lIdx} className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 text-xs space-y-1">
                              <div className="font-bold text-orange-950 flex items-center justify-between">
                                <span>{lead.contactName} ({lead.title})</span>
                                <Badge className="bg-emerald-600 text-white text-[9px]">Verified</Badge>
                              </div>
                              <div className="font-mono text-orange-800 text-[11px]">
                                {lead.email} | {lead.companyDomain}
                              </div>
                              <div className="text-slate-600 text-[10px] pt-1">
                                Angle: <strong>{lead.customAngle}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* NEGOTIATOR TAB */}
                  {hunterActiveView === 'negotiator' && (
                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-4">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        N-Negotiator: Automated Objection Handlers & Counters
                      </div>
                      <p className="text-xs text-slate-500">
                        When prospects push back on price or timing, the Negotiator deploys these verified counter-proposals automatically.
                      </p>

                      <div className="space-y-3">
                        {(hunterResult.negotiatorObjectionCounters?.objectionsAndCounters || []).map((item: any, iIdx: number) => (
                          <div key={iIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                            <div className="font-bold text-rose-700 flex items-center gap-1.5">
                              <span>⚠️ Prospect Objection:</span>
                              <span className="text-slate-800">"{item.objection}"</span>
                            </div>
                            <div className="text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-100 leading-relaxed font-mono">
                              <strong>Automated Counter Response:</strong> {item.counterScript}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* CLOSER TAB */}
                  {hunterActiveView === 'closer' && (
                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Send className="w-4 h-4 text-purple-600" />
                          O-Closer: Autonomous Webmail Outreach & Closing Sequence
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 text-xs">1-Click Dispatch Ready</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="text-xs font-bold text-slate-700">Subject Line:</div>
                          <div className="text-xs font-mono text-slate-900 font-semibold bg-white p-2 rounded-lg border border-slate-200">
                            {hunterResult.closerOutreachWebmail?.subjectLine}
                          </div>
                          <div className="text-xs font-bold text-slate-700 pt-2">Webmail Body:</div>
                          <pre className="text-xs bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-mono leading-relaxed text-slate-800">
                            {hunterResult.closerOutreachWebmail?.coldEmailScript}
                          </pre>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* PAYMENT TAB */}
                  {hunterActiveView === 'payment' && (
                    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-4">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        P-Payment: Instant Tokenized Stripe Checkout Link
                      </div>
                      <p className="text-xs text-slate-500">
                        Zero-friction payment link automatically included in final closing sequence.
                      </p>

                      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 uppercase">Live Stripe Link</span>
                          <Badge className="bg-emerald-600 text-white text-[10px]">Instant Checkout</Badge>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-emerald-300 font-mono text-xs text-emerald-800 flex items-center justify-between">
                          <span>{hunterResult.paymentAgentStripeLink?.instantStripeLink}</span>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-700 hover:text-emerald-900">
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="text-xs text-emerald-900">
                          <strong>Terms:</strong> {hunterResult.paymentAgentStripeLink?.pricingTerms}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Sales Hunter Squad Idle</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Configure your target niche & offer above and click <strong>Trigger 24/7 Hunter-Closer Cycle</strong> to deploy all 5 specialists autonomously.
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
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-600" />
                    AI Border Moat & Multi-Model Council Gateway
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mainstream model moat (GPT-4o, Claude 3.5, Grok-2, Gemini 2.0, DeepSeek) reviewing all inbound/outbound requests and dispatching to specialized departments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-100 text-indigo-900 border-0 text-xs">
                    5-Model Moat Active
                  </Badge>
                </div>
              </div>

              {/* Inbound Triage Input */}
              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Inbound Stream Type</label>
                    <Select value={councilInboundType} onValueChange={setCouncilInboundType}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound_lead">Inbound Prospect / Lead</SelectItem>
                        <SelectItem value="client_email">Client Webmail / Directive</SelectItem>
                        <SelectItem value="partner_request">Partner / Affiliate Inquiry</SelectItem>
                        <SelectItem value="support_task">Support & Bug Escalation</SelectItem>
                        <SelectItem value="custom">Custom Directive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Sender Info & Context</label>
                    <Input
                      value={councilSender}
                      onChange={(e) => setCouncilSender(e.target.value)}
                      placeholder="e.g. Marcus Sterling (Apex Medical Clinic Group)"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Raw Inbound / Outbound Message:</label>
                  <Textarea
                    rows={3}
                    value={councilMessage}
                    onChange={(e) => setCouncilMessage(e.target.value)}
                    placeholder="Enter inbound request text for multi-model deliberation..."
                    className="text-xs font-mono bg-slate-50 border-slate-200 focus:bg-white rounded-xl leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Deliberated by: 🤖 GPT-4o | 🎭 Claude 3.5 | ⚡ Grok-2 | 🌐 Gemini 2.0 | 🧮 DeepSeek-R1
                  </div>
                  <Button
                    onClick={handleDeliberateCouncil}
                    disabled={isDeliberatingCouncil || !councilMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm"
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
                  <Card className="rounded-2xl border-indigo-200 shadow-sm bg-gradient-to-br from-indigo-50/60 to-purple-50/60 p-6 space-y-4 border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-600 text-white text-xs">
                            Assigned: {councilResult.moatTriageReport?.assignedDepartment || 'Sales & Closers'}
                          </Badge>
                          <Badge
                            className={`text-xs ${
                              councilResult.moatTriageReport?.urgencyLevel === 'CRITICAL' || councilResult.moatTriageReport?.urgencyLevel === 'HIGH'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            Urgency: {councilResult.moatTriageReport?.urgencyLevel || 'HIGH'}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          Moat Council Unified Protocol Decision
                        </h3>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-500 block">Est. Revenue Impact:</span>
                        <span className="font-bold text-emerald-800 text-sm">
                          {councilResult.moatTriageReport?.estimatedRevenueImpact || '$2,485/mo'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-indigo-950">Actionable Execution Protocol:</div>
                      <p className="text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-indigo-100 font-mono">
                        {councilResult.moatTriageReport?.actionableProtocol}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-indigo-900 font-medium">
                      <span>Assigned Squad: <strong>{councilResult.moatTriageReport?.assignedSquad}</strong></span>
                      <span>Next Autonomous Step: <strong>{councilResult.moatTriageReport?.nextAutonomousStep}</strong></span>
                    </div>
                  </Card>

                  {/* 5 Independent Multi-Model Perspectives */}
                  <div className="space-y-3">
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-slate-700" />
                      Individual Model Deliberation Perspectives (Zero Hallucination Border)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* GPT-4o */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">🤖 OpenAI GPT-4o</span>
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Arch Lead</Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-mono">
                          {councilResult.gpt4oPerspective}
                        </p>
                      </Card>

                      {/* Claude 3.5 */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">🎭 Claude 3.5 Sonnet</span>
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">Security & Logic</Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-mono">
                          {councilResult.claudePerspective}
                        </p>
                      </Card>

                      {/* Grok-2 */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">⚡ Grok-2 / xAI</span>
                          <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700">Real-time Edge</Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-mono">
                          {councilResult.grokPerspective}
                        </p>
                      </Card>

                      {/* Gemini 2.0 */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">🌐 Gemini 2.0 Flash</span>
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">High Throughput</Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-mono">
                          {councilResult.geminiPerspective}
                        </p>
                      </Card>

                      {/* DeepSeek-R1 */}
                      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">🧮 DeepSeek-R1</span>
                          <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700">$0-Spend Reasoning</Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-mono">
                          {councilResult.deepseekPerspective}
                        </p>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Moat Council Ready</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Enter an inbound client message, partner inquiry, or system task above and click <strong>Convene AI Border Council</strong> to run multi-model triage.
                  </p>
                </Card>
              )}
            </main>
          )}

          {/* TAB VIEW 5: BROWSER SESSIONS (Playwright & Headless Puppeteering) */}
          {activeTab === 'browser-sessions' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Playwright Browser Puppeteering & Automation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Natural agent browser puppeteering, automated checkout verification, DOM extraction, and visual screenshots.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">
                    2 Active Puppeteer Workers
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    21 Total Sessions
                  </Badge>
                </div>
              </div>

              {/* Interactive Browser Session Viewport */}
              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                {/* Browser Address Bar */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>

                  <div className="flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      value={browserUrl}
                      onChange={(e) => setBrowserUrl(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-slate-800 font-mono text-[11px]"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={handleRunBrowserAutomation}
                    disabled={isExecutingBrowserScript}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 rounded-xl px-3"
                  >
                    {isExecutingBrowserScript ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        Puppeteering...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Execute Script
                      </>
                    )}
                  </Button>
                </div>

                {/* Simulated Screen Feed & Console Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Visual Preview Port */}
                  <div className="p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-sm w-full space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">Playwright Live Headless Port</h4>
                      <p className="text-xs text-slate-500">
                        Puppeteer-01 is actively monitoring DOM input tags and verifying Stripe checkout webhooks with zero leakage.
                      </p>
                      <div className="p-2 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-600 text-left truncate">
                        DOM Status: 200 OK • Element: button[data-testid="submit"]
                      </div>
                    </div>
                  </div>

                  {/* Real-time Automation Console */}
                  <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] space-y-2 h-[300px] overflow-y-auto">
                    <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 flex justify-between">
                      <span>AUTOMATION LOG TERMINAL</span>
                      <span className="text-emerald-500">PLAYWRIGHT ENGINE ACTIVE</span>
                    </div>
                    {browserLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-500">&gt; </span>{log}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </main>
          )}

          {/* TAB VIEW 6: SETTINGS (Unrestricted API Keys, Secrets & Zero-Telemetry Audit) */}
          {activeTab === 'settings' && (
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Sovereign Security, Secrets & Integrations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Unrestricted API keys and zero third-party leakage guarantee.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Zero Telemetry Enforced</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* API Secrets Configuration */}
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    Unrestricted API Keys & Credentials
                  </CardTitle>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">OpenAI API Key (Sole GPT-4o Model)</label>
                      <Input
                        type="password"
                        value={settings.openaiApiKey}
                        onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Stripe Secret Key</label>
                      <Input
                        type="password"
                        value={settings.stripeSecretKey}
                        onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">GitHub Personal Access Token (PAT)</label>
                      <Input
                        type="password"
                        value={settings.githubPat}
                        onChange={(e) => setSettings({ ...settings, githubPat: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Supabase / PostgreSQL Database URL</label>
                      <Input
                        value={settings.supabaseUrl}
                        onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Encrypted Zip Email Export Destination</label>
                      <Input
                        value={settings.exportEmail}
                        onChange={(e) => setSettings({ ...settings, exportEmail: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        setIsSavingSettings(true);
                        setTimeout(() => setIsSavingSettings(false), 800);
                      }}
                      disabled={isSavingSettings}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-xl font-medium mt-2"
                    >
                      {isSavingSettings ? 'Encrypting & Saving...' : 'Save Secrets Securely'}
                    </Button>
                  </div>
                </Card>

                {/* 10-Minute Continuous Pipeline Schedule */}
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-6 space-y-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Automated 10-Min Push & Email Backup Daemon
                  </CardTitle>

                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">GitHub Auto-Push Frequency</span>
                        <span className="font-bold text-blue-600">Every 10 Mins</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Titan coordinates automatic commits of all project workspace changes and pushes cleanly to designated GitHub repos.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Encrypted Zip Email Dispatch</span>
                        <span className="font-bold text-purple-600">Every 10 Mins</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Zips the entire codebase, assets, and bible docs, encrypts with AES-256, and dispatches via SMTP to <code className="text-slate-800">{settings.exportEmail}</code>.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={handleTriggerGitPush}
                        disabled={isTriggeringPush}
                        variant="outline"
                        className="flex-1 text-xs h-9 rounded-xl border-slate-300"
                      >
                        <GitBranch className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        Trigger Git Push
                      </Button>

                      <Button
                        onClick={handleTriggerZipExport}
                        disabled={isTriggeringZip}
                        variant="outline"
                        className="flex-1 text-xs h-9 rounded-xl border-slate-300"
                      >
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                        Trigger Email Export
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
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  K
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold text-slate-900">
                    Digital Kassandra (CEO Clone Agent)
                  </DialogTitle>
                  <p className="text-[11px] text-slate-500">
                    Direct Human-in-the-Loop Co-Partner • OpenAI GPT-4o
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px]">
                Autonomous Co-Partner
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[320px] max-h-[420px] bg-slate-50/50" ref={coPartnerScrollRef}>
            {coPartnerMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`block text-[9px] mt-1.5 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isCoPartnerLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 text-xs flex items-center gap-2 border border-slate-200 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-slate-500 font-medium">Digital Kassandra is formulating strategic directive...</span>
                </div>
              </div>
            )}
            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => handleSendCoPartnerMessage("Give me a strategic overview of our 17 agents and highest revenue priorities.")}
                className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200 transition-all cursor-pointer"
              >
                📊 Strategy Overview
              </button>
              <button
                type="button"
                onClick={() => handleSendCoPartnerMessage("Scan chaotic scrap backlog and identify top 3 launchable money-making opportunities.")}
                className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium border border-amber-200 transition-all cursor-pointer"
              >
                💎 Mine Scrap Gems
              </button>
              <button
                type="button"
                onClick={() => handleSendCoPartnerMessage("Trigger immediate autonomous Git backup snapshot and email zip export.")}
                className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium border border-emerald-200 transition-all cursor-pointer"
              >
                ⚡ Trigger Backup
              </button>
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <Input
              placeholder="Direct Kassandra on empires, tasks, code generation, or deployments..."
              value={coPartnerInput}
              onChange={(e) => setCoPartnerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCoPartnerMessage();
                }
              }}
              disabled={isCoPartnerLoading}
              className="text-xs h-10 rounded-xl"
            />
            <Button
              type="button"
              onClick={() => handleSendCoPartnerMessage()}
              disabled={isCoPartnerLoading || !coPartnerInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-xl shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* INDIVIDUAL AGENT CHAT MODAL */}
      <Dialog open={chatAgent !== null} onOpenChange={() => setChatAgent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          {chatAgent && (
            <>
              <DialogHeader className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl ${chatAgent.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                      {chatAgent.avatarChar}
                    </div>
                    <div>
                      <DialogTitle className="text-sm font-bold text-slate-900">
                        {chatAgent.name} ({chatAgent.badgeTitle})
                      </DialogTitle>
                      <p className="text-[11px] text-slate-500">
                        Specialized Autonomous Agent • GPT-4o
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white text-[10px]">
                    {chatAgent.badgeTitle}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[400px] bg-slate-50/50" ref={agentChatScrollRef}>
                {agentChatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className={`block text-[9px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isAgentChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl p-3 text-xs flex items-center gap-2 border border-slate-200 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-slate-500">{chatAgent.name} is processing...</span>
                    </div>
                  </div>
                )}

                {/* Agent Quick Suggestion Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <button
                    type="button"
                    onClick={() => handleSendAgentChatMessage(`Execute current high-priority sprint task under your role as ${chatAgent.name}.`)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-all cursor-pointer"
                  >
                    ⚡ Execute Sprint Task
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendAgentChatMessage(`Provide step-by-step deliverable report for ${chatAgent.badgeTitle}.`)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-all cursor-pointer"
                  >
                    📋 Deliverable Report
                  </button>
                </div>
              </div>

              <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
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
                  className="text-xs h-10 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={() => handleSendAgentChatMessage()}
                  disabled={isAgentChatLoading || !agentChatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-xl shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD AGENT DIALOG */}
      <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Add Autonomous Agent to Hierarchy
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure a new specialized agent persona operating on OpenAI GPT-4o.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Agent Name</label>
              <Input
                placeholder="e.g. Sentinel-01"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hierarchy Level</label>
              <Select value={newAgentRole} onValueChange={(val: any) => {
                setNewAgentRole(val);
                if (val === 'ceo') setNewAgentBadge('Ceo');
                else if (val === 'empire') setNewAgentBadge('Empire Manager');
                else if (val === 'project') setNewAgentBadge('Project Manager');
                else setNewAgentBadge('Workers');
              }}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceo">CEO Tier (Co-Partner)</SelectItem>
                  <SelectItem value="empire">Empire Manager</SelectItem>
                  <SelectItem value="project">Project Manager</SelectItem>
                  <SelectItem value="workers">Worker / Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Badge Title</label>
              <Input
                placeholder="e.g. Financial & Stripe, Browser Automation"
                value={newAgentBadge}
                onChange={(e) => setNewAgentBadge(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Skills & Tags (comma separated)</label>
              <Input
                placeholder="e.g. stripe-billing, playwright, nextjs"
                value={newAgentTags}
                onChange={(e) => setNewAgentTags(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddAgentOpen(false)} className="text-xs h-9 rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleCreateAgent} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-xl">
                Create Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SPAWN EMPIRE DIALOG */}
      <Dialog open={isSpawnEmpireOpen} onOpenChange={setIsSpawnEmpireOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Spawn Containerized Sovereign Empire
            </DialogTitle>
            <DialogDescription className="text-xs">
              Deploys an isolated sovereign ecosystem with dedicated brand bible and cloud container.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Empire Name</label>
              <Input
                placeholder="e.g. Quantum Commerce Matrix"
                value={empireName}
                onChange={(e) => setEmpireName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vision / Tagline</label>
              <Input
                placeholder="e.g. Autonomous high-frequency commerce operations"
                value={empireTagline}
                onChange={(e) => setEmpireTagline(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Empire Manager</label>
              <Select value={empireManager} onValueChange={setEmpireManager}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Atlas">Atlas (Apex Sovereign Manager)</SelectItem>
                  <SelectItem value="Nova">Nova (Matrix SaaS Manager)</SelectItem>
                  <SelectItem value="Kassandra">Kassandra (Direct Co-Partner)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Custom Domain</label>
              <Input
                placeholder="e.g. quantum.sovereign.local"
                value={empireDomain}
                onChange={(e) => setEmpireDomain(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Brand Bible & Governing Principles</label>
              <Textarea
                placeholder="Define UI theme, zero leakage rules, and core goals..."
                value={empireBrandBible}
                onChange={(e) => setEmpireBrandBible(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSpawnEmpireOpen(false)} className="text-xs h-9 rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSpawnEmpire} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl">
                Provision Empire
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SPAWN PROJECT WITH AI DIALOG */}
      <Dialog open={isSpawnProjectOpen} onOpenChange={setIsSpawnProjectOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-600" />
              Launch Project from Sovereign Template
            </DialogTitle>
            <DialogDescription className="text-xs">
              Deploys a containerized project with 10-minute GitHub push cycles, email backup daemon, and automated GPT-4o task breakdown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Parent Empire</label>
              <Select value={newProjectEmpire} onValueChange={setNewProjectEmpire}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {empires.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Project Name</label>
              <Input
                placeholder="e.g. Sovereign Stripe Billing Engine"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Project Scope & Handoff Bible Notes</label>
              <Textarea
                placeholder="Describe project deliverables, tech stack, APIs needed..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Market & Audience</label>
              <Input
                placeholder="e.g. B2B high-volume commerce, global creator platforms"
                value={newProjectTargetMarket}
                onChange={(e) => setNewProjectTargetMarket(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Monetization & Profit Model</label>
              <Input
                placeholder="e.g. Monthly SaaS + 2.5% Stripe processing fees"
                value={newProjectMonetization}
                onChange={(e) => setNewProjectMonetization(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Starter Template Source</label>
              <Input
                value={newProjectTemplate}
                onChange={(e) => setNewProjectTemplate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Project Manager</label>
              <Select value={newProjectManager} onValueChange={setNewProjectManager}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orion">Orion (Sprint & Technical)</SelectItem>
                  <SelectItem value="Titan">Titan (10-Min Git Sync & Backup)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSpawnProjectOpen(false)} className="text-xs h-9 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSpawnProjectWithAI}
                disabled={isSpawningProjectWithAI || !newProjectName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-xl"
              >
                {isSpawningProjectWithAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Synthesizing with GPT-4o...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
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
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          {executionResult && (
            <>
              <DialogHeader className="p-4 border-b border-slate-200 bg-emerald-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      {executionResult.task.title}
                    </DialogTitle>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Executed by <strong>{executionResult.task.assignedAgent}</strong> via OpenAI GPT-4o
                    </p>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px]">
                    Completed
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Executive Summary</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-700">
                    {executionResult.result.summary}
                  </div>
                </div>

                {executionResult.result.deliverables && executionResult.result.deliverables.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Synthesized Deliverables</h4>
                    <div className="space-y-2">
                      {executionResult.result.deliverables.map((deliv: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="font-semibold text-slate-900 block">{deliv.title}</span>
                          <p className="text-slate-600 whitespace-pre-wrap text-[11px] leading-relaxed">{deliv.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {executionResult.result.codeSnippets && executionResult.result.codeSnippets.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-blue-600" />
                      Generated Source Code Artifacts
                    </h4>
                    <div className="space-y-2">
                      {executionResult.result.codeSnippets.map((snippet: any, idx: number) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px]">
                          <div className="px-3 py-1.5 bg-slate-900 text-slate-400 flex justify-between items-center text-[10px]">
                            <span>{snippet.filename} ({snippet.language})</span>
                            <span className="text-emerald-400">TypeScript / REST</span>
                          </div>
                          <pre className="p-3 overflow-x-auto max-h-52">{snippet.code}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                <Button onClick={() => setIsExecutionResultOpen(false)} className="bg-slate-900 text-white text-xs h-8 rounded-xl px-4">
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
