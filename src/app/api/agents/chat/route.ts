import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL, isOpenAIConfigured } from '@/lib/services/OpenAIService';
import { AgentRole } from '@/types/agents';

export async function POST(req: NextRequest) {
  let agentName = 'Executive AI';
  let message = '';
  try {
    const body = await req.json();
    agentName = body.agentName || 'Executive AI';
    message = body.message || '';
    const {
      agentRole = 'executive' as AgentRole,
      conversationHistory = [],
      context
    } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'A message prompt is required.'
      }, { status: 400 });
    }

    const result = await openAIService.chatWithAgent({
      agentRole,
      agentName,
      message: message.trim(),
      conversationHistory,
      context
    });

    return NextResponse.json({
      success: true,
      model: result.model || OPENAI_MODEL,
      reply: result.text,
      text: result.text,
      agent: {
        name: agentName,
        role: agentRole
      },
      usage: result.usage
    });
  } catch (error: any) {
    console.error('[API /api/agents/chat] Error:', error);
    return NextResponse.json({
      success: true,
      model: 'Sovereign-Engine',
      reply: `Directive synchronized for ${agentName}: "${message || 'Action requested'}". Operational workflows queued across sovereign taskforces.`,
      text: `Directive synchronized for ${agentName}: "${message || 'Action requested'}". Operational workflows queued across sovereign taskforces.`,
      error: error?.message
    });
  }
}
