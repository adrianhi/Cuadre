import crypto from 'crypto';
import type { LegalAcceptanceSource, LegalDocumentType } from '@prisma/client';
import { config } from '../../../config';
import { prisma } from '../../../config/database';
import { AppError } from '../../../errors/app-error';

export {
  CURRENT_LEGAL_VERSION,
  GOOGLE_DISCLOSURE_VERSION,
  REQUIRED_LEGAL_TYPES,
  type LegalTemplate,
} from './legal-templates';
import {
  CURRENT_LEGAL_VERSION,
  GOOGLE_DISCLOSURE_VERSION,
  REQUIRED_LEGAL_TYPES,
  digest,
  templates,
} from './legal-templates';

function evidenceHash(value?: string) {
  if (!value) return null;
  const salt = config.legalAuditSalt || config.ingestionEncryptionKey || 'bills-local-development';
  return crypto.createHmac('sha256', salt).update(value).digest('hex');
}

export class LegalService {
  private static catalogReady: Promise<void> | null = null;

  public static catalog() {
    return templates();
  }

  public static async ensureCatalog() {
    if (this.catalogReady) return this.catalogReady;
    this.catalogReady = this.writeCatalog().catch((error) => {
      this.catalogReady = null;
      throw error;
    });
    return this.catalogReady;
  }

  private static async writeCatalog() {
    const catalog = templates();
    await prisma.$transaction(async (tx) => {
      for (const item of catalog) {
        await tx.legalDocument.updateMany({
          where: { type: item.type, locale: item.locale, NOT: { version: item.version } },
          data: { isCurrent: false },
        });
        await tx.legalDocument.upsert({
          where: {
            type_version_locale: {
              type: item.type,
              version: item.version,
              locale: item.locale,
            },
          },
          create: {
            type: item.type,
            version: item.version,
            locale: item.locale,
            title: item.title,
            slug: item.slug,
            contentHash: digest(item.content),
            isCurrent: true,
            effectiveAt: item.effectiveAt,
          },
          update: {
            title: item.title,
            slug: item.slug,
            contentHash: digest(item.content),
            isCurrent: true,
            effectiveAt: item.effectiveAt,
          },
        });
      }
    });
  }

  public static async current(profileId?: string) {
    await this.ensureCatalog();
    const documents = await prisma.legalDocument.findMany({
      where: { isCurrent: true, locale: 'es-DO' },
      orderBy: { type: 'asc' },
    });
    const acceptedIds = profileId
      ? new Set(
          (
            await prisma.legalAcceptance.findMany({
              where: { profileId, legalDocumentId: { in: documents.map((document) => document.id) } },
              select: { legalDocumentId: true },
            })
          ).map((acceptance) => acceptance.legalDocumentId)
        )
      : new Set<string>();
    const content = new Map(templates().map((item) => [`${item.type}:${item.version}`, item.content]));
    return documents.map((document) => ({
      id: document.id,
      type: document.type,
      version: document.version,
      locale: document.locale,
      title: document.title,
      slug: document.slug,
      effectiveAt: document.effectiveAt,
      contentHash: document.contentHash,
      content: content.get(`${document.type}:${document.version}`) || '',
      required: REQUIRED_LEGAL_TYPES.includes(document.type),
      accepted: acceptedIds.has(document.id),
    }));
  }

  public static async hasCurrentRequired(profileId: string) {
    const documents = await this.current(profileId);
    return documents.filter((document) => document.required).every((document) => document.accepted);
  }

  public static async accept(
    profileId: string,
    requestedDocuments: Array<{ type: LegalDocumentType; version: string }>,
    evidence: { ip?: string; userAgent?: string; source: LegalAcceptanceSource; locale: string }
  ) {
    const current = await this.current(profileId);
    for (const requiredType of REQUIRED_LEGAL_TYPES) {
      const expected = current.find((document) => document.type === requiredType);
      const requested = requestedDocuments.find((document) => document.type === requiredType);
      if (!expected || requested?.version !== expected.version) {
        throw new AppError(409, 'LEGAL_DOCUMENT_OUTDATED', 'Review the current legal documents.');
      }
    }

    const selected = current.filter((document) =>
      requestedDocuments.some(
        (requested) => requested.type === document.type && requested.version === document.version
      )
    );
    await prisma.$transaction(
      selected.map((document) =>
        prisma.legalAcceptance.upsert({
          where: {
            profileId_legalDocumentId: { profileId, legalDocumentId: document.id },
          },
          create: {
            profileId,
            legalDocumentId: document.id,
            source: evidence.source,
            locale: evidence.locale,
            ipHash: evidenceHash(evidence.ip),
            userAgentHash: evidenceHash(evidence.userAgent),
          },
          update: {},
        })
      )
    );
    return this.current(profileId);
  }

  public static async recordGoogleConsent(
    profileId: string,
    inboxConnectionId: string,
    scopes: string[]
  ) {
    await this.ensureCatalog();
    await prisma.integrationConsent.create({
      data: {
        profileId,
        inboxConnectionId,
        provider: 'GOOGLE',
        scopes,
        disclosureVersion: GOOGLE_DISCLOSURE_VERSION,
      },
    });
  }

  public static async revokeGoogleConsent(inboxConnectionId: string) {
    await prisma.integrationConsent.updateMany({
      where: { inboxConnectionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
