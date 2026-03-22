// Domain validation utilities
// NOTE: Anti-spam features disabled for development/testing

/**
 * Extracts the domain from an email address
 */
export function getEmailDomain(email: string): string | null {
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return null;
  return parts[1];
}

/**
 * Checks if an email is from a free/consumer provider
 * DISABLED: Always returns false for testing
 */
export function isFreeEmailProvider(email: string): boolean {
  return false; // Disabled for testing
}

/**
 * Validates that an email matches a specific domain
 * DISABLED: Always returns true for testing
 */
export function emailMatchesDomain(email: string, websiteUrl: string): boolean {
  return true; // Disabled for testing
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
