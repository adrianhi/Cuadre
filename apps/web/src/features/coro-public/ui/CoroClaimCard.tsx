import { useState } from 'react';
import type { CoroParticipant } from '@/entities/coro';
import { Button, Input } from '@/shared/ui';

interface Props {
  participants: CoroParticipant[];
  pending?: boolean;
  onClaim: (input: { participantId?: string; name: string }) => void;
}

export function CoroClaimCard({ participants, pending, onClaim }: Props) {
  const available = participants.filter((item) => !item.isClaimed);
  const [participantId, setParticipantId] = useState('');
  const [name, setName] = useState('');
  const selected = available.find((item) => item.id === participantId);
  return (
    <section className="rounded-3xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
      <p className="font-bold">¿Quién eres tú?</p>
      <p className="mt-1 text-sm text-muted-foreground">Elige tu nombre o crea uno para registrar gastos.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select value={participantId} onChange={(event) => {
          setParticipantId(event.target.value);
          const item = available.find((value) => value.id === event.target.value);
          if (item) setName(item.name);
        }} className="h-10 rounded-xl border bg-background px-3 text-sm">
          <option value="">Nombre nuevo</option>
          {available.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <Input value={name} onChange={(event) => { setName(event.target.value); if (selected && event.target.value !== selected.name) setParticipantId(''); }}
          placeholder="Tu nombre" className="h-10 rounded-xl" maxLength={80} />
        <Button disabled={pending || !name.trim()} onClick={() => onClaim({ participantId: participantId || undefined, name: name.trim() })}>
          {pending ? 'Entrando…' : 'Soy yo'}
        </Button>
      </div>
    </section>
  );
}
