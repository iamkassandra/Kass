import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL } from '@/lib/services/OpenAIService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inboundType = 'email', rawMessage, sender = 'Client / External API' } = body;

    if (!rawMessage || typeof rawMessage !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Raw inbound message or task is required.'
      }, { status: 400 });
    }

    const result = await openAIService.deliberateCouncilTriage({
      inboundType,
      rawMessage,
      sender
    });

    return NextResponse.json({
      success: true,
      model: OPENAI_MODEL,
      result
    });
  } catch (error: any) {
    console.error('[API /api/agents/council-triage] Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to deliberate across AI moat border council'
    }, { status: 500 });
  }
}
