import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import {
  readWorkspaceState,
  writeWorkspaceState,
  getDefaultSettings,
} from '@/lib/storage/WorkspaceStore';

export const GET = withAuth(async (_request: AuthenticatedRequest) => {
  try {
    const state = readWorkspaceState();
    return NextResponse.json({
      success: true,
      initialized: Boolean(state),
      workspace: state || {
        settings: getDefaultSettings(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/workspace GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to read workspace' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid workspace payload' },
        { status: 400 }
      );
    }

    const saved = writeWorkspaceState({
      empires: body.empires,
      projects: body.projects,
      agents: body.agents,
      tasks: body.tasks,
      events: body.events,
      alerts: body.alerts,
      notes: body.notes,
      workstationTasks: body.workstationTasks,
      settings: body.settings,
    });

    return NextResponse.json({
      success: true,
      updatedAt: saved.updatedAt,
    });
  } catch (error: any) {
    console.error('[API /api/workspace PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save workspace' },
      { status: 500 }
    );
  }
});
