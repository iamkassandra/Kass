import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL } from '@/lib/services/OpenAIService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { opportunityName, niche, pricingModel } = body;

    if (!opportunityName) {
      return NextResponse.json({
        success: false,
        error: 'Opportunity name is required.'
      }, { status: 400 });
    }

    const forecast = await openAIService.generateRealTalkForecast({
      opportunityName,
      niche: niche || 'Digital Automation / Micro-SaaS',
      pricingModel: pricingModel || '$79/month Stripe recurring billing'
    });

    return NextResponse.json({
      success: true,
      model: OPENAI_MODEL,
      forecast
    });
  } catch (error: any) {
    console.error('[API /api/agents/forecast-profit] Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to generate 12h incremental real-talk forecast'
    }, { status: 500 });
  }
}
