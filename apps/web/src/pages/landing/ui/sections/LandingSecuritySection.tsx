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
        'Tus credenciales de autenticación, identificadores y tokens de sincronización se almacenan cifrados con el estándar militar AES-256-GCM y llaves rotables.',
    },
    {
      icon: Database,
      title: 'Minimización de datos y retención temporal',
      description:
        'Los correos procesados exitosamente no conservan su cuerpo de texto. En caso de fallos de lectura, los mensajes pueden conservarse cifrados hasta 7 días únicamente para diagnósticos técnicos.',
    },
    {
      icon: ShieldCheck,
      title: 'Tus finanzas no se comercializan',
      description:
        'No vendemos datos a intermediarios, burós ni redes publicitarias. Tampoco utilizamos tus movimientos para entrenar modelos públicos de inteligencia artificial.',
    },
    {
      icon: FileText,
      title: 'Marco legal dominicano y transparencia',
      description:
        'Diseñado en estricto apego a la Ley 172-13 sobre Protección de Datos Personales de la República Dominicana. Todos los consentimientos son revocables en cualquier momento desde tu panel.',
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
            Explicamos con total claridad técnica cómo cuidamos tu información y cuáles son los límites reales de la plataforma.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {securityPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{pillar.title}</h3>
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
