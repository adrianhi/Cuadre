import { ShieldCheck, Lock, EyeOff, FileText, Database, KeyRound, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingSecuritySection() {
  const securityPillars = [
    {
      icon: EyeOff,
      title: 'Solo lectura con Google API (gmail.readonly)',
      description:
        'El alcance solicitado es estrictamente de lectura. Cuadre no puede redactar correos, eliminarlos, enviar mensajes ni modificar tu cuenta de Gmail.',
    },
    {
      icon: KeyRound,
      title: 'Cero claves bancarias',
      description:
        'Nunca te solicitaremos contraseñas de internet banking, PIN de cajero ni códigos de token. Cuadre no tiene conexión directa de movimiento de fondos con las cuentas bancarias.',
    },
    {
      icon: Lock,
      title: 'Cifrado robusto en reposo (AES-256-GCM)',
      description:
        'Los tokens de sincronización se almacenan cifrados con AES-256-GCM y llaves rotables.',
    },
    {
      icon: Database,
      title: 'Minimización de datos y retención temporal',
      description:
        'Los correos procesados exitosamente no conservan su cuerpo de texto. En caso de fallos de lectura, los mensajes pueden conservarse cifrados hasta 7 días únicamente para diagnósticos técnicos.',
    },
    {
      icon: ShieldCheck,
      title: 'Cumplimiento Limited Use y cero entrenamiento de IA',
      description:
        'Cumplimos con la política de Limited Use de Google: los datos de Workspace/Gmail nunca se usan, transfieren ni venden para entrenar modelos de IA/ML ni para publicidad.',
    },
    {
      icon: FileText,
      title: 'Marco legal dominicano y transparencia',
      description:
        'Publicamos cómo tratamos los datos y tomamos como referencia los principios de la Ley 172-13 de la República Dominicana. Puedes revocar la conexión desde tu panel.',
    },
  ];

  return (
    <section id="seguridad" className="scroll-mt-24 border-t border-slate-800/80 bg-slate-950 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Privacidad y seguridad verificables</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Tu tranquilidad financiera comienza con datos protegidos
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Explicamos cómo cuidamos tu información y cuáles son los límites reales de la plataforma.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {securityPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between landing-card-interactive hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20 transition-all group"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">{pillar.title}</h3>
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal Links bar */}
        <div className="mt-10 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Documentos legales públicos para consulta:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="hover:text-emerald-400 underline underline-offset-4 flex items-center gap-1 transition-colors">
              Política de Privacidad <ExternalLink className="h-3 w-3" />
            </Link>
            <Link to="/terms" className="hover:text-emerald-400 underline underline-offset-4 flex items-center gap-1 transition-colors">
              Términos de Servicio <ExternalLink className="h-3 w-3" />
            </Link>
            <Link to="/legal/google-api-disclosure" className="hover:text-emerald-400 underline underline-offset-4 flex items-center gap-1 transition-colors">
              Divulgación de Google API <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
