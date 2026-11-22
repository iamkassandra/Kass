import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { readWorkspaceState } from '@/lib/storage/WorkspaceStore';
import { buildZipBuffer } from '@/lib/utils/zipBuilder';

function buildExportArchive(payload?: any): Buffer {
  const saved = readWorkspaceState();
  const data = payload && typeof payload === 'object' ? { ...saved, ...payload } : saved || {};
  const timestamp = new Date().toISOString();

  const summaryMd = `# KOMMANDRA Executive Workspace Snapshot
Generated: ${timestamp}
Empires: ${Array.isArray(data.empires) ? data.empires.length : 0}
Projects: ${Array.isArray(data.projects) ? data.projects.length : 0}
Agents: ${Array.isArray(data.agents) ? data.agents.length : 0}
Tasks: ${Array.isArray(data.tasks) ? data.tasks.length : 0}
Notes: ${Array.isArray(data.notes) ? data.notes.length : 0}
`;

  const zipBuffer = buildZipBuffer([
    { name: 'README.md', content: summaryMd },
    { name: 'workspace.json', content: JSON.stringify(data, null, 2) },
    { name: 'empires.json', content: JSON.stringify(data.empires || [], null, 2) },
    { name: 'projects.json', content: JSON.stringify(data.projects || [], null, 2) },
    { name: 'agents.json', content: JSON.stringify(data.agents || [], null, 2) },
    { name: 'tasks.json', content: JSON.stringify(data.tasks || [], null, 2) },
  ]);

  return zipBuffer;
}

export const GET = withAuth(async (_req: AuthenticatedRequest) => {
  try {
    const zipBuffer = buildExportArchive();
    const filename = `kommandra-backup-${new Date().toISOString().slice(0, 10)}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate zip archive' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json().catch(() => ({}));
    const zipBuffer = buildExportArchive(body);
    const filename = `kommandra-backup-${new Date().toISOString().slice(0, 10)}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate zip archive' },
      { status: 500 }
    );
  }
});
