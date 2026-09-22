# Reglas del Proyecto y Guía para Agentes de IA

Este documento contiene las reglas obligatorias de diseño, desarrollo, UX y arquitectura que **todos los agentes** deben leer y cumplir estrictamente en cada cambio dentro del repositorio.

---

## 1. Patrón Arquitectónico y Modularidad (FSD)

El frontend sigue el patrón **Feature-Sliced Design (FSD)** y el backend sigue **Clean Architecture / Ports & Adapters**.

### 1.1 Reglas de Capas Frontend
- Las capas permitidas son: `app/` → `pages/` → `widgets/` → `features/` → `entities/` → `shared/`.
- **Dirección única de dependencias:** Una capa superior solo puede importar de capas inferiores. Está estrictamente prohibido importar en sentido inverso o entre slices de la misma capa sin pasar por su API pública (`index.ts`).
- **Límite de 250 líneas por archivo:** Ningún archivo de código de ejecución modificado (`.ts`, `.tsx`) puede superar **250 líneas** (verificado automáticamente por `scripts/check-architecture.js`). Si un archivo se acerca a 200 líneas, desglosar en subcomponentes, modelos o hooks inmediatamente.

### 1.2 Reglas de Capas Backend
- `http/`: Controladores y rutas (validación Zod de contratos y respuestas HTTP).
- `application/`: Servicios y casos de uso (dependen de puertos/interfaces, nunca de Prisma directo).
- `domain/`: Lógica de dominio pura sin dependencias de infraestructura, Express o base de datos.
- `infrastructure/`: Repositorios y stores Prisma, clientes externos (Resend, Supabase).

---

## 2. Lógica Aislada y Uso de Custom Hooks

Los componentes de React (`.tsx`) deben ser **declarativos y enfocados únicamente en la interfaz visual**.

### 2.1 Principios de Lógica Desacoplada
- **Prohibido colocar lógica compleja dentro del JSX:** Cálculos matemáticos, validaciones de reglas de negocio, transformaciones de arreglos, filtros pesados y algoritmos de división deben aislarse en archivos de modelo (`model/*.ts`) o helpers de dominio.
- **Uso obligatorio de Custom Hooks:** Si un componente maneja estados interdependientes, mutaciones con React Query, debounce de búsqueda, o flujos de formularios, esa lógica debe encapsularse en un custom hook (ejemplo: `useCoroDetail`, `useParticipantManagement`, `useManualExpenseForm`).

---

## 3. Uso de Common Components (`@/shared/ui`)

No reinventar componentes base. Utilizar siempre el sistema de diseño compartido.

- **Componentes Base Obligatorios:**
  - Botones: `Button` (variantes: `default`, `outline`, `ghost`, `destructive`, etc.).
  - Formularios: `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`.
  - Diálogos y Modales: `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`.
  - Contenedores y Navegación: `Card`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
  - Notificaciones: `toast` de `@/shared/ui`.
- **Modales de Confirmación:** Reutilizar siempre componentes como `CoroConfirmDialog` o diálogos de confirmación estándar con estados `pending` y `destructive` en lugar de `window.confirm`.

---

## 4. Estandarización de Colores y Tokens de Diseño

La aplicación tiene soporte completo para modo claro y oscuro basado en tokens CSS de Tailwind.

- **Regla Estricta:** Prohibido usar colores fijos como `text-black`, `bg-white`, o valores hexadecimales `#123456` en componentes.
- **Tokens Semánticos Obligatorios:**
  - Texto principal: `text-foreground`
  - Texto secundario / muted: `text-muted-foreground`
  - Fondos de tarjetas: `bg-card`
  - Fondos sutiles: `bg-muted` o `bg-muted/40`
  - Bordes: `border-border` o `border-border/60`
  - Acción principal: `bg-primary`, `text-primary`
  - Destructivo / Peligro: `text-destructive`, `bg-destructive/10`, `hover:bg-destructive/20`
- **Paletas Institucionales (Bancos Dominicanos):**
  - Centralizar colores de bancos (Banreservas, Popular, BHD, Qik) en archivos de modelo/estilo (`bank-style.ts`).

---

## 5. Estándares de Experiencia de Usuario (UX)

- **Atajos de Teclado (Key Enter & Escape):**
  - Todo input donde el usuario escriba para agregar o editar debe responder a <kbd>Enter</kbd> para guardar/enviar (`e.key === 'Enter'`).
  - Todo modo de edición o búsqueda debe permitir cancelar o limpiar con <kbd>Escape</kbd> (`e.key === 'Escape'`).
- **Uso de Formatters Centralizados:**
  - Monedas: Utilizar siempre `formatCurrency(amount, currency)` de `@/shared/lib`. Nunca formatear dinero con `RD$ ` concatenado a mano.
  - Fechas: Utilizar siempre `formatDate` o utilidades de `@/shared/lib` / `date-fns` adaptadas a la convención dominicana (`es-DO`).
  - Teléfonos: Formatear números dominicanos con formato legible (`(809) 000-0000`).
- **Feedback Inmediato:**
  - Mostrar feedback visual inmediato ante acciones del usuario (`toast.success`, `toast.error`, estados `disabled` y `pending` en botones durante llamadas asíncronas).
  - Validaciones amigables en español dominicano.

---

## 6. Verificación Obligatoria Antes de Concluir Cambios

Todo agente debe ejecutar y verificar que pasen satisfactoriamente los siguientes comandos antes de dar por completada una tarea:

1. **Arquitectura y Límites de Líneas:**
   ```bash
   npm run check:architecture
   ```
   *(Debe reportar 0 violaciones y ningún archivo modificado con más de 250 líneas).*

2. **Pruebas Automatizadas:**
   ```bash
   npm run test --prefix apps/api
   npm run test --prefix apps/web
   ```

3. **Linter & Tipos:**
   ```bash
   npm run lint --prefix apps/web
   npm run build:web
   ```

4. **Verificación de GitHub Actions (CI):**
   - Siempre que se realice un `push` a una rama remota (`develop`, `master`, o ramas de features/fixes) o se trabaje sobre un Pull Request, es **estrictamente obligatorio verificar que los workflows de GitHub Actions (CI / Quality) concluyan exitosamente en verde**.
   - Ninguna tarea se considera terminada ni ningún PR se da por listo sin confirmar el paso exitoso de los checks remotos en GitHub.
   - Si algún job del CI falla (compilación, pruebas unitarias/integración, cobertura, pruebas E2E de Playwright, migraciones de base de datos aislada, o linter), el agente debe inspeccionar el reporte del fallo inmediatamente, aplicar la solución y verificar nuevamente hasta que el CI pase por completo.

