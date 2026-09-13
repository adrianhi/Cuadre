import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, HelpCircle, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';

interface LandingHeaderProps {
  hasSession: boolean;
}

const NAV_ITEMS = [
  {
    href: '#como-funciona',
    label: 'Cómo funciona',
    description: 'Tu margen diario a partir de bancos',
    icon: Sparkles,
  },
  {
    href: '#seguridad',
    label: 'Seguridad y Privacidad',
    description: 'Cifrado AES-256 y solo lectura',
    icon: ShieldCheck,
  },
  {
    href: '#preguntas',
    label: 'Preguntas frecuentes',
    description: 'Dudas sobre la beta de 30 días',
    icon: HelpCircle,
  },
];

export function LandingHeader({ hasSession }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl pt-[env(safe-area-inset-top)] transition-colors">
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-600 shadow-xs active:scale-95"
          >
            {hasSession ? 'Ir a mi panel' : 'Ya tengo invitación'}
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90 md:hidden ${
              mobileMenuOpen
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 animate-in fade-in zoom-in-75 duration-150" />
            ) : (
              <Menu className="h-4 w-4 animate-in fade-in zoom-in-75 duration-150" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-full -z-10 h-screen bg-slate-950/70 backdrop-blur-md md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          mobileMenuOpen
            ? 'max-h-[480px] opacity-100 py-3 border-t border-slate-800/60'
            : 'max-h-0 opacity-0 py-0 pointer-events-none'
        }`}
      >
        <div className="mx-4 space-y-2 rounded-2xl border border-white/10 bg-slate-900/90 p-3.5 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl">
          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between rounded-xl p-2.5 transition-all hover:bg-white/5 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-colors group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 group-hover:scale-105">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100 transition-colors group-hover:text-emerald-400">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                </a>
              );
            })}
          </nav>

          {/* Drawer CTA Action */}
          <div className="pt-2 border-t border-white/5">
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <span>{hasSession ? 'Ir a mi panel' : 'Ya tengo invitación'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Secondary Footer Links */}
          <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-500">
            <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-300 transition-colors">
              Términos
            </Link>
            <span>•</span>
            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-300 transition-colors">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
