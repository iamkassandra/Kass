import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL } from '@/lib/services/OpenAIService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawSnippet, filesOrProjects = '', notes = '' } = body;

    if (!rawSnippet || typeof rawSnippet !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Raw scrap code, file dump, or messy notes required for mining.'
      }, { status: 400 });
    }

    const result = await openAIService.mineScrapBank({
      rawSnippet,
      filesOrProjects,
      notes
    });

    return NextResponse.json({
      success: true,
      model: OPENAI_MODEL,
      result
    });
  } catch (error: any) {
    console.error('[API /api/agents/mine-scraps] Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to mine scrap bank'
    }, { status: 500 });
  }
}
