import { NextRequest, NextResponse } from 'next/server';
import { openAIService, OPENAI_MODEL } from '@/lib/services/OpenAIService';
import { AgentRole } from '@/types/agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agentRole = 'engineer' as AgentRole,
      agentName = 'Full-Stack Engineer AI',
      taskTitle,
      taskDescription,
      taskPriority = 'high',
      contextData
    } = body;

    if (!taskTitle || !taskDescription) {
      return NextResponse.json({
        success: false,
        error: 'taskTitle and taskDescription are required.'
      }, { status: 400 });
    }

    const executionResult = await openAIService.executeAgentTask({
      agentRole,
      agentName,
      taskTitle,
      taskDescription,
      taskPriority,
      contextData
    });

    return NextResponse.json({
      success: true,
      model: OPENAI_MODEL,
      result: executionResult,
      executedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/agents/execute] Error:', error);
    return NextResponse.json({
      success: false,
      model: OPENAI_MODEL,
      error: error?.message || 'Failed to execute task with OpenAI GPT-4o'
    }, { status: 500 });
  }
}
