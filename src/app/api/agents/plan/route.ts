import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL } from '@/lib/services/OpenAIService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { objective, businessType, targetMarket, budget } = body;

    if (!objective || typeof objective !== 'string' || objective.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Objective is required to generate an autonomous project plan.'
      }, { status: 400 });
    }

    const plan = await openAIService.generateAutonomousProjectPlan({
      objective: objective.trim(),
      businessType,
      targetMarket,
      budget: budget ? Number(budget) : undefined
    });

    return NextResponse.json({
      success: true,
      model: OPENAI_MODEL,
      plan,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/agents/plan] Error:', error);
    return NextResponse.json({
      success: false,
      model: OPENAI_MODEL,
      error: error?.message || 'Failed to generate autonomous plan with OpenAI GPT-4o'
    }, { status: 500 });
  }
}
