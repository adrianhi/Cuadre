import { HelpCircle, ChevronDown } from 'lucide-react';

export function LandingFaqSection() {
  const faqs = [
    {
      question: '¿Cuadre me solicitará mi usuario o contraseña de mi banco?',
      answer:
        'No. Cuadre no pide contraseñas de internet banking, claves maestras, PIN ni códigos de token. Tampoco tiene capacidad para mover fondos.',
    },
    {
      question: '¿Qué permiso exacto utiliza Cuadre en mi cuenta de Gmail?',
      answer:
        'Cuadre solicita únicamente el alcance oficial de solo lectura de Google (gmail.readonly). Este permiso solo permite leer correos electrónicos. No permite enviar mensajes, modificarlos, borrarlos ni acceder a tus contactos.',
    },
    {
      question: '¿Qué bancos dominicanos están operativos actualmente?',
      answer:
        'En esta fase de beta privada, contamos con adaptadores de aviso probados y operativos para Banco BHD, Banco Popular Dominicano, Banreservas y Qik Banco Digital. Próximamente sumaremos APAP y Scotiabank República Dominicana.',
    },
    {
      question: '¿Cómo funciona la beta privada de 30 días?',
      answer:
        'Al recibir tu invitación e iniciar sesión, dispones de 30 días de acceso completo a todas las funciones sin costo alguno. No solicitamos número de tarjeta de crédito para activar tu cuenta y no se realizarán cobros automáticos al finalizar el período.',
    },
    {
      question: '¿Qué ocurre si cobro quincenal o mensual?',
      answer:
        'Cuadre está optimizado nativamente para el ritmo laboral dominicano: puedes configurar pagos quincenales (15 y 30), mensuales (1 cobro al mes) o semanales. El Margen Seguro Diario se recalcula considerando exactamente cuántos días faltan para tu próximo cobro.',
    },
    {
      question: '¿Qué costo tiene usar Cuadre durante la beta privada?',
      answer:
        'Cuando recibas una invitación, tendrás 30 días de acceso completo desde la activación. No solicitamos tarjetas ni realizamos cobros automáticos.',
    },
  ];

  return (
    <section id="preguntas" className="scroll-mt-24 border-t border-slate-800/80 bg-slate-950 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            <HelpCircle className="h-4 w-4" />
            <span>Preguntas frecuentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Todo lo que necesitas saber antes de empezar
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Respuestas directas sobre la seguridad de tus cuentas, la lectura de Gmail y los términos de la beta.
          </p>
        </div>

        {/* Accessible Accordion using native details/summary */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 transition-all duration-300 hover:border-slate-700 open:border-emerald-500/30 open:bg-slate-900/80 hover:shadow-md hover:shadow-emerald-950/10"
              data-faq-index={index}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-sm text-white transition-colors hover:text-emerald-300 focus:outline-hidden">
                <span className="pr-4">{faq.question}</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-open:bg-emerald-500/20 group-open:text-emerald-400 transition-transform duration-300 ease-out group-open:rotate-180">
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </summary>
              <div className="mt-3.5 pt-3 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
