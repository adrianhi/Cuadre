import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/shared/infrastructure/secret-crypto.service', () => ({
  SecretCryptoService: { decrypt: () => JSON.stringify({ kind: 'QIK', phoneNumber: '8095551234', accountHolder: 'Ana' }) },
}));

import { mapCoroDetail, type CoroDetailRecord } from '../src/modules/coro/infrastructure/coro-detail.mapper';

function record(status: 'ACTIVE' | 'LOCKED' | 'ARCHIVED'): CoroDetailRecord {
  const now = new Date('2026-09-01T12:00:00Z');
  const participant = (id: string, name: string, encrypted: string | null) => ({ id, coroGroupId: 'g', profileId: null,
    name, normalizedName: name.toLowerCase(), isOwner: false, claimTokenHash: 'hash', tokenCreatedAt: now,
    tokenRevokedAt: null, paymentDetailsEncrypted: encrypted, createdAt: now, updatedAt: now });
  const ana = participant('00000000-0000-4000-8000-000000000001', 'Ana', 'encrypted');
  const pedro = participant('00000000-0000-4000-8000-000000000002', 'Pedro', null);
  return { id: '00000000-0000-4000-8000-000000000010', workspaceId: '00000000-0000-4000-8000-000000000020',
    slug: 'secret-slug', name: 'Viaje', description: null, currency: 'DOP', status, lockedAt: now,
    archivedAt: status === 'ARCHIVED' ? now : null, createdAt: now, updatedAt: now,
    participants: [ana, pedro], expenses: [], settlements: status === 'ACTIVE' ? [] : [{
      id: '00000000-0000-4000-8000-000000000030', coroGroupId: '00000000-0000-4000-8000-000000000010',
      fromParticipantId: pedro.id, toParticipantId: ana.id, confirmedByParticipantId: null,
      amount: { toString: () => '100', valueOf: () => 100 } as never, status: 'PENDING', markedPaidAt: null,
      confirmedAt: null, createdAt: now, updatedAt: now, fromParticipant: pedro, toParticipant: ana,
    }] } as CoroDetailRecord;
}

describe('coro payment privacy', () => {
  it('omite datos de pago para visitantes anónimos', () => {
    const detail = mapCoroDetail(record('LOCKED'), null);
    expect(detail.participants[0].paymentDestination).toBeUndefined();
    expect(detail.settlements[0].toPaymentDestination).toBeUndefined();
  });

  it('los revela solo al deudor de una obligación', () => {
    const detail = mapCoroDetail(record('LOCKED'), '00000000-0000-4000-8000-000000000002');
    expect(detail.settlements[0].toPaymentDestination).toMatchObject({ kind: 'QIK', phoneNumber: '8095551234' });
  });

  it('los oculta siempre al archivar', () => {
    const detail = mapCoroDetail(record('ARCHIVED'), '00000000-0000-4000-8000-000000000002');
    expect(detail.settlements[0].toPaymentDestination).toBeUndefined();
  });
});
