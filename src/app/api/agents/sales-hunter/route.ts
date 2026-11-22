import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { openAIService } from '@/lib/services/OpenAIService';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const niche = String(
      body?.niche || body?.targetNiche || 'Local Service Businesses & Clinics'
    ).trim();
    const location = String(
      body?.location || body?.locationOrKeyword || 'Auckland & ANZ Metro'
    ).trim();
    const offerDescription = String(
      body?.offerDescription ||
        'Autonomous AI Receptionist & Stripe Booking Engine ($997 setup + $299/mo)'
    ).trim();

    const result = await openAIService.runHunterCloserCycle({
      niche,
      location,
      offerDescription,
    });

    return NextResponse.json({
      success: true,
      model: result.model,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/agents/sales-hunter] Error:', error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'HUNTER_ERROR',
        error: error?.message || 'Failed to execute hunter-closer sales cycle.',
      },
      { status }
    );
  }
});
