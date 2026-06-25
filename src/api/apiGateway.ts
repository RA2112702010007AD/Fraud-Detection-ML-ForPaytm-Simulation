/**
 * Paytm Safe Shield Security API Gateway (Simulated Backend Core)
 * Following OWASP Top 10 guidelines for:
 * 1. Rate Limiting (IP + User-based sliding window limits to prevent Brute Force & DoS)
 * 2. Strict Input Validation & Sanitization (prevent XSS, injection, & Mass Assignment)
 * 3. Secure API Key Management (Server-side proxy pattern, rotates keys, no keys client-side)
 */

// Interfaces for API Contract
export interface ApiRequest<T> {
  ip: string;
  userId?: string;
  payload: T;
}

export interface ApiResponse<T> {
  status: number;
  statusText: string;
  data?: T;
  error?: {
    message: string;
    details?: string[];
  };
  rateLimit?: {
    limit: number;
    remaining: number;
    resetSeconds: number;
  };
}

// In-memory rate limiting databases (maps IP/User key to request timestamps in ms)
const ipRequestLogs = new Map<string, number[]>();
const userRequestLogs = new Map<string, number[]>();

// Centralized Rate Limiting Configuration
// Window size in seconds, max requests in that window
const RATE_LIMITS = {
  '/api/auth/login': { window: 30, limit: 3 },      // Prevent brute-force logins
  '/api/transactions/create': { window: 60, limit: 5 }, // Prevent transaction spamming/draining
  '/api/ml/retrain': { window: 60, limit: 2 },      // Prevent DoS on expensive training algorithms
};

// Security Logs (Auditable Event Log)
export interface SecurityLogEvent {
  timestamp: Date;
  ip: string;
  userId?: string;
  endpoint: string;
  eventType: 'INFO' | 'SANITISED' | 'BLOCKED_VALIDATION' | 'BLOCKED_RATE_LIMIT' | 'API_KEY_ROTATED' | 'API_KEY_ERROR';
  message: string;
}
export const securityLogs: SecurityLogEvent[] = [];

function logSecurityEvent(
  ip: string,
  endpoint: string,
  eventType: SecurityLogEvent['eventType'],
  message: string,
  userId?: string
) {
  const event: SecurityLogEvent = {
    timestamp: new Date(),
    ip,
    userId,
    endpoint,
    eventType,
    message
  };
  securityLogs.unshift(event);
  // Keep logs at max 100 entries
  if (securityLogs.length > 100) {
    securityLogs.pop();
  }
  // Console logging for developer visibility
  console.warn(`[SAFE SHIELD SECURITY GATEWAY][${eventType}] ${message}`);
}

// API Key server state (mocking backend-only secret store)
let serverSideApiKeyVersion = 1;
// Initialise with .env variable if available, else standard fallback
let activeServerApiKey = import.meta.env.VITE_SAFE_SHIELD_API_KEY || 'paytm_secure_key_2026_v1';

export function getBackendApiKeyStatus() {
  return {
    version: `v${serverSideApiKeyVersion}`,
    maskedKey: activeServerApiKey ? `${activeServerApiKey.slice(0, 12)}****************` : 'MISSING',
    isKeyConfigured: !!activeServerApiKey,
    totalLogs: securityLogs.length
  };
}

/**
 * Rotates the API Key on the simulated server proxy.
 * Mimics zero-downtime secret rotation.
 */
export function rotateBackendApiKey(): string {
  serverSideApiKeyVersion += 1;
  const newKey = `paytm_secure_key_2026_v${serverSideApiKeyVersion}_rotated_${Math.random().toString(36).substring(2, 7)}`;
  activeServerApiKey = newKey;
  logSecurityEvent('127.0.0.1', 'SYSTEM', 'API_KEY_ROTATED', `API key successfully rotated to version v${serverSideApiKeyVersion}`);
  return newKey;
}

/**
 * Simulates server-side environment misconfiguration (clears key) to test alerts.
 */
export function simulateApiKeyConfigFailure(enable: boolean) {
  if (enable) {
    activeServerApiKey = '';
    logSecurityEvent('127.0.0.1', 'SYSTEM', 'API_KEY_ERROR', 'Simulated API key deletion. Backend calls will fail.');
  } else {
    activeServerApiKey = import.meta.env.VITE_SAFE_SHIELD_API_KEY || `paytm_secure_key_2026_v${serverSideApiKeyVersion}`;
    logSecurityEvent('127.0.0.1', 'SYSTEM', 'INFO', 'API key configuration restored.');
  }
}

/**
 * XSS & HTML Injection Sanitizer
 * Strips script tags and escapes special HTML characters to prevent XSS payloads.
 */
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  // 1. Strip script tags recursively
  let sanitized = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // 2. Escape standard characters to prevent rendering malicious scripts
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  return sanitized;
}

/**
 * Sliding Window Log Rate Limiter
 * Returns remaining requests, limit, and reset time, or throws if blocked.
 */
function applyRateLimiter(endpoint: string, ip: string, userId?: string) {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS];
  if (!config) return { limit: 999, remaining: 999, resetSeconds: 0 };

  const now = Date.now();
  const windowMs = config.window * 1000;

  // 1. Check IP-based limits
  const ipKey = `${endpoint}_${ip}`;
  let ipTimestamps = ipRequestLogs.get(ipKey) || [];
  // Filter out timestamps outside the active window
  ipTimestamps = ipTimestamps.filter(t => now - t < windowMs);
  
  // 2. Check User-based limits (if authenticated)
  let userKey = '';
  let userTimestamps: number[] = [];
  if (userId) {
    userKey = `${endpoint}_${userId}`;
    userTimestamps = userRequestLogs.get(userKey) || [];
    userTimestamps = userTimestamps.filter(t => now - t < windowMs);
  }

  // 3. Evaluate limits
  const isIpRateLimited = ipTimestamps.length >= config.limit;
  const isUserRateLimited = userId ? userTimestamps.length >= config.limit : false;

  if (isIpRateLimited || isUserRateLimited) {
    const oldestTimestamp = isIpRateLimited 
      ? ipTimestamps[0] 
      : userTimestamps[0];
    const msSinceOldest = now - oldestTimestamp;
    const resetSeconds = Math.max(1, Math.ceil((windowMs - msSinceOldest) / 1000));
    
    const limitTrigger = isIpRateLimited ? 'IP-based' : 'User-based';
    const limitKey = isIpRateLimited ? ip : userId;

    logSecurityEvent(
      ip, 
      endpoint, 
      'BLOCKED_RATE_LIMIT', 
      `Rate limit exceeded (${limitTrigger} key: ${limitKey}). Window: ${config.window}s, Limit: ${config.limit}. Blocked for ${resetSeconds}s.`,
      userId
    );

    return {
      isBlocked: true,
      limit: config.limit,
      remaining: 0,
      resetSeconds
    };
  }

  // Record active request
  ipTimestamps.push(now);
  ipRequestLogs.set(ipKey, ipTimestamps);

  if (userId) {
    userTimestamps.push(now);
    userRequestLogs.set(userKey, userTimestamps);
  }

  const activeMaxCount = Math.max(ipTimestamps.length, userTimestamps.length);

  return {
    isBlocked: false,
    limit: config.limit,
    remaining: config.limit - activeMaxCount,
    resetSeconds: 0
  };
}

/**
 * Simulates the backend server proxy verifying API key and executing endpoint operations.
 * OWASP practice: backend verifies the secret key, client does not handle it.
 */
function verifySecretApiKey(): boolean {
  if (!activeServerApiKey) {
    return false;
  }
  return true;
}

// -------------------------------------------------------------
// Endpoint Handlers
// -------------------------------------------------------------

/**
 * POST /api/auth/login
 */
export async function simulatedLoginEndpoint(req: ApiRequest<any>): Promise<ApiResponse<any>> {
  const endpoint = '/api/auth/login';
  const { ip, payload } = req;
  const username = payload?.username;

  // 1. Rate Limiting Check
  const rateLimitResult = applyRateLimiter(endpoint, ip, username);
  if (rateLimitResult.isBlocked) {
    return {
      status: 429,
      statusText: 'Too Many Requests',
      error: {
        message: `Too many login attempts. Please wait ${rateLimitResult.resetSeconds} seconds.`
      },
      rateLimit: {
        limit: rateLimitResult.limit,
        remaining: 0,
        resetSeconds: rateLimitResult.resetSeconds
      }
    };
  }

  // 2. Strict Input Validation (Schema Check & Reject Unexpected Fields)
  const allowedFields = ['username', 'password', 'profileId'];
  const payloadKeys = Object.keys(payload || {});
  const hasUnexpectedFields = payloadKeys.some(k => !allowedFields.includes(k));
  
  const errors: string[] = [];
  if (hasUnexpectedFields) {
    errors.push('Unexpected fields detected in request payload. Request rejected.');
  }
  if (!payload || typeof payload !== 'object') {
    errors.push('Invalid request payload structure.');
  } else {
    if (typeof payload.username !== 'string') {
      errors.push('Username must be a string.');
    } else {
      // Validate length limits
      if (payload.username.length < 5 || payload.username.length > 100) {
        errors.push('Username length must be between 5 and 100 characters.');
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.username)) {
        errors.push('Username must be a valid email address.');
      }
    }

    if (typeof payload.password !== 'string') {
      errors.push('Password must be a string.');
    } else {
      if (payload.password.length < 8 || payload.password.length > 100) {
        errors.push('Password must be between 8 and 100 characters.');
      }
    }
  }

  if (errors.length > 0) {
    logSecurityEvent(ip, endpoint, 'BLOCKED_VALIDATION', `Input validation failed: ${errors.join(' | ')}`);
    return {
      status: 400,
      statusText: 'Bad Request',
      error: {
        message: 'Strict input validation failed.',
        details: errors
      }
    };
  }

  // 3. Backend API Key check simulation
  if (!verifySecretApiKey()) {
    logSecurityEvent(ip, endpoint, 'API_KEY_ERROR', 'Service authentication key not configured on server.');
    return {
      status: 500,
      statusText: 'Internal Server Error',
      error: {
        message: 'Backend server authentication key missing or invalid.'
      }
    };
  }

  // 4. Input Sanitization
  const cleanUsername = sanitizeInput(payload.username);
  let sanitizationNotice = '';
  if (cleanUsername !== payload.username) {
    sanitizationNotice = ' (username sanitized for HTML/script tags)';
    logSecurityEvent(ip, endpoint, 'SANITISED', `XSS attempts detected and escaped in login username.`);
  }

  logSecurityEvent(ip, endpoint, 'INFO', `User "${cleanUsername}" authenticated successfully${sanitizationNotice}.`, cleanUsername);

  return {
    status: 200,
    statusText: 'OK',
    data: {
      message: 'Authentication successful.',
      username: cleanUsername,
      authenticatedAt: new Date().toISOString()
    },
    rateLimit: {
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      resetSeconds: 0
    }
  };
}

/**
 * POST /api/transactions/create
 */
export async function simulatedCreateTransactionEndpoint(
  req: ApiRequest<any>
): Promise<ApiResponse<any>> {
  const endpoint = '/api/transactions/create';
  const { ip, userId, payload } = req;

  // 1. Rate Limiting Check
  const rateLimitResult = applyRateLimiter(endpoint, ip, userId);
  if (rateLimitResult.isBlocked) {
    return {
      status: 429,
      statusText: 'Too Many Requests',
      error: {
        message: `Transaction limit exceeded. Please wait ${rateLimitResult.resetSeconds} seconds.`
      },
      rateLimit: {
        limit: rateLimitResult.limit,
        remaining: 0,
        resetSeconds: rateLimitResult.resetSeconds
      }
    };
  }

  // 2. Strict Input Validation (Schema Check & Reject Unexpected Fields)
  const allowedTransactionFields = ['payeeName', 'amount', 'paymentMode', 'features'];
  const allowedFeatureFields = [
    'amount', 'hour', 'velocity_1h', 'amount_velocity_1h', 
    'location_changed', 'device_trusted', 'merchant_risk'
  ];
  
  const errors: string[] = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('Invalid request payload structure.');
  } else {
    // Check unexpected fields in primary transaction payload
    const payloadKeys = Object.keys(payload);
    const hasUnexpected = payloadKeys.some(k => !allowedTransactionFields.includes(k));
    if (hasUnexpected) {
      errors.push('Unexpected parameters detected in transaction request.');
    }

    // Payee Name validation
    if (typeof payload.payeeName !== 'string') {
      errors.push('Payee name must be a string.');
    } else {
      if (payload.payeeName.trim().length < 3 || payload.payeeName.length > 50) {
        errors.push('Payee name must be between 3 and 50 characters.');
      }
      // Strict pattern: only allow letters, numbers, spaces, dots, and hyphens (reject scripts/html)
      const payeeRegex = /^[a-zA-Z0-9\s.-]+$/;
      if (!payeeRegex.test(payload.payeeName)) {
        errors.push('Payee name contains illegal characters. Only alphanumeric, spaces, dot, and dash allowed.');
      }
    }

    // Amount validation
    if (typeof payload.amount !== 'number') {
      errors.push('Amount must be a number.');
    } else {
      if (payload.amount <= 0) {
        errors.push('Amount must be greater than zero.');
      }
      if (payload.amount > 1000000) {
        errors.push('Amount exceeds maximum transaction ceiling of ₹1,000,000.');
      }
    }

    // Payment Mode validation
    const validModes = ['UPI Wallet', 'Paytm Postpaid', 'SBI Bank Account', 'HDFC Credit Card'];
    if (typeof payload.paymentMode !== 'string' || !validModes.includes(payload.paymentMode)) {
      errors.push(`Payment mode must be one of: ${validModes.join(', ')}.`);
    }

    // Features validation (Mass Assignment Check)
    const features = payload.features;
    if (!features || typeof features !== 'object') {
      errors.push('Transaction telemetry features are required.');
    } else {
      const featureKeys = Object.keys(features);
      const hasUnexpectedFeatures = featureKeys.some(k => !allowedFeatureFields.includes(k));
      if (hasUnexpectedFeatures) {
        errors.push('Unexpected machine learning telemetry features submitted.');
      }

      // Feature specific bounds
      if (typeof features.amount !== 'number' || features.amount !== payload.amount) {
        errors.push('Feature amount must match transaction amount.');
      }
      if (typeof features.hour !== 'number' || features.hour < 0 || features.hour > 23) {
        errors.push('Feature hour must be an integer between 0 and 23.');
      }
      if (typeof features.velocity_1h !== 'number' || features.velocity_1h < 1 || features.velocity_1h > 10) {
        errors.push('Feature velocity_1h must be a number between 1 and 10.');
      }
      if (typeof features.amount_velocity_1h !== 'number' || features.amount_velocity_1h !== features.amount * features.velocity_1h) {
        errors.push('Feature amount_velocity_1h must equal amount * velocity.');
      }
      if (features.location_changed !== 0 && features.location_changed !== 1) {
        errors.push('Feature location_changed must be 0 or 1.');
      }
      if (features.device_trusted !== 0 && features.device_trusted !== 1) {
        errors.push('Feature device_trusted must be 0 or 1.');
      }
      if (typeof features.merchant_risk !== 'number' || features.merchant_risk < 0 || features.merchant_risk > 1) {
        errors.push('Feature merchant_risk must be a probability decimal between 0 and 1.');
      }
    }
  }

  if (errors.length > 0) {
    logSecurityEvent(ip, endpoint, 'BLOCKED_VALIDATION', `Input validation failed: ${errors.join(' | ')}`, userId);
    return {
      status: 400,
      statusText: 'Bad Request',
      error: {
        message: 'Strict input validation failed.',
        details: errors
      }
    };
  }

  // 3. Backend API Key check simulation
  if (!verifySecretApiKey()) {
    logSecurityEvent(ip, endpoint, 'API_KEY_ERROR', 'Service authentication key not configured on server.', userId);
    return {
      status: 500,
      statusText: 'Internal Server Error',
      error: {
        message: 'Backend server authentication key missing or invalid.'
      }
    };
  }

  // 4. Input Sanitization (Sanitize text inputs to avoid XSS vector)
  const sanitizedPayee = sanitizeInput(payload.payeeName);
  let sanitizationNotice = '';
  if (sanitizedPayee !== payload.payeeName) {
    sanitizationNotice = ' (payeeName sanitized)';
    logSecurityEvent(ip, endpoint, 'SANITISED', `Escaped HTML/script injection symbols in Payee Name.`);
  }

  logSecurityEvent(
    ip, 
    endpoint, 
    'INFO', 
    `Transaction of ₹${payload.amount} to "${sanitizedPayee}" processed successfully${sanitizationNotice}.`, 
    userId
  );

  return {
    status: 200,
    statusText: 'OK',
    data: {
      message: 'Transaction successfully processed and logged.',
      payeeName: sanitizedPayee,
      amount: payload.amount,
      paymentMode: payload.paymentMode,
      features: payload.features
    },
    rateLimit: {
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      resetSeconds: 0
    }
  };
}

/**
 * POST /api/ml/retrain
 */
export async function simulatedRetrainModelEndpoint(req: ApiRequest<any>): Promise<ApiResponse<any>> {
  const endpoint = '/api/ml/retrain';
  const { ip, userId } = req;

  // 1. Rate Limiting Check
  const rateLimitResult = applyRateLimiter(endpoint, ip, userId);
  if (rateLimitResult.isBlocked) {
    return {
      status: 429,
      statusText: 'Too Many Requests',
      error: {
        message: `Too many retraining requests. Please wait ${rateLimitResult.resetSeconds} seconds.`
      },
      rateLimit: {
        limit: rateLimitResult.limit,
        remaining: 0,
        resetSeconds: rateLimitResult.resetSeconds
      }
    };
  }

  // 2. Input Validation (Verify empty / correct payload)
  const errors: string[] = [];
  if (req.payload && Object.keys(req.payload).length > 0) {
    errors.push('Retraining request payload must be empty. Parameters must not be sent.');
  }

  if (errors.length > 0) {
    logSecurityEvent(ip, endpoint, 'BLOCKED_VALIDATION', `Input validation failed: ${errors.join(' | ')}`, userId);
    return {
      status: 400,
      statusText: 'Bad Request',
      error: {
        message: 'Strict input validation failed.',
        details: errors
      }
    };
  }

  // 3. Backend API Key check simulation
  if (!verifySecretApiKey()) {
    logSecurityEvent(ip, endpoint, 'API_KEY_ERROR', 'Service authentication key not configured on server.', userId);
    return {
      status: 500,
      statusText: 'Internal Server Error',
      error: {
        message: 'Backend server authentication key missing or invalid.'
      }
    };
  }

  logSecurityEvent(ip, endpoint, 'INFO', `Random Forest Model retrained successfully on the backend server.`, userId);

  return {
    status: 200,
    statusText: 'OK',
    data: {
      message: 'Model retrained successfully.',
      timestamp: new Date().toISOString(),
      estimators: 10,
      maxDepth: 5
    },
    rateLimit: {
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      resetSeconds: 0
    }
  };
}
