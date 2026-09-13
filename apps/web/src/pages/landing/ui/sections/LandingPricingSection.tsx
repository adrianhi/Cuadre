import { Check, Sparkles, ArrowRight } from 'lucide-react';

export function LandingPricingSection() {
  const plans = [
    {
      name: 'Free',
      price: 'RD$ 0',
      period: 'para siempre',
      badge: 'Básico',
      highlighted: false,
      description: 'Ideal para quienes desean mantener bajo control su margen diario con un solo banco.',
      features: [
        '1 banco compatible conectado',
        'Margen Seguro Diario en vivo',
        'Movimientos manuales ilimitados',
        'Presupuesto mensual global',
        'Historial de los últimos 30 días',
      ],
      ctaText: 'Solicitar acceso a la beta',
    },
    {
      name: 'Pro',
      price: 'RD$ 299',
      period: 'por mes',
      badge: 'Recomendado',
      highlighted: true,
      description: 'Automatización total y tranquilidad para asalariados con múltiples tarjetas y cuentas.',
      features: [
        'Todos los bancos compatibles conectados',
        'Margen Seguro Diario con proyección de quincena',
        'Radar de Cobros recurrentes y suscripciones',
        'Pulso Semanal de salud financiera por email',
        'Analítica avanzada y simulación de compras',
        'Centro de exportación ejecutiva a Excel',
      ],
      ctaText: 'Solicitar acceso a la beta',
    },
  ];

  return (
    <section id="planes" className="scroll-mt-24 border-t border-slate-800/80 bg-slate-900/40 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Transparencia desde el día uno</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Planes previstos después de la beta
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Sin letras pequeñas. Durante la beta privada, todos los usuarios invitados disfrutan de <strong className="text-slate-200 font-semibold">30 días de acceso completo</strong> a todas las funciones sin costo alguno, sin requerir tarjeta ni cobros automáticos.
          </p>
        </div>

        {/* Beta Notice Banner */}
        <div className="mx-auto max-w-2xl mb-12 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
          <p className="text-xs font-medium text-emerald-300">
            ✨ <strong className="text-white">Estado de la beta:</strong> Los planes y límites comerciales entrarán en vigor únicamente tras concluir la fase privada. Todos los accesos actuales son 100% gratuitos durante el período de prueba.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                plan.highlighted
                  ? 'border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 via-slate-900/90 to-slate-900 shadow-2xl shadow-emerald-950/20'
                  : 'border border-slate-800 bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      plan.highlighted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/ {plan.period}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">{plan.description}</p>

                <div className="border-t border-slate-800/80 pt-6">
                  <p className="text-xs font-semibold text-slate-300 mb-3">Incluye:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300 leading-snug">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <a
                  href="#beta-waitlist"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20'
                      : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
