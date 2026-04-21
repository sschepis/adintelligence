// Domain validation utilities

/**
 * Extracts the domain from an email address
 */
export function getEmailDomain(email: string): string | null {
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return null;
  return parts[1];
}

/**
 * Extracts a clean domain from a URL
 */
export function extractDomainFromUrl(url: string): string {
  try {
    let domain = url.toLowerCase().trim();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0].split('?')[0].split('#')[0];
    return domain;
  } catch {
    return url;
  }
}
