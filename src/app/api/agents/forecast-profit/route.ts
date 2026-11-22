import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { openAIService } from '@/lib/services/OpenAIService';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const opportunityName = String(body?.opportunityName || '').trim();
    const targetNiche = String(
      body?.targetNiche || body?.niche || 'Digital Automation / Micro-SaaS'
    ).trim();
    const pricingModel = String(
      body?.pricingModel || '$79/month Stripe recurring billing'
    ).trim();
    const baselineConversionRate = body?.baselineConversionRate
      ? Number(body.baselineConversionRate)
      : undefined;

    if (!opportunityName) {
      return NextResponse.json(
        { success: false, error: 'Opportunity name is required.' },
        { status: 400 }
      );
    }

    const result = await openAIService.generateRealTalkForecast({
      opportunityName,
      targetNiche,
      pricingModel,
      baselineConversionRate,
    });

    return NextResponse.json({
      success: true,
      model: result.model,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/agents/forecast-profit] Error:', error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'FORECAST_ERROR',
        error: error?.message || 'Failed to generate 12h incremental forecast.',
      },
      { status }
    );
  }
});
