import { useState } from 'react';
import type { CoroParticipant } from '@/entities/coro';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';

const NEW_PARTICIPANT_VALUE = '__new_participant__';

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
        <Select value={participantId || NEW_PARTICIPANT_VALUE} onValueChange={(value) => {
          const nextId = value === NEW_PARTICIPANT_VALUE ? '' : value;
          setParticipantId(nextId);
          const item = available.find((participant) => participant.id === nextId);
          if (item) setName(item.name);
          else setName('');
        }}>
          <SelectTrigger className="h-10" aria-label="Seleccionar identidad"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NEW_PARTICIPANT_VALUE}>Nombre nuevo</SelectItem>
            {available.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={name} onChange={(event) => { setName(event.target.value); if (selected && event.target.value !== selected.name) setParticipantId(''); }}
          placeholder="Tu nombre" className="h-10 rounded-xl" maxLength={80} />
        <Button disabled={pending || !name.trim()} onClick={() => onClaim({ participantId: participantId || undefined, name: name.trim() })}>
          {pending ? 'Entrando…' : 'Soy yo'}
        </Button>
      </div>
    </section>
  );
}
