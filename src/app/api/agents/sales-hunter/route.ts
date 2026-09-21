import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL } from '@/lib/services/OpenAIService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetNiche, locationOrKeyword, offerDescription } = body;

    const result = await openAIService.runHunterCloserCycle({
      targetNiche: targetNiche || 'Local Service Businesses & Clinics',
      locationOrKeyword: locationOrKeyword || 'Auckland & ANZ Metro',
      offerDescription: offerDescription || 'Autonomous AI Receptionist & Stripe Booking Engine ($997 setup + $299/mo)'
    });

    return NextResponse.json({
      success: true,
      model: OPENAI_MODEL,
      result
    });
  } catch (error: any) {
    console.error('[API /api/agents/sales-hunter] Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to run hunter-closer sales cycle'
    }, { status: 500 });
  }
}
