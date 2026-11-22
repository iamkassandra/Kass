import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { openAIService } from '@/lib/services/OpenAIService';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const rawInput = String(body?.rawInput || body?.rawSnippet || '').trim();
    const fileCount = Number(body?.fileCount || 0) || undefined;
    const contextNotes = String(body?.contextNotes || body?.notes || body?.filesOrProjects || '').trim();

    if (!rawInput) {
      return NextResponse.json(
        {
          success: false,
          error: 'Raw scrap code, file dump, or messy notes are required for mining.',
        },
        { status: 400 }
      );
    }

    const result = await openAIService.mineScrapBank({
      rawInput,
      fileCount,
      contextNotes,
    });

    return NextResponse.json({
      success: true,
      model: result.model,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/agents/mine-scraps] Error:', error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'MINE_ERROR',
        error: error?.message || 'Failed to mine scrap bank.',
      },
      { status }
    );
  }
});
