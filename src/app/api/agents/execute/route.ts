import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { openAIService } from '@/lib/services/OpenAIService';
import { AgentRole } from '@/types/agents';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const agentRole = (body?.agentRole || 'engineer') as AgentRole;
    const agentName = String(body?.agentName || 'Full-Stack Engineer AI').trim();
    const taskTitle = String(body?.taskTitle || '').trim();
    const taskDescription = String(body?.taskDescription || '').trim();
    const taskPriority = String(body?.taskPriority || 'high');
    const contextData = body?.contextData;

    if (!taskTitle || !taskDescription) {
      return NextResponse.json(
        { success: false, error: 'taskTitle and taskDescription are required.' },
        { status: 400 }
      );
    }

    const executionResult = await openAIService.executeAgentTask({
      agentRole,
      agentName,
      taskTitle,
      taskDescription,
      taskPriority,
      contextData,
    });

    return NextResponse.json({
      success: true,
      model: executionResult.metrics.model,
      result: executionResult,
      executedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/agents/execute] Error:', error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'EXECUTE_ERROR',
        error: error?.message || 'Failed to execute task.',
      },
      { status }
    );
  }
});
