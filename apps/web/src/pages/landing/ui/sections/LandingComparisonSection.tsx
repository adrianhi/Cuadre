import { Check, X } from 'lucide-react';

export function LandingComparisonSection() {
  const comparisonPoints = [
    {
      aspect: 'Ingreso de datos',
      traditional: 'Digitar manualmente cada recibo o voucher al salir del comercio.',
      cuadre: 'Automático desde los avisos oficiales de tus bancos vía Gmail.',
    },
    {
      aspect: 'Propósito principal',
      traditional: 'Registrar y clasificar gastos que ya ocurrieron en el mes pasado.',
      cuadre: 'Saber cuánto puedes gastar hoy antes de hacer una compra.',
    },
    {
      aspect: 'Respuesta ante una compra',
      traditional: 'Revisar gráficos de pastel que no te dicen si te alcanza el dinero libre.',
      cuadre: 'Un número claro: tu cuota diaria segura ajustada en tiempo real.',
    },
    {
      aspect: 'Compromisos futuros',
      traditional: 'Fácil olvidar que la renta o la tarjeta vencen la próxima semana.',
      cuadre: 'Reserva automáticamente tus pagos fijos antes de calcular tu margen.',
    },
    {
      aspect: 'Frecuencia salarial',
      traditional: 'Diseñado para mes calendario (1 al 30), ajeno al ritmo de cobro local.',
      cuadre: 'Soporte nativo para quincenas dominicanas (15 y 30) y mensuales.',
    },
  ];

  return (
    <section className="border-t border-slate-800/80 bg-slate-950 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Comparativa objetiva</p>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            La diferencia entre registrar el pasado y decidir en el presente
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Las herramientas contables tradicionales ayudan a saber en qué se fue el dinero. Cuadre está pensado para la decisión que tomas antes de gastar.
          </p>
        </div>

        {/* Desktop Table / Mobile Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Traditional Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 flex flex-col justify-between landing-card-interactive hover:border-slate-700 shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                <h3 className="text-base font-bold text-slate-300">Registro tradicional o manual</h3>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Enfoque retroactivo
                </span>
              </div>

              <ul className="space-y-5">
                {comparisonPoints.map((point) => (
                  <li key={point.aspect} className="flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-400 mt-0.5">
                      <X className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <strong className="text-slate-300 block font-semibold mb-0.5">{point.aspect}:</strong>
                      <span>{point.traditional}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 text-[11px] text-slate-500 pt-4 border-t border-slate-800/80">
              Requiere constancia diaria para anotar y no evita que te descuadres a mitad de quincena.
            </p>
          </div>

          {/* Cuadre Card */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-slate-900/60 to-slate-900/80 p-6 sm:p-8 flex flex-col justify-between landing-card-interactive hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/20 shadow-xl shadow-emerald-950/10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-white shadow-xs shadow-emerald-500/30">
                    C.
                  </span>
                  <h3 className="text-base font-bold text-white">Decisiones con Cuadre</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Enfoque diario en vivo
                </span>
              </div>

              <ul className="space-y-5">
                {comparisonPoints.map((point) => (
                  <li key={point.aspect} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                    <div>
                      <strong className="text-white block font-semibold mb-0.5">{point.aspect}:</strong>
                      <span>{point.cuadre}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 text-[11px] text-emerald-300/80 pt-4 border-t border-emerald-500/20">
              Se alimenta de tus avisos bancarios y recalcula automáticamente tu margen todos los días.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
