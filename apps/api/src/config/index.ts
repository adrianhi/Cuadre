import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function parseCorsOrigins(raw: string | undefined): string[] {
  const list = (raw || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const set = new Set(list);
  for (const origin of list) {
    try {
      const url = new URL(origin);
      if (url.hostname.startsWith('www.')) {
        set.add(`${url.protocol}//${url.hostname.slice(4)}${url.port ? `:${url.port}` : ''}`);
      } else if (!url.hostname.startsWith('localhost') && !url.hostname.includes('127.0.0.1')) {
        set.add(`${url.protocol}//www.${url.hostname}${url.port ? `:${url.port}` : ''}`);
      }
    } catch {
      // ignore malformed URLs
    }
  }
  return Array.from(set);
}

export function parseEmailFrom(raw: string | undefined): string {
  const fallback = 'Cuadre <notificaciones@mail.cuadre.com.do>';
  if (!raw) return fallback;
  let cleaned = raw.trim();
  if (/^EMAIL_FROM\s*=\s*/i.test(cleaned)) {
    cleaned = cleaned.replace(/^EMAIL_FROM\s*=\s*/i, '').trim();
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned || fallback;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  supabasePublishableKey:
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  apiPublicUrl: process.env.API_PUBLIC_URL || 'http://localhost:3000',
  legacyOwnerEmail: process.env.LEGACY_OWNER_EMAIL?.trim().toLowerCase() || '',
  ingestionEncryptionKey: process.env.INGESTION_ENCRYPTION_KEY || '',
  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  googleOAuthRedirectUri:
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${process.env.API_PUBLIC_URL || 'http://localhost:3000'}/api/v1/oauth/google/callback`,
  gmailInitialSyncMonths: Math.min(
    Math.max(parseInt(process.env.GMAIL_INITIAL_SYNC_MONTHS || '2', 10), 1),
    6
  ),
  googlePubSubTopic: process.env.GOOGLE_PUBSUB_TOPIC || '',
  googlePubSubPushAudience: process.env.GOOGLE_PUBSUB_PUSH_AUDIENCE || '',
  googlePubSubPushServiceAccount: process.env.GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT || '',
  gmailReconcileIntervalMinutes: Math.min(
    Math.max(parseInt(process.env.GMAIL_RECONCILE_INTERVAL_MINUTES || '5', 10), 1),
    60
  ),
  gmailWatchRenewalHours: Math.min(
    Math.max(parseInt(process.env.GMAIL_WATCH_RENEWAL_HOURS || '24', 10), 1),
    120
  ),
  gmailSyncConcurrency: Math.min(
    Math.max(parseInt(process.env.GMAIL_SYNC_CONCURRENCY || '4', 10), 1),
    10
  ),
  gmailBackfillConcurrency: Math.min(
    Math.max(parseInt(process.env.GMAIL_BACKFILL_CONCURRENCY || '2', 10), 1),
    4
  ),
  legalProviderName: process.env.LEGAL_PROVIDER_NAME || '',
  legalProviderId: process.env.LEGAL_PROVIDER_ID || '',
  legalContactEmail: process.env.LEGAL_CONTACT_EMAIL || '',
  legalContactAddress: process.env.LEGAL_CONTACT_ADDRESS || '',
  legalAuditSalt: process.env.LEGAL_AUDIT_SALT || '',
  requireBetaInvite: process.env.REQUIRE_BETA_INVITE === 'true',
  processRole: ['all', 'web', 'worker'].includes(process.env.PROCESS_ROLE || '')
    ? (process.env.PROCESS_ROLE as 'all' | 'web' | 'worker')
    : 'all',
  maintenanceSecret: process.env.MAINTENANCE_SECRET || '',
  emailDeliveryMode: (process.env.EMAIL_DELIVERY_MODE === 'LIVE' || (!process.env.EMAIL_DELIVERY_MODE && Boolean(process.env.RESEND_API_KEY) && process.env.NODE_ENV === 'production'))
    ? 'LIVE' as const
    : 'AUDIT' as const,
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET || '',
  emailFrom: parseEmailFrom(process.env.EMAIL_FROM),
  emailUnsubscribeSecret: process.env.EMAIL_UNSUBSCRIBE_SECRET || '',
  emailWeeklyEnabled: process.env.EMAIL_WEEKLY_DIGEST_ENABLED === 'true',
  emailImminentBillEnabled: process.env.EMAIL_IMMINENT_BILL_ENABLED === 'true',
  emailPriceHikeEnabled: process.env.EMAIL_PRICE_HIKE_ENABLED === 'true',
  emailPacingWarningEnabled: process.env.EMAIL_PACING_WARNING_ENABLED === 'true',
  emailPaydayRitualEnabled: process.env.EMAIL_PAYDAY_RITUAL_ENABLED === 'true',
};

export function validateRuntimeConfig() {
  const errors: string[] = [];
  if (!config.databaseUrl) errors.push('DATABASE_URL');
  if (!config.supabaseUrl) errors.push('SUPABASE_URL');
  if (!config.supabasePublishableKey) errors.push('SUPABASE_PUBLISHABLE_KEY');

  if (config.nodeEnv === 'production') {
    if (!config.legalProviderName) errors.push('LEGAL_PROVIDER_NAME');
    if (!config.legalContactEmail) errors.push('LEGAL_CONTACT_EMAIL');
    if (!config.legalContactAddress) errors.push('LEGAL_CONTACT_ADDRESS');
    if (config.legalAuditSalt.length < 32) errors.push('LEGAL_AUDIT_SALT (minimum 32 characters)');
    const encryptionKey = Buffer.from(config.ingestionEncryptionKey, 'base64');
    if (encryptionKey.length !== 32) errors.push('INGESTION_ENCRYPTION_KEY (32 bytes, base64)');
    if (!config.appUrl.startsWith('https://')) errors.push('APP_URL (HTTPS required)');
    if (!config.apiPublicUrl.startsWith('https://')) errors.push('API_PUBLIC_URL (HTTPS required)');
  }

  if (config.emailDeliveryMode === 'LIVE') {
    if (!config.resendApiKey) errors.push('RESEND_API_KEY');
    if (!config.resendWebhookSecret.startsWith('whsec_') || config.resendWebhookSecret.length < 32) errors.push('RESEND_WEBHOOK_SECRET');
    if (!/^.+<[^<>\s]+@[^<>\s]+>$/.test(config.emailFrom)) errors.push('EMAIL_FROM');
    if (config.emailUnsubscribeSecret.length < 32) errors.push('EMAIL_UNSUBSCRIBE_SECRET (minimum 32 characters)');
  }

  const hasGoogleId = Boolean(config.googleOAuthClientId);
  const hasGoogleSecret = Boolean(config.googleOAuthClientSecret);
  if (hasGoogleId !== hasGoogleSecret) {
    errors.push('GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be configured together');
  }
  const googlePushValues = [
    config.googlePubSubTopic,
    config.googlePubSubPushAudience,
    config.googlePubSubPushServiceAccount,
  ];
  if (googlePushValues.some(Boolean) && !googlePushValues.every(Boolean)) {
    errors.push(
      'GOOGLE_PUBSUB_TOPIC, GOOGLE_PUBSUB_PUSH_AUDIENCE and GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT must be configured together'
    );
  }
  if (errors.length) throw new Error(`Invalid runtime configuration: ${errors.join(', ')}`);
}
