export interface LegalDoc {
  slug: string;
  type: string;
  title: string;
  version: string;
  effectiveAt: string;
  content: string;
}

export const LEGAL_DOCUMENTS: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms',
    type: 'TERMS',
    title: 'Términos y condiciones de uso',
    version: '2026-08-29.1',
    effectiveAt: '2026-08-29',
    content: `Vigentes desde el 29 de agosto de 2026. Cuadre es operado en Santo Domingo, República Dominicana. Contacto: privacidad@cuadre.do.

## Servicio
Cuadre es una aplicación beta de organización y analítica financiera personal. Importa notificaciones autorizadas por el usuario, normaliza movimientos y presenta métricas informativas. No es un banco, entidad financiera, contador, asesor fiscal ni asesor de inversión. Los registros oficiales de la entidad bancaria prevalecen y el usuario debe verificar cualquier diferencia.

## Elegibilidad y cuenta
El servicio está dirigido a personas de 18 años o más en República Dominicana. El usuario debe proporcionar información correcta, proteger su sesión y conectar únicamente cuentas de correo propias o que esté autorizado a gestionar.

## Uso permitido
No se permite acceder a datos de terceros sin autorización, interferir con la seguridad, automatizar abuso, intentar eludir límites ni utilizar Cuadre para fraude o actividades contrarias a la ley.

## Beta, disponibilidad y cambios
La beta puede contener errores, interrupciones o parsers incompletos. Podemos corregir, limitar o suspender funciones por seguridad, mantenimiento o incumplimiento. Los cambios materiales a estos términos serán informados y requerirán nueva aceptación; no se aplicarán de forma discriminatoria.

## Terceros
El servicio depende de proveedores como Google, Supabase y las entidades emisoras de notificaciones. Cuadre no está afiliado ni respaldado por BHD, Qik, Banreservas u otro banco salvo acuerdo expreso. Cada tercero mantiene sus propios términos.

## Responsabilidad
Cuadre aplicará cuidado razonable en la prestación del servicio. En la medida permitida por la legislación aplicable, no responde por decisiones tomadas exclusivamente a partir de métricas informativas, interrupciones de terceros o datos bancarios incorrectos. Nada en estos términos excluye derechos irrenunciables del consumidor ni responsabilidad que legalmente no pueda limitarse.

## Propiedad intelectual
El usuario recibe una licencia personal, revocable y no transferible para utilizar la aplicación. La marca, interfaz y software permanecen bajo titularidad de sus respectivos propietarios. Los datos financieros del usuario no se convierten en propiedad de Cuadre.

## Terminación y eliminación
El usuario puede desconectar Gmail o eliminar su cuenta. Podemos suspender acceso ante riesgo de seguridad o incumplimiento, procurando notificar cuando sea razonable. La eliminación se ejecuta conforme a la política publicada.

## Reclamaciones y ley aplicable
Las consultas y reclamaciones pueden enviarse a privacidad@cuadre.do. Se intentará una solución directa y el usuario conserva sus derechos ante Pro Consumidor y los tribunales competentes de República Dominicana. No se impone arbitraje exclusivo.`,
  },

  privacy: {
    slug: 'privacy',
    type: 'PRIVACY',
    title: 'Política de privacidad',
    version: '2026-08-29.1',
    effectiveAt: '2026-08-29',
    content: `El responsable del tratamiento es Cuadre. Contacto: privacidad@cuadre.do. Domicilio: Santo Domingo, República Dominicana.

## Datos tratados
Tratamos datos de cuenta y perfil, identificadores de sesión, bancos detectados, movimientos financieros normalizados, reglas de categorización, estado de conexiones, registros técnicos y evidencia de consentimientos. Con autorización separada de Gmail, consultamos mensajes de remitentes bancarios soportados y los datos mínimos necesarios para identificar movimientos.

## Finalidades
Usamos los datos para crear la cuenta, importar y clasificar movimientos, mostrar analítica, prevenir duplicados y abuso, mantener seguridad, atender solicitudes y mejorar la precisión de los parsers con información anonimizada o autorizada.

## Minimización y retención
El cuerpo de un correo procesado correctamente no se conserva. Un mensaje que no pueda procesarse puede conservarse cifrado por hasta 7 días para diagnóstico y recuperación controlada y luego se purga. Los tokens OAuth se almacenan cifrados y se eliminan al revocar la conexión o borrar la cuenta. Los datos normalizados permanecen mientras la cuenta esté activa. Las copias de respaldo cifradas pueden conservar datos eliminados por hasta 30 días antes de expirar y no se utilizan para reactivar una cuenta eliminada.

## Proveedores y transferencias
Podemos utilizar Google, Supabase, infraestructura de hosting y monitoreo como encargados tecnológicos. Esto puede implicar procesamiento fuera de República Dominicana. Se limita el acceso por finalidad, configuración contractual y controles de seguridad.

## Venta, publicidad y uso de datos de Google Workspace
No vendemos datos personales o financieros ni usamos datos de Gmail para publicidad. Tampoco transferimos, vendemos ni utilizamos datos de usuarios de Google Workspace (datos brutos, agregados o derivados) para crear, entrenar o mejorar modelos de inteligencia artificial (IA) o aprendizaje automático (ML) fundamentales o generalizados. Toda la clasificación se ejecuta mediante reglas deterministas en servidores propios sin conexión con modelos de lenguaje de terceros. El acceso humano a contenido de correo se restringe a seguridad, cumplimiento o soporte expresamente solicitado por el titular, cuando sea indispensable y esté permitido por la ley y las políticas de Google.

## Seguridad
Aplicamos cifrado de secretos, HTTPS en producción, separación por workspace, control de acceso, registros minimizados, rotación de credenciales y pruebas de aislamiento. Ningún sistema es infalible; investigaremos incidentes y notificaremos cuando corresponda.

## Derechos
El titular puede solicitar acceso, corrección, actualización, oposición o eliminación escribiendo a privacidad@cuadre.do después de verificar su identidad. Cuadre atenderá acceso dentro del plazo legal aplicable y las rectificaciones o supresiones procedentes dentro de un máximo operativo de 10 días hábiles, salvo obligación legal de conservación.

## Gmail y revocación
Conectar Gmail es opcional y separado del inicio de sesión. El usuario puede revocar la conexión desde Cuadre o desde su cuenta de Google. Revocar detiene nuevas sincronizaciones sin borrar automáticamente transacciones ya importadas; la cuenta completa puede eliminarse por separado.

## Menores y cambios
No está dirigido a menores de 18 años. Los cambios materiales se comunicarán y, cuando corresponda, requerirán nueva aceptación.`,
  },

  'google-api-disclosure': {
    slug: 'google-api-disclosure',
    type: 'GOOGLE_API_DISCLOSURE',
    title: 'Divulgación de acceso a Gmail / Google API Disclosure',
    version: '2026-09-15.1',
    effectiveAt: '2026-09-15',
    content: `Conectar Gmail es opcional. Cuadre solicita acceso de solo lectura para buscar correos de remitentes bancarios compatibles, extraer movimientos y evitar duplicados. No enviamos, editamos ni eliminamos correos.

El contenido de un mensaje procesado correctamente no se conserva. Los fallidos pueden mantenerse cifrados hasta 7 días para diagnóstico y recuperación controlada. Los datos normalizados y metadatos técnicos se usan para prestar y proteger el servicio, no para publicidad, venta de datos ni perfiles comerciales.

El uso y la transferencia a cualquier otra aplicación de información recibida a través de las APIs de Google por parte de Cuadre se ajustará a la Google API Services User Data Policy, incluidos los requisitos de Uso Limitado (Limited Use requirements). No vendemos esta información, no la usamos para publicidad y no permitimos acceso humano salvo las excepciones expresamente permitidas por esa política. Específicamente, los datos de usuarios de Google Workspace recibidos mediante las APIs de Gmail nunca se utilizan, transfieren ni venden para crear, entrenar o mejorar modelos de inteligencia artificial (IA) o aprendizaje automático (ML) fundamentales o generalizados. Puedes revocar el acceso en cualquier momento desde Cuadre o desde la configuración de seguridad de Google.

## Limited Use Compliance Statement (English)

Cuadre's use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements:

- **No AI/ML Model Training:** Raw, aggregated, or derived user data received from Google Workspace APIs (Gmail) is never used, transferred, or sold to create, train, or improve foundational or generalized machine learning (ML) or artificial intelligence (AI) models.
- **Strict Data Isolation:** Cuadre utilizes deterministic, rule-based regular expressions and DOM parsing on its private backend servers. No Google Workspace user data is ever transmitted to third-party AI/LLM providers (such as OpenAI, Anthropic, or similar services).
- **Narrowest Necessary Scope:** Cuadre requests only \`https://www.googleapis.com/auth/gmail.readonly\`, strictly limited to extracting incoming transactional banking notifications authorized by the user.
- **No Human Reading:** Human access to email data is strictly forbidden, except in narrow instances required for security investigations, compliance with applicable law, or when explicitly consented to by the user for technical troubleshooting.`,
  },

  'data-deletion': {
    slug: 'data-deletion',
    type: 'DATA_DELETION',
    title: 'Eliminación de datos y cuenta',
    version: '2026-08-29.1',
    effectiveAt: '2026-08-29',
    content: `Puedes desconectar Gmail sin borrar tus transacciones, o eliminar completamente la cuenta desde la configuración autenticada.

Al eliminar la cuenta revocamos y borramos tokens, conexiones, eventos de ingesta, movimientos, reglas, perfil y membresías personales. La operación no puede deshacerse. Se conserva únicamente un registro irreversible y pseudonimizado de que la eliminación se completó. Las copias de respaldo cifradas pueden tardar hasta 30 días en expirar y no se utilizan para restaurar la cuenta.

También puedes solicitar eliminación escribiendo a privacidad@cuadre.do. Será necesario verificar tu identidad. Las solicitudes procedentes se completarán dentro del plazo legal aplicable y del plazo comunicado al confirmar la solicitud.`,
  },
};
