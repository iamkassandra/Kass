import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { openAIService } from '@/lib/services/OpenAIService';
import { AgentRole } from '@/types/agents';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const agentName = String(body?.agentName || 'Executive AI').trim();
    const message = String(body?.message || '').trim();
    const agentRole = (body?.agentRole || 'executive') as AgentRole;
    const conversationHistory = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory
      : [];
    const context = typeof body?.context === 'string' ? body.context : undefined;
    const preferredModel =
      typeof body?.preferredModel === 'string' ? body.preferredModel : undefined;
    const useWebSearch = Boolean(body?.useWebSearch);

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'A message prompt is required.' },
        { status: 400 }
      );
    }

    const result = await openAIService.chatWithAgent({
      agentRole,
      agentName,
      message,
      conversationHistory,
      context,
      preferredModel,
      useWebSearch,
    });

    return NextResponse.json({
      success: true,
      model: result.model,
      reply: result.text,
      text: result.text,
      groundingSources: result.groundingSources,
      agent: {
        name: agentName,
        role: agentRole,
      },
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('[API /api/agents/chat] Error:', error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'CHAT_ERROR',
        error: error?.message || 'AI chat generation failed.',
      },
      { status }
    );
  }
});
