import { Building2, CheckCircle2, Clock } from 'lucide-react';

export function LandingBankCoverageSection() {
  const activeBanks = [
    { name: 'Banco BHD', status: 'Piloto activo', detail: 'Tarjetas de crédito, débito y transferencias' },
    { name: 'Banco Popular Dominicano', status: 'Piloto activo', detail: 'Avisos de consumo y retiros de cuenta' },
    { name: 'Banreservas', status: 'Piloto activo', detail: 'Notificaciones de débito y compras con tarjeta' },
    { name: 'Qik Banco Digital', status: 'Piloto activo', detail: 'Tarjetas digitales, crédito y transacciones' },
  ];

  const upcomingBanks = [
    { name: 'APAP', status: 'Próximamente', detail: 'En fase de desarrollo de adaptadores de aviso' },
    { name: 'Scotiabank República Dominicana', status: 'Próximamente', detail: 'En fase de normalización de formato' },
  ];

  return (
    <section className="border-t border-slate-800/80 bg-slate-900/30 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            <Building2 className="h-4 w-4" />
            <span>Cobertura bancaria dominicana</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Compatibilidad con tus entidades locales
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Reconocemos las notificaciones oficiales por correo electrónico de los bancos dominicanos más utilizados para calcular tu margen sin fricción.
          </p>
        </div>

        {/* Active Pilot Banks */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Operativos en piloto para la beta privada</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeBanks.map((bank) => (
              <div
                key={bank.name}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between landing-card-interactive hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/20 shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase group-hover:bg-emerald-500/20 transition-colors">
                      {bank.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">{bank.name}</h3>
                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">{bank.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Banks */}
        <div className="mt-8 pt-8 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Próximamente en desarrollo</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingBanks.map((bank) => (
              <div
                key={bank.name}
                className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-300">{bank.name}</h3>
                  <p className="mt-1 text-[11px] text-slate-500">{bank.detail}</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 border border-slate-800 bg-slate-900 px-2.5 py-1 rounded-full shrink-0 ml-3">
                  {bank.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
