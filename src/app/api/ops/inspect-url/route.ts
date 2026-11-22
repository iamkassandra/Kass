import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { validateSafePublicUrl } from '@/lib/ops/ssrfGuard';
import {
  openAIService,
  isGeminiConfigured,
  isOpenAIConfigured,
} from '@/lib/services/OpenAIService';

function extractTagContent(html: string, regex: RegExp): string {
  const m = html.match(regex);
  return m?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const rawUrl = String(body?.url || '').trim();
    const runAiAudit = Boolean(body?.runAiAudit ?? true);

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: 'A target http(s) URL is required.' },
        { status: 400 }
      );
    }

    const safeUrl = await validateSafePublicUrl(rawUrl);
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);

    let response: Response;
    try {
      response = await fetch(safeUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'KOMMANDRA-Live-Inspector/1.0',
          Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        },
      });
    } finally {
      clearTimeout(timer);
    }

    const latencyMs = Date.now() - start;
    const contentType = response.headers.get('content-type') || '';

    // Handle redirect cleanly without silently following into an internal host
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location') || '';
      return NextResponse.json({
        success: true,
        inspection: {
          url: safeUrl.toString(),
          httpStatus: response.status,
          latencyMs,
          contentType,
          redirectLocation: location,
          title: 'HTTP Redirect',
          metaDescription: `Redirects to ${location}`,
          h1: '',
          formsCount: 0,
          linksCount: 0,
          hasStripeCheckoutSignals: false,
          hasViewportMeta: false,
          aiAudit: null,
        },
      });
    }

    const rawText = await response.text();
    const html = rawText.slice(0, 200_000);

    const title = extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescription =
      extractTagContent(
        html,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
      ) ||
      extractTagContent(
        html,
        /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i
      );
    const h1 = extractTagContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').trim();
    const formsCount = (html.match(/<form[\s>]/gi) || []).length;
    const linksCount = (html.match(/<a[\s>]/gi) || []).length;
    const hasStripeCheckoutSignals = /stripe\.com|checkout\.stripe|buy\.stripe|js\.stripe\.com/i.test(
      html
    );
    const hasViewportMeta = /<meta[^>]+name=["']viewport["']/i.test(html);

    let aiAudit: string | null = null;
    if (runAiAudit && (isGeminiConfigured() || isOpenAIConfigured())) {
      try {
        const strippedBody = html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 2200);

        const auditRes = await openAIService.chatWithAgent({
          agentRole: 'testing',
          agentName: 'Puppeteer-01 Conversion Auditor',
          message: `Audit this live webpage snapshot for conversion & checkout readiness in 4 crisp bullets:
URL: ${safeUrl.toString()}
HTTP Status: ${response.status} (${latencyMs}ms)
Title: ${title || '(none)'}
Meta Description: ${metaDescription || '(none)'}
H1: ${h1 || '(none)'}
Forms: ${formsCount}, Links: ${linksCount}, Stripe Signals: ${hasStripeCheckoutSignals}, Mobile Viewport: ${hasViewportMeta}
Excerpt: ${strippedBody}`,
        });
        aiAudit = auditRes.text;
      } catch {
        aiAudit = null;
      }
    }

    return NextResponse.json({
      success: true,
      inspection: {
        url: safeUrl.toString(),
        httpStatus: response.status,
        latencyMs,
        contentType,
        title,
        metaDescription,
        h1,
        formsCount,
        linksCount,
        hasStripeCheckoutSignals,
        hasViewportMeta,
        aiAudit,
      },
    });
  } catch (error: any) {
    const message = error?.message || 'URL inspection failed';
    const isValidation =
      /Invalid URL|Only http|credentials|blocked|restricted|private|resolve/i.test(message);
    return NextResponse.json(
      { success: false, error: message },
      { status: isValidation ? 400 : 502 }
    );
  }
});
