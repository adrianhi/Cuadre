export interface BankBenefit {
  title: string;
  description: string;
}

export interface BankFaq {
  question: string;
  answer: string;
}

export interface SupportedBankProfile {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  legalEntityName: string;
  accentColor: string;
  accentClass: string;
  borderClass: string;
  bgGlowClass: string;
  metaTitle: string;
  metaDescription: string;
  heroBadge: string;
  tagline: string;
  overview: string;
  emailSender: string;
  supportedInstruments: string[];
  benefits: BankBenefit[];
  faqs: BankFaq[];
}

export const supportedBanks: SupportedBankProfile[] = [
  {
    slug: 'popular',
    code: 'POPULAR',
    name: 'Banco Popular Dominicano',
    shortName: 'Popular',
    legalEntityName: 'Banco Popular Dominicano, S.A. - Banco Múltiple',
    accentColor: '#0070ba',
    accentClass: 'text-sky-400',
    borderClass: 'border-sky-500/30 hover:border-sky-500/60',
    bgGlowClass: 'from-sky-950/20 via-slate-900/80 to-slate-950',
    metaTitle: 'Banco Popular Dominicano • Control de Gastos y Quincena con Cuadre',
    metaDescription: 'Controla tus consumos del Banco Popular Dominicano de forma automática. Cuadre procesa tus avisos de compra y calcula tu margen diario seguro sin pedir claves.',
    heroBadge: 'Compatibilidad Oficial con Banco Popular',
    tagline: 'Decide antes de gastar con tus tarjetas y cuentas del Popular',
    overview: 'Cuadre lee los avisos oficiales de consumo del Banco Popular Dominicano que llegan a tu cuenta de Gmail. Sin digitar comprobantes ni entrar a Internet Banking: cada mañana sabes exactamente cuánto puedes gastar sin afectar tus compromisos fijos.',
    emailSender: 'avisos@popularenlinea.com',
    supportedInstruments: [
      'Tarjetas de Crédito Visa y Mastercard del Popular',
      'Tarjetas de Débito y cuentas de nómina',
      'Avisos de transferencias y pagos de servicios',
      'Consumos en pesos dominicanos (DOP) y dólares (USD)',
    ],
    benefits: [
      {
        title: 'Lectura de Avisos de Consumo Popular',
        description: 'Procesa los correos automáticos de compra en tiendas físicas y en línea, extrayendo monto, fecha y comercio en segundos.',
      },
      {
        title: 'Protección de Pagos Quincenales',
        description: 'Separa de antemano el pago de tu tarjeta Popular, cuotas de préstamos o servicios para que no los gastes por descuido.',
      },
      {
        title: 'Cero Acceso a Popularenlinea',
        description: 'Jamás te pediremos usuario, contraseña, token ni coordenadas de tu banca en línea. Todo funciona vía avisos oficiales por Gmail.',
      },
      {
        title: 'Margen Seguro Cada Mañana',
        description: 'Tu dinero variable restante se recalcula día a día. Si hoy gastas menos, mañana tienes más margen disponible para disfrutar.',
      },
    ],
    faqs: [
      {
        question: '¿Qué tipo de avisos del Banco Popular son compatibles con Cuadre?',
        answer: 'Cuadre reconoce los avisos de compra y transacciones generados automáticamente por el Banco Popular para compras presenciales y en línea con tarjetas de crédito y débito.',
      },
      {
        question: '¿Debo configurar algo en mi cuenta de Popularenlinea?',
        answer: 'Solo necesitas tener habilitadas las notificaciones por correo de tus consumos, servicio que el Banco Popular ofrece de manera estándar y gratuita a sus clientes.',
      },
      {
        question: '¿Tiene Cuadre acceso a mover dinero en mis cuentas del Popular?',
        answer: 'No. El permiso solicitado a Google (gmail.readonly) es estrictamente de solo lectura. Cuadre no tiene integración bancaria directa para debitar, transferir ni modificar tus fondos.',
      },
      {
        question: '¿Puedo combinar Banco Popular con otros bancos dominicanos?',
        answer: 'Sí. Cuadre unifica en un solo Margen Seguro Diario tus gastos del Banco Popular junto a los de Banco BHD, Banreservas o Qik Banco Digital.',
      },
    ],
  },
  {
    slug: 'bhd',
    code: 'BHD',
    name: 'Banco BHD',
    shortName: 'BHD',
    legalEntityName: 'Banco BHD, S.A. - Banco Múltiple',
    accentColor: '#00a650',
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    bgGlowClass: 'from-emerald-950/20 via-slate-900/80 to-slate-950',
    metaTitle: 'Banco BHD • Organiza tu Quincena y Tarjetas con Cuadre',
    metaDescription: 'Organiza tus gastos del Banco BHD automáticamente. Cuadre lee tus avisos de consumo y calcula tu margen diario seguro sin pedir claves ni contraseñas.',
    heroBadge: 'Compatibilidad Oficial con Banco BHD',
    tagline: 'Tu margen seguro diario a partir de tus notificaciones BHD',
    overview: 'Si tienes tu nómina o tus tarjetas principales en Banco BHD, Cuadre se encarga de recopilar tus avisos de consumo vía Gmail para que nunca pierdas el control de tu quincena ni descuadres tu presupuesto familiar.',
    emailSender: 'alertas@bhd.com.do / notificaciones@bhd.com.do',
    supportedInstruments: [
      'Tarjetas de Crédito BHD (Pesos y Dólares)',
      'Tarjetas de Débito BHD de cuentas de ahorro y corriente',
      'Notificaciones de nómina quincenal',
      'Pagos automáticos de servicios y cuotas',
    ],
    benefits: [
      {
        title: 'Automatización de Consumos BHD',
        description: 'Registra tus consumos al instante sin necesidad de guardar vouchers impresos ni digitar recibos manualmente en hojas de cálculo.',
      },
      {
        title: 'Adaptado al Cobro 15 y 30',
        description: 'Configurado para el ritmo quincenal dominicano: divide lo que te queda entre los días exactos que faltan para tu próximo depósito.',
      },
      {
        title: 'Protege tus Cuotas Obligatorias',
        description: 'Aparta el pago mínimo o total de tu tarjeta BHD y compromisos fijos antes de mostrarte cuánto dinero tienes libre hoy.',
      },
      {
        title: 'Privacidad Garantizada',
        description: 'No leemos correos personales ni familiares. Solo procesamos los mensajes cuyo remitente y estructura corresponden a avisos bancarios.',
      },
    ],
    faqs: [
      {
        question: '¿Cuadre me solicitará mi clave o token del Banco BHD?',
        answer: 'Nunca. Cuadre opera exclusivamente mediante notificaciones de correo electrónico en modo solo lectura. Jamás te solicitaremos credenciales bancarias.',
      },
      {
        question: '¿Qué pasa si compro en dólares con mi tarjeta BHD?',
        answer: 'Cuadre registra la moneda de la transacción para mantener claridad en tus balances quincenales tanto en pesos dominicanos como en dólares.',
      },
      {
        question: '¿Cómo se maneja mi fecha de corte y pago de BHD?',
        answer: 'Puedes registrar la fecha de pago de tu tarjeta BHD como un compromiso fijo en Cuadre, y el motor lo reservará automáticamente en la quincena correspondiente.',
      },
      {
        question: '¿Qué costo tiene usar Cuadre con mis cuentas de BHD?',
        answer: 'Durante la beta privada de Cuadre tienes 30 días de acceso completo gratuito sin requerir tarjeta de crédito para registrarte.',
      },
    ],
  },
  {
    slug: 'banreservas',
    code: 'BANRESERVAS',
    name: 'Banreservas',
    shortName: 'Banreservas',
    legalEntityName: 'Banco de Reservas de la República Dominicana - Banco Múltiple',
    accentColor: '#0033a0',
    accentClass: 'text-blue-400',
    borderClass: 'border-blue-500/30 hover:border-blue-500/60',
    bgGlowClass: 'from-blue-950/20 via-slate-900/80 to-slate-950',
    metaTitle: 'Banreservas • Margen Seguro Diario y Finanzas con Cuadre',
    metaDescription: 'Gestiona tus gastos de Banreservas de manera automática. Convierte tus notificaciones de nómina y compras en un margen de gasto diario seguro sin contraseñas.',
    heroBadge: 'Compatibilidad Oficial con Banreservas',
    tagline: 'Control financiero para cuentas de nómina y tarjetas Banreservas',
    overview: 'Optimizado para empleados públicos y privados con nómina en Banreservas. Cuadre transforma las notificaciones por correo de tus compras y débitos en una métrica clara: cuánto puedes gastar hoy sin arriesgar los compromisos de tu quincena.',
    emailSender: 'notificaciones@banreservas.com.do',
    supportedInstruments: [
      'Tarjetas de Débito Banreservas (Nómina y Ahorros)',
      'Tarjetas de Crédito Banreservas',
      'Notificaciones de débitos y compras en comercios',
      'Avisos de transferencias ACH y Pagos al Instante BCRD',
    ],
    benefits: [
      {
        title: 'Ideal para Quincenas de Nómina',
        description: 'Sincroniza tus ingresos del 15 y del 25/30 con el calendario de gastos reales de tus cuentas Banreservas.',
      },
      {
        title: 'Monitoreo de Compras sin Vouchers',
        description: 'Olvídate de guardar recibos de papel: las alertas bancarias de Banreservas alimentan tu tablero diario automáticamente.',
      },
      {
        title: 'Reserva para Préstamos y Servicios',
        description: 'Aparta el dinero de cuotas de préstamos, colegios, renta o cooperativa antes de que decidas tus compras del fin de semana.',
      },
      {
        title: 'Cumplimiento Legal Dominicano',
        description: 'Operamos bajo la Ley 172-13 sobre protección de datos de carácter personal en la República Dominicana.',
      },
    ],
    faqs: [
      {
        question: '¿Cuadre necesita acceso a TuBanco Banreservas?',
        answer: 'No. Cuadre jamás pide tu usuario, PIN ni código de seguridad de TuBanco Banreservas. La sincronización se realiza leyendo únicamente los correos de notificación vía Gmail.',
      },
      {
        question: '¿Funciona con las cuentas de nómina del Estado y empresas privadas?',
        answer: 'Sí. Cualquier cuenta o tarjeta de Banreservas que emita notificaciones de consumo por correo electrónico es totalmente compatible con Cuadre.',
      },
      {
        question: '¿Qué información específica extrae Cuadre de los avisos de Banreservas?',
        answer: 'Únicamente la fecha de la transacción, el monto en DOP/USD y el nombre del comercio. No recopilamos números completos de cuentas ni datos sensibles.',
      },
      {
        question: '¿Cómo inicio la prueba con mi cuenta de Banreservas?',
        answer: 'Regístrate en la lista de espera de la beta privada. Al recibir tu invitación, podrás conectar tu Gmail en 3 clics y comenzar a usar Cuadre sin costo.',
      },
    ],
  },
  {
    slug: 'qik',
    code: 'QIK',
    name: 'Qik Banco Digital',
    shortName: 'Qik',
    legalEntityName: 'Qik Banco Digital Dominicano, S.A. - Banco Múltiple',
    accentColor: '#8b5cf6',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500/30 hover:border-purple-500/60',
    bgGlowClass: 'from-purple-950/20 via-slate-900/80 to-slate-950',
    metaTitle: 'Qik Banco Digital • Automatización de Gastos con Cuadre',
    metaDescription: 'Sincroniza tus consumos de Qik Banco Digital con Cuadre. Visualiza tu margen de gasto diario sin esfuerzo a partir de tus notificaciones oficiales.',
    heroBadge: 'Compatibilidad Oficial con Qik Banco Digital',
    tagline: 'El neobanco digital dominicano integrado con tu margen quincenal',
    overview: 'Qik nació digital y Cuadre complementa esa agilidad. Al recibir los correos automáticos de tus consumos con tu tarjeta Qik, Cuadre recalcula al instante tu Margen Seguro Diario para que aproveches tu dinero con total tranquilidad.',
    emailSender: 'notificaciones@qik.do',
    supportedInstruments: [
      'Tarjeta de Crédito Qik física y virtual',
      'Cuentas de Ahorro Digitales Qik',
      'Alertas de transferencias bancarias y compras en línea',
      'Notificaciones instantáneas de consumos',
    ],
    benefits: [
      {
        title: '100% Digital y Sin Esfuerzo',
        description: 'Diseñado para quienes prefieren la inmediatez: tus compras con Qik se reflejan en tu margen sin que tengas que abrir una hoja de Excel.',
      },
      {
        title: 'Control del Saldo Disponible',
        description: 'Distingue entre el dinero que tienes en tu cuenta y lo que realmente puedes gastar hoy sin comprometer tu quincena.',
      },
      {
        title: 'Integración Multibanco Unificada',
        description: '¿Usas Qik para el día a día pero cobras por otro banco tradicional? Cuadre consolida ambos mundos en un solo indicador.',
      },
      {
        title: 'Máxima Seguridad de Google',
        description: 'Autenticación con Google OAuth 2.0 y cifrado en tránsito y en reposo (AES-256) para todos los datos procesados.',
      },
    ],
    faqs: [
      {
        question: '¿Cómo lee Cuadre mis consumos de Qik Banco Digital?',
        answer: 'A través de los comprobantes oficiales de transacción que Qik envía automáticamente a tu correo electrónico de Gmail tras cada compra.',
      },
      {
        question: '¿Cuadre me solicitará entrar a mi app de Qik?',
        answer: 'No. Cuadre no tiene conexión con la aplicación móvil de Qik ni solicita tus credenciales de acceso. Todo se procesa a partir de los avisos por correo.',
      },
      {
        question: '¿Puedo conectar mi cuenta de Qik junto con mi cuenta de BHD o Popular?',
        answer: 'Sí. Cuadre fue creado específicamente para usuarios multibanco en República Dominicana, agrupando tus consumos en un solo Margen Diario.',
      },
      {
        question: '¿Cómo solicito acceso para usar Cuadre con Qik?',
        answer: 'Introduce tu correo en el formulario de la beta privada para recibir tu enlace de activación de 30 días de acceso completo.',
      },
    ],
  },
];

export function getBankBySlug(slug: string): SupportedBankProfile | undefined {
  return supportedBanks.find((bank) => bank.slug === slug);
}

export function getAllBankSlugs(): string[] {
  return supportedBanks.map((bank) => bank.slug);
}
