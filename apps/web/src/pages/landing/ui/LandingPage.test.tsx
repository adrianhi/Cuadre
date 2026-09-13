import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders landing page with correct headline and navigation anchors', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage hasSession={false} />
      </MemoryRouter>
    );

    // Headline and subhead
    expect(html).toContain('sin descuadrar tu quincena');
    expect(html).toContain('Beta privada · Cohorte limitada a 100 fundadores');
    expect(html).toContain('30 días de acceso completo');

    // Navigation and session buttons
    expect(html).toContain('Ya tengo invitación');
    expect(html).toContain('href="#como-funciona"');
    expect(html).toContain('href="#seguridad"');
    expect(html).toContain('href="#planes"');
    expect(html).toContain('href="#preguntas"');

    // Waitlist Form
    expect(html).toContain('tu.correo@ejemplo.com');
    expect(html).toContain('Solicitar acceso');
  });

  it('shows panel CTA when user already has an active session', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage hasSession={true} />
      </MemoryRouter>
    );

    expect(html).toContain('Ir a mi panel');
    expect(html).not.toContain('Ya tengo invitación');
  });

  it('displays operating pilot banks and upcoming banks accurately', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage hasSession={false} />
      </MemoryRouter>
    );

    // Active pilot banks
    expect(html).toContain('Banco BHD');
    expect(html).toContain('Banco Popular Dominicano');
    expect(html).toContain('Banreservas');
    expect(html).toContain('Qik Banco Digital');

    // Upcoming banks
    expect(html).toContain('APAP');
    expect(html).toContain('Scotiabank República Dominicana');
  });

  it('shows projected plans Free and Pro with correct prices and no billing active', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage hasSession={false} />
      </MemoryRouter>
    );

    expect(html).toContain('Planes previstos después de la beta');
    expect(html).toContain('RD$ 0');
    expect(html).toContain('RD$ 299');
    expect(html).toContain('Free');
    expect(html).toContain('Pro');
  });

  it('strictly excludes mentions of 90 days and frozen prices', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage hasSession={false} />
      </MemoryRouter>
    );

    expect(html).not.toContain('90 días');
    expect(html).not.toContain('precio congelado');
    expect(html).not.toContain('congelado');
  });

  it('displays verifiable security statements and legal references', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage hasSession={false} />
      </MemoryRouter>
    );

    expect(html).toContain('gmail.readonly');
    expect(html).toContain('AES-256-GCM');
    expect(html).toContain('Cero claves bancarias');
    expect(html).toContain('Ley No. 172-13');
  });
});
