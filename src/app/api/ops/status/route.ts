import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import {
  openAIService,
  isGeminiConfigured,
  isOpenAIConfigured,
  getActiveModelLabel,
  GEMINI_MODEL,
  OPENAI_MODEL,
} from '@/lib/services/OpenAIService';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const testPing = searchParams.get('test') === 'true';

    const geminiConfigured = isGeminiConfigured();
    const openaiConfigured = isOpenAIConfigured();
    const aiConfigured = geminiConfigured || openaiConfigured;
    const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
    const githubConfigured = Boolean(process.env.GITHUB_TOKEN?.trim());
    const emailConfigured = Boolean(
      process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim()
    );

    let pingResult = null;
    if (testPing) {
      pingResult = await openAIService.verifyConnection();
    }

    return NextResponse.json({
      success: true,
      aiConfigured,
      geminiConfigured,
      openaiConfigured,
      stripeConfigured,
      githubConfigured,
      emailConfigured,
      activeModel: getActiveModelLabel(),
      models: {
        gemini: GEMINI_MODEL,
        openai: OPENAI_MODEL,
      },
      configuredGithubRepo: process.env.GITHUB_REPO?.trim() || null,
      pingResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to query server capabilities',
      },
      { status: 500 }
    );
  }
});
