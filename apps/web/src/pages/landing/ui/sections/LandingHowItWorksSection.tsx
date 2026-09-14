import { Mail, CalendarCheck2, Gauge, ArrowRight } from 'lucide-react';

export function LandingHowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Mail,
      title: 'Importa tus movimientos automáticamente',
      description:
        'Conecta tu cuenta de Gmail con acceso estricto de solo lectura. Cuadre identifica únicamente los avisos bancarios de tus entidades seleccionadas. Jamás solicitamos claves de internet banking ni podemos mover fondos.',
      badge: 'Menos trabajo manual',
    },
    {
      number: '02',
      icon: CalendarCheck2,
      title: 'Reserva tus compromisos de la quincena',
      description:
        'Indica tu fecha de cobro (15 y 30, mensual o semanal) y tus cobros fijos habituales (renta, servicios, cuotas). Ese dinero se aparta de inmediato para que no lo gastes por error.',
      badge: 'Protege lo fijo',
    },
    {
      number: '03',
      icon: Gauge,
      title: 'Consulta tu Margen Seguro cada mañana',
      description:
        'Antes de gastar, revisa un solo indicador: tu saldo variable libre repartido en los días restantes. Si gastas menos hoy, mañana tienes más; si gastas más, el plan se adapta sin regaños.',
      badge: 'Decide en 3 segundos',
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-24 border-t border-slate-800/80 bg-slate-900/40 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Paso a paso</p>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Cómo Cuadre te da tranquilidad en 3 pasos
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Sin formularios interminables ni categorías que no recuerdas. El sistema trabaja con la información que tu banco ya te envía.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-7 flex flex-col justify-between landing-card-interactive hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/20 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-black text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20 transition-colors">
                      Paso {step.number}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">{step.title}</h3>
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 shadow-md group-hover:translate-x-0.5 group-hover:border-emerald-500/50 transition-all duration-300">
                      <ArrowRight className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
