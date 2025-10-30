/**
 * Security utilities for FHE operations
 */

/**
 * Validate that a value is within safe encryption bounds
 */
export function validateEncryptionValue(
  value: number,
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' = 'euint32'
): { valid: boolean; error?: string } {
  const maxValues = {
    euint8: 2 ** 8 - 1,
    euint16: 2 ** 16 - 1,
    euint32: 2 ** 32 - 1,
    euint64: Number.MAX_SAFE_INTEGER
  };

  const max = maxValues[type];

  if (value < 0) {
    return {
      valid: false,
      error: `Value must be non-negative (got ${value})`
    };
  }

  if (value > max) {
    return {
      valid: false,
      error: `Value exceeds maximum for ${type} (max: ${max}, got: ${value})`
    };
  }

  return { valid: true };
}

/**
 * Sanitize user input before encryption
 */
export function sanitizeInput(value: any): number | null {
  if (value === null || value === undefined) return null;

  const num = Number(value);

  if (isNaN(num)) return null;
  if (!isFinite(num)) return null;

  return Math.floor(num);
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 6): string {
  if (data.length <= visibleChars * 2) return data;

  return `${data.slice(0, visibleChars)}...${data.slice(-visibleChars)}`;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  canMakeRequest(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  reset(): void {
    this.timestamps = [];
  }
}
