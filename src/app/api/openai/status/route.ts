import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import {
  openAIService,
  isOpenAIConfigured,
  isGeminiConfigured,
  getActiveModelLabel,
} from '@/lib/services/OpenAIService';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const testPing = searchParams.get('test') === 'true';
    const configured = isGeminiConfigured() || isOpenAIConfigured();

    let pingResult = null;
    if (testPing) {
      pingResult = await openAIService.verifyConnection();
    }

    return NextResponse.json({
      success: true,
      configured,
      geminiConfigured: isGeminiConfigured(),
      openaiConfigured: isOpenAIConfigured(),
      model: getActiveModelLabel(),
      pingResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        configured: isGeminiConfigured() || isOpenAIConfigured(),
        model: getActiveModelLabel(),
        error: error?.message || 'Failed to query AI status',
      },
      { status: 500 }
    );
  }
});
