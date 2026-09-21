import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL, isOpenAIConfigured } from '@/lib/services/OpenAIService';

export async function GET(req: NextRequest) {
  try {
    const isConfigured = isOpenAIConfigured();
    
    // Check if user requested a live ping test
    const { searchParams } = new URL(req.url);
    const testPing = searchParams.get('test') === 'true';

    let pingResult = null;
    if (testPing && isConfigured) {
      pingResult = await openAIService.verifyConnection();
    }

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      model: OPENAI_MODEL,
      engine: 'OpenAI GPT-4o (Omni)',
      pingResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      configured: isOpenAIConfigured(),
      model: OPENAI_MODEL,
      error: error?.message || 'Failed to query OpenAI status'
    }, { status: 500 });
  }
}
