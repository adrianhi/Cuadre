import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';

interface LandingHeaderProps {
  hasSession: boolean;
}

export function LandingHeader({ hasSession }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            C.
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white">Cuadre</span>
            <span className="text-xs font-semibold text-emerald-400">Beta</span>
          </div>
        </Link>

        {/* Desktop Anchor Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a href="#como-funciona" className="hover:text-white transition-colors">
            Cómo funciona
          </a>
          <a href="#seguridad" className="hover:text-white transition-colors">
            Seguridad
          </a>
          <a href="#preguntas" className="hover:text-white transition-colors">
            Preguntas
          </a>
        </nav>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-600 shadow-xs"
          >
            {hasSession ? 'Ir a mi panel' : 'Ya tengo invitación'}
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Abrir menú de navegación"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-400 md:hidden hover:bg-slate-900 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="border-t border-slate-800/80 bg-slate-950 px-4 py-3 md:hidden flex flex-col gap-2.5 text-xs font-medium text-slate-300">
          <a
            href="#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 hover:text-emerald-400 transition-colors"
          >
            Cómo funciona
          </a>
          <a
            href="#seguridad"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 hover:text-emerald-400 transition-colors"
          >
            Seguridad
          </a>
          <a
            href="#preguntas"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 hover:text-emerald-400 transition-colors"
          >
            Preguntas frecuentes
          </a>
        </nav>
      )}
    </header>
  );
}
