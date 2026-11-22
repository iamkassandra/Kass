import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import {
  createLiveStripePaymentLink,
  openAIService,
} from '@/lib/services/OpenAIService';
import { readWorkspaceState } from '@/lib/storage/WorkspaceStore';

const execFileAsync = promisify(execFile);

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const action = String(body?.action || '').trim();

    if (action === 'git_sync') {
      let branch = 'unknown';
      let lastCommit = 'No git commits detected in container';
      let modifiedCount = 0;
      let statusLines: string[] = [];

      try {
        const { stdout: branchOut } = await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
          cwd: process.cwd(),
          timeout: 5000,
        });
        branch = branchOut.trim() || 'main';

        const { stdout: logOut } = await execFileAsync('git', ['log', '-1', '--oneline'], {
          cwd: process.cwd(),
          timeout: 5000,
        });
        lastCommit = logOut.trim() || lastCommit;

        const { stdout: stOut } = await execFileAsync('git', ['status', '--short'], {
          cwd: process.cwd(),
          timeout: 5000,
        });
        statusLines = stOut
          .split('\n')
          .map((l) => l.trimEnd())
          .filter(Boolean);
        modifiedCount = statusLines.length;
      } catch {
        // Workspace may not have a .git directory in sandbox preview
      }

      const githubToken = process.env.GITHUB_TOKEN?.trim();
      const workspace = readWorkspaceState();
      const repoSlug = (
        body?.githubRepo ||
        workspace?.settings?.githubRepo ||
        process.env.GITHUB_REPO ||
        ''
      )
        .trim()
        .replace(/^https?:\/\/github\.com\//i, '')
        .replace(/\.git$/i, '');

      let remoteVerified = false;
      let remoteSummary = 'Local git status checked. Set GITHUB_TOKEN and GITHUB_REPO (owner/repo) on the server to sync with GitHub API.';

      if (githubToken && repoSlug && /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(repoSlug)) {
        const ghRes = await fetch(`https://api.github.com/repos/${repoSlug}`, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'KOMMANDRA-Ops',
          },
        });
        const ghJson = await ghRes.json().catch(() => ({}));
        if (!ghRes.ok) {
          return NextResponse.json(
            {
              success: false,
              error: `GitHub API verification failed for ${repoSlug}: ${ghJson?.message || ghRes.status}`,
            },
            { status: 502 }
          );
        }
        remoteVerified = true;
        remoteSummary = `Connected to GitHub repo ${ghJson.full_name} (default branch: ${ghJson.default_branch}, visibility: ${ghJson.private ? 'private' : 'public'}).`;
      }

      return NextResponse.json({
        success: true,
        branch,
        lastCommit,
        modifiedCount,
        statusLines: statusLines.slice(0, 20),
        remoteVerified,
        repoSlug: repoSlug || null,
        message: remoteSummary,
      });
    }

    if (action === 'send_email') {
      const to = String(body?.to || '').trim();
      const subject = String(body?.subject || '').trim();
      const text = String(body?.text || '').trim();

      if (!to || !subject || !text) {
        return NextResponse.json(
          { success: false, error: 'Recipient (to), subject, and text body are required.' },
          { status: 400 }
        );
      }

      const resendKey = process.env.RESEND_API_KEY?.trim();
      const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
      if (!resendKey || !fromEmail) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Outbound email is not configured on the server. Set RESEND_API_KEY and RESEND_FROM_EMAIL environment variables to send real emails.',
          },
          { status: 503 }
        );
      }

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          text,
        }),
      });
      const emailJson = await emailRes.json().catch(() => ({}));
      if (!emailRes.ok) {
        return NextResponse.json(
          {
            success: false,
            error: emailJson?.message || 'Resend API failed to send email.',
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        id: emailJson.id,
        message: `Email dispatched via Resend to ${to}.`,
      });
    }

    if (action === 'create_stripe_link') {
      const productName = String(body?.productName || 'KOMMANDRA Retainer').trim();
      const amountUsd = Number(body?.amountUsd || 497);
      const recurringInterval =
        body?.recurringInterval === 'year'
          ? 'year'
          : body?.recurringInterval === null
            ? null
            : 'month';

      const result = await createLiveStripePaymentLink({
        productName,
        amountCents: Math.round(amountUsd * 100),
        recurringInterval,
      });

      if (!result.stripeConfigured) {
        return NextResponse.json(
          { success: false, error: result.note },
          { status: 503 }
        );
      }
      if (!result.instantStripeLink) {
        return NextResponse.json(
          { success: false, error: result.note },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    if (action === 'run_agent_diagnostic') {
      const agentName = String(body?.agentName || 'Korban');
      const agentRole = String(body?.agentRole || 'executive');
      const start = Date.now();
      const reply = await openAIService.chatWithAgent({
        agentRole,
        agentName,
        message:
          'Run a concise 2-sentence operational readiness check confirming active capability, current focus, and SLA readiness.',
      });
      return NextResponse.json({
        success: true,
        latencyMs: Date.now() - start,
        model: reply.model,
        diagnosticOutput: reply.text,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown operational action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, error: error?.message || 'Operational action failed' },
      { status }
    );
  }
});
