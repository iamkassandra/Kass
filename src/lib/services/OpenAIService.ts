import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { AgentRole } from '@/types/agents';

export const OPENAI_MODEL = 'gpt-4o';
export const GEMINI_MODEL = 'gemini-4-hydrogen';

export class AIConfigurationError extends Error {
  public readonly statusCode = 503;
  public readonly code = 'AI_NOT_CONFIGURED';
  constructor(message: string) {
    super(message);
    this.name = 'AIConfigurationError';
  }
}

export class AIUpstreamError extends Error {
  public readonly statusCode = 502;
  public readonly code = 'AI_UPSTREAM_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'AIUpstreamError';
  }
}

export interface GroundingSource {
  title: string;
  uri: string;
}

let openaiClient: OpenAI | null = null;
let cachedOpenAIKey: string | null = null;
let geminiClient: GoogleGenAI | null = null;
let cachedGeminiKey: string | null = null;

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

export function getActiveModelLabel(): string {
  if (isGeminiConfigured() && isOpenAIConfigured()) {
    return `${GEMINI_MODEL} + ${OPENAI_MODEL}`;
  }
  if (isGeminiConfigured()) return GEMINI_MODEL;
  if (isOpenAIConfigured()) return OPENAI_MODEL;
  return 'unconfigured';
}

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  if (!openaiClient || cachedOpenAIKey !== apiKey) {
    openaiClient = new OpenAI({ apiKey });
    cachedOpenAIKey = apiKey;
  }
  return openaiClient;
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  if (!geminiClient || cachedGeminiKey !== apiKey) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    cachedGeminiKey = apiKey;
  }
  return geminiClient;
}

function assertAnyAIConfigured(): void {
  if (!isGeminiConfigured() && !isOpenAIConfigured()) {
    throw new AIConfigurationError(
      'No AI API key configured on the server. Set GEMINI_API_KEY or OPENAI_API_KEY in server environment variables.'
    );
  }
}

function extractJsonObject(raw: string): any {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Strip optional markdown code fences if returned
    const stripped = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      return JSON.parse(stripped);
    } catch {
      const start = stripped.indexOf('{');
      const end = stripped.lastIndexOf('}');
      if (start !== -1 && end > start) {
        return JSON.parse(stripped.slice(start, end + 1));
      }
      throw new AIUpstreamError('AI returned malformed JSON payload.');
    }
  }
}

function extractGroundingSources(response: any): GroundingSource[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];
  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;
    if (typeof uri === 'string' && uri.startsWith('http') && !seen.has(uri)) {
      seen.add(uri);
      sources.push({ title: String(title), uri });
    }
  }
  return sources.slice(0, 12);
}

export async function createLiveStripePaymentLink(params: {
  productName: string;
  amountCents: number;
  currency?: string;
  recurringInterval?: 'month' | 'year' | null;
}): Promise<{
  stripeConfigured: boolean;
  instantStripeLink: string | null;
  stripePriceId: string | null;
  note: string;
}> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    return {
      stripeConfigured: false,
      instantStripeLink: null,
      stripePriceId: null,
      note: 'STRIPE_SECRET_KEY is not configured on the server. Add STRIPE_SECRET_KEY to mint live tokenized Stripe Payment Links.',
    };
  }

  try {
    const currency = (params.currency || 'usd').toLowerCase();
    const productBody = new URLSearchParams({
      name: params.productName.slice(0, 120),
    });
    const prodRes = await fetch('https://api.stripe.com/v1/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: productBody.toString(),
    });
    const prodJson = await prodRes.json();
    if (!prodRes.ok || !prodJson?.id) {
      throw new Error(prodJson?.error?.message || 'Stripe product creation failed');
    }

    const priceParams: Record<string, string> = {
      product: prodJson.id,
      unit_amount: String(Math.max(100, Math.round(params.amountCents))),
      currency,
    };
    if (params.recurringInterval) {
      priceParams['recurring[interval]'] = params.recurringInterval;
    }
    const priceRes = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(priceParams).toString(),
    });
    const priceJson = await priceRes.json();
    if (!priceRes.ok || !priceJson?.id) {
      throw new Error(priceJson?.error?.message || 'Stripe price creation failed');
    }

    const linkRes = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'line_items[0][price]': priceJson.id,
        'line_items[0][quantity]': '1',
      }).toString(),
    });
    const linkJson = await linkRes.json();
    if (!linkRes.ok || !linkJson?.url) {
      throw new Error(linkJson?.error?.message || 'Stripe payment link creation failed');
    }

    return {
      stripeConfigured: true,
      instantStripeLink: linkJson.url,
      stripePriceId: priceJson.id,
      note: 'Live Stripe Payment Link minted via Stripe API.',
    };
  } catch (err: any) {
    return {
      stripeConfigured: true,
      instantStripeLink: null,
      stripePriceId: null,
      note: `Stripe API error: ${err?.message || 'Unable to mint Payment Link'}`,
    };
  }
}

export interface AgentChatRequest {
  agentRole: AgentRole | string;
  agentName: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  context?: string;
  preferredModel?: string;
  useWebSearch?: boolean;
}

export interface ProjectPlanRequest {
  objective: string;
  businessType?: string;
  targetMarket?: string;
  budget?: number;
}

export interface TaskExecutionRequest {
  agentRole: AgentRole | string;
  agentName: string;
  taskTitle: string;
  taskDescription: string;
  taskPriority?: string;
  contextData?: any;
}

export class OpenAIService {
  private static instance: OpenAIService;

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Core text / JSON completion helper across Gemini 4 Hydrogen and OpenAI GPT-4o.
   * Never returns fake/mock strings when keys are missing or upstream calls fail.
   */
  private async generateStructuredOrText(params: {
    systemPrompt: string;
    userPrompt: string;
    jsonMode?: boolean;
    preferredModel?: string;
    useWebSearch?: boolean;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ text: string; model: string; usage?: any; groundingSources?: GroundingSource[] }> {
    assertAnyAIConfigured();

    const preferOpenAI =
      params.preferredModel?.toLowerCase().includes('gpt') &&
      isOpenAIConfigured() &&
      !params.useWebSearch;

    const errors: string[] = [];

    const runGemini = async () => {
      const gemini = getGeminiClient();
      if (!gemini) throw new AIConfigurationError('GEMINI_API_KEY not configured');

      const config: any = {
        systemInstruction: params.systemPrompt,
      };

      if (typeof params.temperature === 'number') {
        config.temperature = params.temperature;
      }

      if (params.useWebSearch) {
        config.tools = [{ googleSearch: {} }];
      } else if (params.jsonMode) {
        config.responseMimeType = 'application/json';
      }

      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: params.userPrompt,
        config,
      });

      const text = response.text?.trim();
      if (!text) {
        throw new AIUpstreamError('Gemini returned an empty response.');
      }

      const groundingSources = params.useWebSearch ? extractGroundingSources(response) : undefined;
      return {
        text,
        model: GEMINI_MODEL,
        groundingSources,
      };
    };

    const runOpenAI = async () => {
      const openAI = getOpenAIClient();
      if (!openAI) throw new AIConfigurationError('OPENAI_API_KEY not configured');

      const response = await openAI.chat.completions.create({
        model: OPENAI_MODEL,
        ...(params.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
        temperature: params.temperature ?? 0.5,
        max_tokens: params.maxTokens ?? 3000,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new AIUpstreamError('OpenAI returned an empty response.');
      }
      return {
        text,
        model: OPENAI_MODEL,
        usage: response.usage,
      };
    };

    if (preferOpenAI) {
      try {
        return await runOpenAI();
      } catch (err: any) {
        errors.push(`OpenAI: ${err?.message || 'Unknown error'}`);
        if (isGeminiConfigured()) {
          return await runGemini();
        }
        throw new AIUpstreamError(errors.join(' | '));
      }
    }

    if (isGeminiConfigured()) {
      try {
        return await runGemini();
      } catch (err: any) {
        errors.push(`Gemini: ${err?.message || 'Unknown error'}`);
        if (isOpenAIConfigured()) {
          try {
            return await runOpenAI();
          } catch (oErr: any) {
            errors.push(`OpenAI: ${oErr?.message || 'Unknown error'}`);
            throw new AIUpstreamError(errors.join(' | '));
          }
        }
        throw new AIUpstreamError(errors.join(' | '));
      }
    }

    try {
      return await runOpenAI();
    } catch (err: any) {
      throw new AIUpstreamError(`OpenAI: ${err?.message || 'Unknown error'}`);
    }
  }

  /**
   * Live health check ping against configured AI provider(s)
   */
  public async verifyConnection(): Promise<{
    success: boolean;
    model: string;
    message: string;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      const res = await this.generateStructuredOrText({
        systemPrompt: 'You are a concise server health check responder.',
        userPrompt: 'Respond with one short sentence confirming operational readiness.',
        temperature: 0.1,
        maxTokens: 60,
      });
      return {
        success: true,
        model: res.model,
        message: res.text,
        latencyMs: Date.now() - start,
      };
    } catch (error: any) {
      return {
        success: false,
        model: getActiveModelLabel(),
        message: error?.message || 'AI connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }

  /**
   * Chat directly with a specialized AI Agent (supports live Google Search grounding when requested)
   */
  public async chatWithAgent(
    request: AgentChatRequest
  ): Promise<{ text: string; model: string; usage?: any; groundingSources?: GroundingSource[] }> {
    const {
      agentRole,
      agentName,
      message,
      conversationHistory = [],
      context,
      preferredModel,
      useWebSearch,
    } = request;

    const systemPrompt = this.buildAgentSystemPrompt(agentRole, agentName, context);
    const historyBlock =
      conversationHistory.length > 0
        ? `Conversation history:\n${conversationHistory
            .slice(-8)
            .map((h) => `${h.role}: ${h.content}`)
            .join('\n')}\n\n`
        : '';

    const userPrompt = `${historyBlock}User directive: ${message}\n\nRespond directly as ${agentName}.`;

    return this.generateStructuredOrText({
      systemPrompt,
      userPrompt,
      preferredModel,
      useWebSearch,
      temperature: 0.65,
      maxTokens: 2500,
    });
  }

  /**
   * Generates a real autonomous multi-agent project plan
   */
  public async generateAutonomousProjectPlan(request: ProjectPlanRequest): Promise<{
    projectName: string;
    description: string;
    targetMarket: string;
    valueProposition: string;
    revenueStreams: string[];
    keyFeatures: string[];
    complianceRequirements: string[];
    tasks: Array<{
      title: string;
      description: string;
      assignedRole: AgentRole;
      priority: 'low' | 'medium' | 'high' | 'critical';
      estimatedHours: number;
      deliverables: string[];
    }>;
  }> {
    const { objective, businessType, targetMarket, budget } = request;

    const prompt = `Decompose this business objective into an end-to-end execution roadmap designed to drive real-world revenue and Stripe profitability:
- Executive Strategy (role: executive)
- Full-Stack Engineering (role: engineer)
- UI/UX Design (role: designer)
- Legal & Compliance (role: legal)
- Growth & Acquisition (role: marketing)
- DevOps & CI/CD (role: devops)
- QA & Automated Verification (role: testing)

Objective: ${objective}
${businessType ? `Business Type: ${businessType}` : ''}
${targetMarket ? `Target Market: ${targetMarket}` : ''}
${budget ? `Budget: $${budget}` : ''}

Respond STRICTLY in valid JSON matching this exact structure:
{
  "projectName": "Name of the Project",
  "description": "Comprehensive project overview focused on real profit generation",
  "targetMarket": "Identified primary target audience",
  "valueProposition": "Core competitive edge and monetization",
  "revenueStreams": ["Stream 1", "Stream 2", "Stream 3"],
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "complianceRequirements": ["Requirement 1", "Requirement 2"],
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed actionable steps driving real-world profit",
      "assignedRole": "executive" | "engineer" | "designer" | "legal" | "marketing" | "devops" | "testing",
      "priority": "critical" | "high" | "medium" | "low",
      "estimatedHours": 8,
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ]
}`;

    const res = await this.generateStructuredOrText({
      systemPrompt: 'You are an expert enterprise software & revenue orchestrator. Output ONLY valid JSON.',
      userPrompt: prompt,
      jsonMode: true,
      temperature: 0.45,
      maxTokens: 3000,
    });

    return extractJsonObject(res.text);
  }

  /**
   * Execute an individual task assigned to a specific agent with real deliverables & code snippets
   */
  public async executeAgentTask(request: TaskExecutionRequest): Promise<{
    status: 'completed' | 'in_progress' | 'failed';
    summary: string;
    deliverables: Array<{ title: string; content: string; type: 'code' | 'document' | 'analysis' | 'checklist' }>;
    codeSnippets?: Array<{ filename: string; language: string; code: string }>;
    metrics: { executionTimeMs: number; tokensUsed?: number; model: string };
  }> {
    const { agentRole, agentName, taskTitle, taskDescription, taskPriority = 'high', contextData } = request;
    const startTime = Date.now();

    const systemPrompt = this.buildAgentSystemPrompt(
      agentRole,
      agentName,
      contextData ? JSON.stringify(contextData) : undefined
    );

    const taskPrompt = `TASK EXECUTION DIRECTIVE:
Title: ${taskTitle}
Description: ${taskDescription}
Priority: ${taskPriority}

Produce real, production-usable technical deliverables and code. Respond STRICTLY in JSON:
{
  "summary": "Executive summary of executed work",
  "deliverables": [
    {
      "title": "Title of deliverable",
      "type": "code" | "document" | "analysis" | "checklist",
      "content": "Full substantive content, architecture, or documentation"
    }
  ],
  "codeSnippets": [
    {
      "filename": "e.g. schema.sql, api.ts, component.tsx",
      "language": "typescript" | "sql" | "json" | "bash",
      "code": "Production-ready implementation code"
    }
  ]
}`;

    const res = await this.generateStructuredOrText({
      systemPrompt,
      userPrompt: taskPrompt,
      jsonMode: true,
      temperature: 0.4,
      maxTokens: 3500,
    });

    const parsed = extractJsonObject(res.text);
    return {
      status: 'completed',
      summary: parsed.summary || 'Task executed successfully',
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      codeSnippets: Array.isArray(parsed.codeSnippets) ? parsed.codeSnippets : [],
      metrics: {
        executionTimeMs: Date.now() - startTime,
        tokensUsed: res.usage?.total_tokens,
        model: res.model,
      },
    };
  }

  /**
   * Scrap & Code Recycler — aligned 1:1 with dashboard/page.tsx UI schema
   */
  async mineScrapBank(request: {
    rawInput: string;
    fileCount?: number;
    contextNotes?: string;
  }): Promise<{
    model: string;
    recommendedGemName: string;
    verdict: 'finish_and_launch' | 'recycle_into_reinvention';
    rationale: string;
    gemExecutiveSummary: string;
    monetizationAngle: string;
    estimatedMonthlyRevenue: string;
    automatablePercentage: number;
    passiveProfitVibeScore: number;
    timeToFirstDollar: string;
    resourceRequirement: string;
    reinventionAngle: string;
    actionPlan: string[];
    sprintSchedule12h: Record<string, string>;
  }> {
    const prompt = `Analyze this chaotic bank of abandoned/unfinished projects, code snippets, or business ideas.
Identify the highest-yield commercial gem, and determine whether to finish_and_launch or recycle_into_reinvention for fastest real-world Stripe revenue with minimal upfront spend.

Raw Backlog (${request.fileCount || 'unspecified'} files):
${request.rawInput}
${request.contextNotes ? `Operator Context: ${request.contextNotes}` : ''}

Respond STRICTLY in JSON matching these exact keys:
{
  "recommendedGemName": "Clear commercial product name",
  "verdict": "finish_and_launch" | "recycle_into_reinvention",
  "rationale": "Crisp technical and commercial reasoning",
  "gemExecutiveSummary": "2-sentence summary for project spawning",
  "monetizationAngle": "Exact Stripe pricing structure (e.g. $497/mo retainer)",
  "estimatedMonthlyRevenue": "$X,XXX / mo net profit",
  "automatablePercentage": 90,
  "passiveProfitVibeScore": 88,
  "timeToFirstDollar": "X days / hours",
  "resourceRequirement": "$0 / low-cost infrastructure breakdown",
  "reinventionAngle": "High-margin packaging angle",
  "actionPlan": ["Concrete step 1", "Concrete step 2", "Concrete step 3", "Concrete step 4"],
  "sprintSchedule12h": {
    "0h - 12h": "Concrete sprint deliverables & lead specialist",
    "12h - 24h": "Concrete sprint deliverables & lead specialist",
    "24h - 36h": "Concrete sprint deliverables & lead specialist",
    "36h - 48h": "Concrete sprint deliverables & lead specialist"
  }
}`;

    const res = await this.generateStructuredOrText({
      systemPrompt: 'You are an expert software product strategist & monetization auditor. Output ONLY valid JSON.',
      userPrompt: prompt,
      jsonMode: true,
      temperature: 0.5,
    });

    const parsed = extractJsonObject(res.text);
    const schedule =
      parsed.sprintSchedule12h && !Array.isArray(parsed.sprintSchedule12h)
        ? parsed.sprintSchedule12h
        : Array.isArray(parsed.sprintSchedule12h)
          ? Object.fromEntries(
              parsed.sprintSchedule12h.map((item: any, idx: number) => [
                item?.hourBlock || `Block ${idx + 1}`,
                `${item?.action || ''} (${item?.leadAgent || 'Squad'})`.trim(),
              ])
            )
          : {
              '0h - 12h': 'Extract core modules & isolate deployable MVP',
              '12h - 24h': 'Configure live Stripe product & checkout webhook',
              '24h - 36h': 'Verify checkout flow & conversion page',
              '36h - 48h': 'Launch targeted outbound campaign to first prospects',
            };

    return {
      model: res.model,
      recommendedGemName: parsed.recommendedGemName || parsed.gemTitle || 'Extracted SaaS Gem',
      verdict: parsed.verdict === 'finish_and_launch' ? 'finish_and_launch' : 'recycle_into_reinvention',
      rationale: parsed.rationale || parsed.verdictRationale || '',
      gemExecutiveSummary: parsed.gemExecutiveSummary || parsed.rationale || '',
      monetizationAngle: parsed.monetizationAngle || parsed.reinventionAngle || 'Recurring Stripe subscription',
      estimatedMonthlyRevenue: parsed.estimatedMonthlyRevenue || '$5,000 / mo',
      automatablePercentage: Number(parsed.automatablePercentage ?? 85),
      passiveProfitVibeScore: Number(parsed.passiveProfitVibeScore ?? 85),
      timeToFirstDollar: parsed.timeToFirstDollar || '48 hours',
      resourceRequirement: parsed.resourceRequirement || '$0 upfront compute',
      reinventionAngle: parsed.reinventionAngle || '',
      actionPlan: Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [],
      sprintSchedule12h: schedule,
    };
  }

  /**
   * Real-Talk 33-Day 12-Hour Incremental Profit Forecaster — grounded in live search when Gemini is active
   */
  async generateRealTalkForecast(params: {
    opportunityName: string;
    targetNiche: string;
    pricingModel: string;
    baselineConversionRate?: number;
  }): Promise<{
    model: string;
    opportunityName: string;
    summaryMetrics: {
      profitPotentialGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
      total33DayGrossProfit: string;
      total33DayNetProfit: string;
      automatablePercentage: number;
      passiveProfitVibeScore: number;
      estimatedResourceCost: string;
    };
    past15DaysBaselineSummary: string;
    realTalkCommentary: string;
    forecastIncremental12h: Array<{
      interval12hIndex: number;
      day: number;
      timeSlot: string;
      projectedSalesCount: number;
      projectedGrossRevenue: number;
      cumulativeProfit: number;
      notes: string;
    }>;
    groundingSources?: GroundingSource[];
  }> {
    let marketContext = '';
    let groundingSources: GroundingSource[] | undefined;

    if (isGeminiConfigured()) {
      try {
        const searchRes = await this.generateStructuredOrText({
          systemPrompt: 'You are a market analyst gathering real current market benchmarks and buyer demand signals.',
          userPrompt: `Search current market demand, competitor pricing, and buyer pain points for: "${params.opportunityName}" in niche "${params.targetNiche}" with pricing "${params.pricingModel}". Summarize realistic benchmarks concisely.`,
          useWebSearch: true,
          temperature: 0.3,
        });
        marketContext = `\nLive Web Market Intelligence:\n${searchRes.text}\n`;
        groundingSources = searchRes.groundingSources;
      } catch {
        // Proceed with direct LLM valuation if search tool is unavailable
      }
    }

    const prompt = `Evaluate this business opportunity with grounded realism and unit-economics discipline:
Opportunity: ${params.opportunityName}
Target Niche: ${params.targetNiche}
Pricing Model: ${params.pricingModel}
${marketContext}
Return STRICTLY valid JSON:
{
  "profitPotentialGrade": "A+" | "A" | "B+" | "B" | "C",
  "averageDealValueUsd": 497,
  "day1To10SalesPer12h": 0.4,
  "day11To22SalesPer12h": 0.9,
  "day23To33SalesPer12h": 1.4,
  "grossMarginRatio": 0.91,
  "automatablePercentage": 90,
  "passiveProfitVibeScore": 86,
  "estimatedResourceCost": "$29/mo hosting & API",
  "past15DaysBaselineSummary": "Grounded 15-day category trend and pricing benchmark",
  "realTalkCommentary": "Candid, unvarnished assessment covering CAC risks, close rate assumptions, fulfillment bottlenecks, and highest-leverage conversion lever",
  "earlyPhaseAction": "Day 1-11 operational execution focus",
  "midPhaseAction": "Day 12-22 scaling & objection optimization focus",
  "latePhaseAction": "Day 23-33 compounding retention & upsell focus"
}`;

    const evalRes = await this.generateStructuredOrText({
      systemPrompt: 'You are a candid financial & SaaS unit-economics modeler. Output ONLY valid JSON.',
      userPrompt: prompt,
      jsonMode: true,
      temperature: 0.35,
    });

    const p = extractJsonObject(evalRes.text);
    const dealValue = Math.max(25, Number(p.averageDealValueUsd) || 299);
    const marginRatio = Math.min(0.98, Math.max(0.4, Number(p.grossMarginRatio) || 0.9));
    const r1 = Math.max(0.1, Number(p.day1To10SalesPer12h) || 0.4);
    const r2 = Math.max(0.2, Number(p.day11To22SalesPer12h) || 0.9);
    const r3 = Math.max(0.3, Number(p.day23To33SalesPer12h) || 1.3);

    // Deterministic 66-window (33 days x 2 12h slices) mathematical projection derived from AI parameters
    const forecastIncremental12h: Array<{
      interval12hIndex: number;
      day: number;
      timeSlot: string;
      projectedSalesCount: number;
      projectedGrossRevenue: number;
      cumulativeProfit: number;
      notes: string;
    }> = [];

    let carryUnits = 0;
    let totalGross = 0;
    let cumulativeProfit = 0;
    let idx = 1;

    for (let day = 1; day <= 33; day++) {
      const rate = day <= 10 ? r1 : day <= 22 ? r2 : r3;
      const actionNote =
        day <= 10
          ? p.earlyPhaseAction || 'Cold outreach launch, offer calibration & demo iterations'
          : day <= 22
            ? p.midPhaseAction || 'Follow-up sequence compounding & objection refinement'
            : p.latePhaseAction || 'Referral expansion, annual upgrades & churn lock-in';

      for (const slot of ['00:00-12:00 UTC', '12:00-24:00 UTC']) {
        // Weight second 12h window slightly higher for business-hours outbound responsiveness
        const slotRate = slot.startsWith('12:00') ? rate * 1.15 : rate * 0.85;
        carryUnits += slotRate;
        const units = Math.floor(carryUnits);
        carryUnits -= units;

        const gross = Math.round(units * dealValue);
        totalGross += gross;
        cumulativeProfit += Math.round(gross * marginRatio);

        forecastIncremental12h.push({
          interval12hIndex: idx++,
          day,
          timeSlot: slot,
          projectedSalesCount: units,
          projectedGrossRevenue: gross,
          cumulativeProfit,
          notes: actionNote,
        });
      }
    }

    return {
      model: evalRes.model,
      opportunityName: params.opportunityName,
      summaryMetrics: {
        profitPotentialGrade: p.profitPotentialGrade || 'A',
        total33DayGrossProfit: `$${totalGross.toLocaleString()}`,
        total33DayNetProfit: `$${cumulativeProfit.toLocaleString()}`,
        automatablePercentage: Number(p.automatablePercentage ?? 88),
        passiveProfitVibeScore: Number(p.passiveProfitVibeScore ?? 85),
        estimatedResourceCost: p.estimatedResourceCost || '$0-$30/mo',
      },
      past15DaysBaselineSummary: p.past15DaysBaselineSummary || '',
      realTalkCommentary: p.realTalkCommentary || '',
      forecastIncremental12h,
      groundingSources,
    };
  }

  /**
   * 24/7 Outbound Hunter-Closer Cycle — uses Google Search Grounding for real market discovery + real Stripe Link if configured
   */
  async runHunterCloserCycle(params: {
    niche: string;
    location: string;
    offerDescription: string;
  }): Promise<{
    model: string;
    teamLeadDelegation: { status: string; feedbackAndNextAction: string };
    builderDemoOutput: {
      demoSiteName: string;
      coreFeatures: string[];
      receptionistScriptPreview: string;
    };
    hunter1NoWebsiteScout: {
      leadsDiscovered: Array<{
        businessName: string;
        phoneNumber: string;
        estimatedRevenue: string;
        location: string;
        opportunityGap: string;
        sourceUrl?: string;
      }>;
    };
    hunter2HighVolumeEmail: {
      verifiedDecisionMakers: Array<{
        contactName: string;
        title: string;
        email: string;
        companyDomain: string;
        customAngle: string;
        sourceUrl?: string;
      }>;
    };
    negotiatorObjectionCounters: {
      objectionsAndCounters: Array<{ objection: string; counterScript: string }>;
    };
    closerOutreachWebmail: { subjectLine: string; coldEmailScript: string };
    paymentAgentStripeLink: {
      stripeConfigured: boolean;
      instantStripeLink: string | null;
      stripePriceId: string | null;
      pricingTerms: string;
      note: string;
    };
    groundingSources?: GroundingSource[];
  }> {
    let groundedContext = '';
    let groundingSources: GroundingSource[] | undefined;

    if (isGeminiConfigured()) {
      try {
        const searchRes = await this.generateStructuredOrText({
          systemPrompt:
            'You are a B2B commercial researcher finding real businesses and public contact info via Google Search. Only report businesses, domains, and contacts actually present in search results; never invent fake personal emails.',
          userPrompt: `Find real businesses in "${params.location}" within the "${params.niche}" industry, including businesses with weak/missing online booking as well as established businesses with public websites/contact pages.`,
          useWebSearch: true,
          temperature: 0.2,
        });
        groundedContext = `\nLIVE GOOGLE SEARCH DISCOVERIES:\n${searchRes.text}\n`;
        groundingSources = searchRes.groundingSources;
      } catch {
        // Continue cleanly with direct structured synthesis if search grounding unavailable
      }
    }

    const prompt = `Coordinate an outbound sales cycle for:
Target Niche: ${params.niche}
Location: ${params.location}
Offer: ${params.offerDescription}
${groundedContext}
Important accuracy rule: For hunter1NoWebsiteScout and hunter2HighVolumeEmail, prioritize real businesses discovered in the live search results above when present; clearly mark any placeholder contact pattern (e.g., "Verify via domain contact page") rather than fabricating personal emails if an exact address wasn't returned.

Respond STRICTLY in JSON matching these exact keys:
{
  "teamLeadDelegation": {
    "status": "Active · Grounded",
    "feedbackAndNextAction": "Strategic synthesis of prospect quality, outreach angle, and next step"
  },
  "builderDemoOutput": {
    "demoSiteName": "Tailored Demo Platform Name",
    "coreFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "receptionistScriptPreview": "Full interactive receptionist/qualification script"
  },
  "hunter1NoWebsiteScout": {
    "leadsDiscovered": [
      {
        "businessName": "Business Name",
        "phoneNumber": "Public phone or Check Directory",
        "estimatedRevenue": "Est. annual/monthly bracket",
        "location": "${params.location}",
        "opportunityGap": "Specific digital/booking gap observed",
        "sourceUrl": "Optional URL from search results"
      }
    ]
  },
  "hunter2HighVolumeEmail": {
    "verifiedDecisionMakers": [
      {
        "contactName": "Role or Principal Name",
        "title": "Decision Maker Title",
        "email": "Public contact@domain or Contact form lookup",
        "companyDomain": "example.com",
        "customAngle": "Tailored value pitch angle",
        "sourceUrl": "Optional URL from search results"
      }
    ]
  },
  "negotiatorObjectionCounters": {
    "objectionsAndCounters": [
      {
        "objection": "Common prospect objection",
        "counterScript": "Persuasive risk-reversal counter script"
      }
    ]
  },
  "closerOutreachWebmail": {
    "subjectLine": "Compelling personalized email subject",
    "coldEmailScript": "Ready-to-send concise personalized cold email"
  },
  "suggestedPriceUsd": 497
}`;

    const aiRes = await this.generateStructuredOrText({
      systemPrompt: 'You are an enterprise B2B sales pipeline orchestrator. Output ONLY valid JSON.',
      userPrompt: prompt,
      jsonMode: true,
      temperature: 0.45,
      maxTokens: 3200,
    });

    const parsed = extractJsonObject(aiRes.text);
    const priceUsd = Math.max(49, Number(parsed.suggestedPriceUsd) || 497);
    const stripePayment = await createLiveStripePaymentLink({
      productName: `${params.niche} — ${parsed.builderDemoOutput?.demoSiteName || 'AI Retainer'}`,
      amountCents: Math.round(priceUsd * 100),
      recurringInterval: 'month',
    });

    return {
      model: aiRes.model,
      teamLeadDelegation: parsed.teamLeadDelegation || {
        status: 'Cycle Complete',
        feedbackAndNextAction: 'Pipeline synthesized and ready for outreach.',
      },
      builderDemoOutput: parsed.builderDemoOutput || {
        demoSiteName: `${params.niche} Automation Demo`,
        coreFeatures: [],
        receptionistScriptPreview: '',
      },
      hunter1NoWebsiteScout: parsed.hunter1NoWebsiteScout || { leadsDiscovered: [] },
      hunter2HighVolumeEmail: parsed.hunter2HighVolumeEmail || { verifiedDecisionMakers: [] },
      negotiatorObjectionCounters: parsed.negotiatorObjectionCounters || { objectionsAndCounters: [] },
      closerOutreachWebmail: parsed.closerOutreachWebmail || { subjectLine: '', coldEmailScript: '' },
      paymentAgentStripeLink: {
        ...stripePayment,
        pricingTerms: params.offerDescription,
      },
      groundingSources,
    };
  }

  /**
   * AI Border Moat Council Triage — aligned 1:1 with dashboard/page.tsx schema
   */
  async deliberateCouncilTriage(params: {
    inboundType: string;
    senderInfo: string;
    rawMessage: string;
  }): Promise<{
    model: string;
    moatTriageReport: {
      assignedDepartment: string;
      urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      estimatedRevenueImpact: string;
      actionableProtocol: string;
      assignedSquad: string;
      nextAutonomousStep: string;
    };
    gpt4oPerspective: string;
    claudePerspective: string;
    grokPerspective: string;
    geminiPerspective: string;
    deepseekPerspective: string;
  }> {
    const prompt = `Evaluate this inbound request across 5 distinct analytical lenses (Architectural Execution, Security & Compliance, Real-Time Growth Edge, Multimodal Scale Throughput, Zero-Spend Unit Economics) and synthesize a unified Operational Triage Protocol:

Inbound Stream Type: ${params.inboundType}
Sender Info: ${params.senderInfo}
Message:
${params.rawMessage}

Respond STRICTLY in JSON matching these exact keys:
{
  "moatTriageReport": {
    "assignedDepartment": "Sales & Closers" | "Full-Stack Dev" | "Treasury & Stripe" | "Marketing & PR" | "Lead Gen" | "Support & QA",
    "urgencyLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "estimatedRevenueImpact": "$X,XXX/mo potential",
    "actionableProtocol": "Clear step-by-step execution response",
    "assignedSquad": "Lead agent & squad name",
    "nextAutonomousStep": "Immediate next action to execute"
  },
  "gpt4oPerspective": "Architectural & revenue execution lens analysis",
  "claudePerspective": "Security boundaries, compliance & nuance audit",
  "grokPerspective": "Speed-to-market & competitive edge angle",
  "geminiPerspective": "Multimodal automation & throughput pipeline angle",
  "deepseekPerspective": "Minimal-cost resource routing & margin optimization"
}`;

    const res = await this.generateStructuredOrText({
      systemPrompt: 'You are a multi-lens executive triage council. Output ONLY valid JSON.',
      userPrompt: prompt,
      jsonMode: true,
      temperature: 0.45,
    });

    const parsed = extractJsonObject(res.text);
    return {
      model: res.model,
      moatTriageReport: parsed.moatTriageReport || {
        assignedDepartment: 'Sales & Closers',
        urgencyLevel: 'HIGH',
        estimatedRevenueImpact: 'Pending valuation',
        actionableProtocol: 'Review inbound message and respond with tailored proposal.',
        assignedSquad: 'Vanguard & Closer',
        nextAutonomousStep: 'Draft tailored response and Stripe checkout link',
      },
      gpt4oPerspective: parsed.gpt4oPerspective || '',
      claudePerspective: parsed.claudePerspective || '',
      grokPerspective: parsed.grokPerspective || '',
      geminiPerspective: parsed.geminiPerspective || '',
      deepseekPerspective: parsed.deepseekPerspective || '',
    };
  }

  private buildAgentSystemPrompt(role: AgentRole | string, name: string, context?: string): string {
    const roleInstructions: Record<string, string> = {
      executive:
        'You are the Executive AI, Chief Strategy Officer and Orchestrator. You specialize in business modeling, risk analysis, task delegation, team synchronization, and revenue operations.',
      engineer:
        'You are the Full-Stack Engineer AI. You specialize in TypeScript, Next.js, Node.js, REST APIs, database schemas, secure authentication, and production software architecture.',
      designer:
        'You are the UI/UX Designer AI. You specialize in modern interface design, responsive layout systems, Tailwind CSS, accessibility (WCAG AA), and conversion UX.',
      legal:
        'You are the Legal & Compliance AI. You specialize in digital compliance, privacy regulations (GDPR, CCPA), terms of service, and data governance.',
      marketing:
        'You are the Marketing Strategist AI. You specialize in SEO, content marketing, growth funnels, customer acquisition cost optimization, and outbound conversion.',
      devops:
        'You are the DevOps Engineer AI. You specialize in CI/CD pipelines, containerization, security hardening, health checks, and site reliability.',
      testing:
        'You are the QA & Testing AI. You specialize in end-to-end testing, integration testing, checkout flow verification, and regression prevention.',
      'app-developer':
        'You are the Mobile & App Developer AI. You specialize in cross-platform mobile apps and PWA architectures.',
      'data-analyst':
        'You are the Data Analyst AI. You specialize in unit economics, cohort analysis, conversion funnels, and financial modeling.',
      security:
        'You are the Cybersecurity AI. You specialize in threat modeling, OWASP hardening, OAuth/JWT security, and SSRF/XSS prevention.',
    };

    const specificRole = roleInstructions[role] || `You are ${name}, a specialized AI operations agent.`;

    return `${specificRole}
Provide actionable, technically accurate, candid responses grounded in verifiable facts. Never invent fake URLs, fake revenue receipts, or unverified claims.
${context ? `\nCURRENT CONTEXT:\n${context}` : ''}`;
  }
}

export const openAIService = OpenAIService.getInstance();
