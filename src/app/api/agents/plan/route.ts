import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { openAIService, getActiveModelLabel } from '@/lib/services/OpenAIService';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const objective = String(body?.objective || '').trim();
    const businessType = body?.businessType ? String(body.businessType) : undefined;
    const targetMarket = body?.targetMarket ? String(body.targetMarket) : undefined;
    const budget = body?.budget ? Number(body.budget) : undefined;

    if (!objective) {
      return NextResponse.json(
        { success: false, error: 'Objective is required to generate a project plan.' },
        { status: 400 }
      );
    }

    const plan = await openAIService.generateAutonomousProjectPlan({
      objective,
      businessType,
      targetMarket,
      budget,
    });

    return NextResponse.json({
      success: true,
      model: getActiveModelLabel(),
      plan,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/agents/plan] Error:', error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'PLAN_ERROR',
        error: error?.message || 'Failed to generate project plan.',
      },
      { status }
    );
  }
});
