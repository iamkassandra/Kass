import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { openAIService } from '@/lib/services/OpenAIService';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const inboundType = String(body?.inboundType || 'inbound_lead').trim();
    const senderInfo = String(
      body?.senderInfo || body?.sender || 'Client / External Inquiry'
    ).trim();
    const rawMessage = String(body?.rawMessage || '').trim();

    if (!rawMessage) {
      return NextResponse.json(
        { success: false, error: 'Raw inbound message or task is required.' },
        { status: 400 }
      );
    }

    const result = await openAIService.deliberateCouncilTriage({
      inboundType,
      senderInfo,
      rawMessage,
    });

    return NextResponse.json({
      success: true,
      model: result.model,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/agents/council-triage] Error:', error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'COUNCIL_ERROR',
        error: error?.message || 'Failed to deliberate across AI border council.',
      },
      { status }
    );
  }
});
