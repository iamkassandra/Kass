import fs from 'fs';
import path from 'path';

export interface PersistedWorkspaceState {
  empires: any[];
  projects: any[];
  agents: any[];
  tasks: any[];
  events: any[];
  alerts: any[];
  notes: any[];
  workstationTasks: any[];
  settings: {
    exportEmail: string;
    githubRepo: string;
    autoGitPushIntervalMins: number;
    autoZipEmailIntervalMins: number;
    zeroTelemetryEnforced: boolean;
  };
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const WORKSPACE_FILE = path.resolve(DATA_DIR, 'workspace.json');

function assertConfinedWorkspacePath(target: string): void {
  const resolved = path.resolve(target);
  if (!resolved.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Workspace path escapes data directory');
  }
}

export function getDefaultSettings(): PersistedWorkspaceState['settings'] {
  return {
    exportEmail: 'theaucklandassistant@gmail.com',
    githubRepo: process.env.GITHUB_REPO?.trim() || '',
    autoGitPushIntervalMins: 10,
    autoZipEmailIntervalMins: 10,
    zeroTelemetryEnforced: true,
  };
}

export function readWorkspaceState(): PersistedWorkspaceState | null {
  assertConfinedWorkspacePath(WORKSPACE_FILE);
  try {
    if (!fs.existsSync(WORKSPACE_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(WORKSPACE_FILE, 'utf8');
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as PersistedWorkspaceState;
  } catch (err) {
    console.error('[WorkspaceStore] Failed to read workspace state:', err);
    return null;
  }
}

export function writeWorkspaceState(partial: Partial<PersistedWorkspaceState>): PersistedWorkspaceState {
  assertConfinedWorkspacePath(WORKSPACE_FILE);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }

  const existing = readWorkspaceState();
  const next: PersistedWorkspaceState = {
    empires: Array.isArray(partial.empires) ? partial.empires : existing?.empires || [],
    projects: Array.isArray(partial.projects) ? partial.projects : existing?.projects || [],
    agents: Array.isArray(partial.agents) ? partial.agents : existing?.agents || [],
    tasks: Array.isArray(partial.tasks) ? partial.tasks : existing?.tasks || [],
    events: Array.isArray(partial.events) ? partial.events.slice(0, 100) : existing?.events || [],
    alerts: Array.isArray(partial.alerts) ? partial.alerts : existing?.alerts || [],
    notes: Array.isArray(partial.notes) ? partial.notes : existing?.notes || [],
    workstationTasks: Array.isArray(partial.workstationTasks)
      ? partial.workstationTasks
      : existing?.workstationTasks || [],
    settings: {
      ...getDefaultSettings(),
      ...(existing?.settings || {}),
      ...(partial.settings || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  // Strip any accidental secret fields from settings before persisting
  const sanitizedSettings = {
    exportEmail: String(next.settings.exportEmail || 'theaucklandassistant@gmail.com'),
    githubRepo: String(next.settings.githubRepo || ''),
    autoGitPushIntervalMins: Number(next.settings.autoGitPushIntervalMins || 10),
    autoZipEmailIntervalMins: Number(next.settings.autoZipEmailIntervalMins || 10),
    zeroTelemetryEnforced: Boolean(next.settings.zeroTelemetryEnforced ?? true),
  };
  next.settings = sanitizedSettings;

  const tmpFile = path.resolve(DATA_DIR, `workspace.${process.pid}.${Date.now()}.tmp`);
  assertConfinedWorkspacePath(tmpFile);
  fs.writeFileSync(tmpFile, JSON.stringify(next, null, 2), { mode: 0o600 });
  fs.renameSync(tmpFile, WORKSPACE_FILE);

  return next;
}
