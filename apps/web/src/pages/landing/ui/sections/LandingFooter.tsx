import { Link } from 'react-router-dom';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-xs text-slate-500">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-white text-xs">
                C.
              </div>
              <span className="text-base font-bold text-white tracking-tight">Cuadre</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Tu Margen Seguro Diario para tomar decisiones y llegar bien a tu quincena.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Términos de Servicio
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Política de Privacidad
            </Link>
            <span>•</span>
            <Link to="/legal/google-api-disclosure" className="hover:text-slate-300 transition-colors">
              Divulgación de Google API
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {currentYear} Cuadre. Desarrollado en República Dominicana 🇩🇴</p>
          <div className="space-y-1 text-[11px] text-slate-500 max-w-lg">
            <p>
              El uso y transferencia de datos de Google Workspace cumple con la Política de Datos de Usuario de Google, incluidos los requisitos de Limited Use.
            </p>
            <p>
              Consulta nuestra política de privacidad y la referencia informativa a la Ley No. 172-13 de la República Dominicana.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
