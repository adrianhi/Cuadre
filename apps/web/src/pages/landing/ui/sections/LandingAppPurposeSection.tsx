import { ShieldCheck, MailCheck, Lock, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingAppPurposeSection() {
  return (
    <section id="proposito" className="scroll-mt-24 border-t border-slate-800/80 bg-slate-900/50 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-slate-950 p-6 sm:p-10 shadow-xl shadow-emerald-950/10">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>Propósito de la aplicación</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ¿Qué es Cuadre y para qué se utiliza?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                <strong className="text-white">Cuadre</strong> (también identificada como <span className="text-emerald-300 font-semibold">cuadre</span>) es una aplicación web de finanzas personales diseñada para la República Dominicana. Su propósito principal es calcular cada mañana tu <em>Margen Seguro Diario</em> a partir de tus ingresos y compromisos fijos, ayudándote a saber exactamente cuánto puedes gastar cada día sin descuadrar tu quincena ni arriesgar tus pagos obligatorios (renta, servicios, cuotas de préstamos y ahorros).
              </p>

              <div className="pt-2 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MailCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Uso de la integración con Google y alcance de Gmail (gmail.readonly)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Para que no tengas que digitar manualmente cada factura o voucher de compra, Cuadre permite a los usuarios conectar opcionalmente su cuenta de Google mediante el permiso oficial de solo lectura (<code className="text-emerald-300 font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded break-all">https://www.googleapis.com/auth/gmail.readonly</code>).
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  El sistema utiliza este acceso exclusivamente para identificar y leer los avisos automáticos de consumo y transferencias enviados por los bancos dominicanos autorizados por el usuario (Banco BHD, Banco Popular Dominicano, Banreservas y Qik Banco Digital). A partir de ellos extrae únicamente la fecha, el monto y el nombre del comercio.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-80 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3.5 text-xs text-slate-300 shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Garantías de seguridad</span>
              </div>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Solo lectura:</strong> No redactamos, no enviamos y no eliminamos correos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Cero claves bancarias:</strong> Nunca solicitamos contraseñas ni PINs de banca en línea.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Sin mover fondos:</strong> Cuadre no puede transferir ni manipular dinero.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Privacidad estricta:</strong> No leemos mensajes personales ni comercializamos tus datos.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-1.5 text-[11px]">
                <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Política de Privacidad <ExternalLink className="h-3 w-3" />
                </Link>
                <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Términos de Servicio <ExternalLink className="h-3 w-3" />
                </Link>
                <Link to="/legal/google-api-disclosure" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Divulgación de Google API <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
