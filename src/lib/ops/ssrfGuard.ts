import dns from 'dns/promises';
import net from 'net';

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a >= 224) return true; // multicast & reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const norm = ip.toLowerCase();
  if (norm === '::' || norm === '::1') return true;
  if (norm.startsWith('::ffff:')) {
    const embedded = norm.slice(7);
    if (net.isIPv4(embedded)) return isPrivateIPv4(embedded);
  }
  if (norm.startsWith('fc') || norm.startsWith('fd')) return true; // ULA fc00::/7
  if (norm.startsWith('fe8') || norm.startsWith('fe9') || norm.startsWith('fea') || norm.startsWith('feb')) {
    return true; // fe80::/10 link-local
  }
  if (norm.startsWith('ff')) return true; // multicast
  return false;
}

export function isBlockedIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true;
}

export async function validateSafePublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Invalid URL format.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are allowed.');
  }
  if (parsed.username || parsed.password) {
    throw new Error('URLs with embedded credentials are not permitted.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost')
  ) {
    throw new Error('Private or local hostnames are blocked.');
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new Error('Target IP belongs to a restricted or private network.');
    }
    return parsed;
  }

  const records = await dns.lookup(hostname, { all: true });
  if (!records.length) {
    throw new Error('Could not resolve hostname.');
  }
  for (const record of records) {
    if (isBlockedIp(record.address)) {
      throw new Error('Target hostname resolves to a restricted or private network.');
    }
  }

  return parsed;
}
