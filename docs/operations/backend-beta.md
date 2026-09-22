# Operación del backend durante la beta

## Herramientas

- **Better Stack Logs:** recibe el stream JSON de Render. Crear vistas para `request_failed`,
  `database_slow_query`, `*_runner_cycle_failed`, `maintenance_heartbeat_failed` y errores 5xx.
- **Better Stack Errors:** configurar `ERROR_TRACKING_DSN`. La integración no envía cuerpos,
  headers, cookies, URLs, PII ni trazas de rendimiento.
- **Supabase:** usar Logs y Query Performance para investigar las huellas reportadas como lentas.
- **CLI local:** cargar variables de producción de forma segura y ejecutar:

```bash
npm run ops:status
npm run ops:queues
npm run ops:user -- --email usuario@ejemplo.com
npm run ops:metrics -- --hours 24
```

La CLI es de lectura. Para reprocesar Gmail se mantienen los comandos existentes, que operan en
dry-run salvo que reciban explícitamente `--apply`.

## Render Free

Configurar un scheduler HTTP externo para llamar con Bearer token:

```text
POST https://<app>/api/v1/internal/maintenance/tick
Authorization: Bearer <MAINTENANCE_SECRET>
```

Ejecutar cada diez minutos de 06:00 a 23:50 en `America/Santo_Domingo`. Fuera de esa ventana el
servicio puede dormir. Configurar `MAINTENANCE_HEARTBEAT_URL` con el heartbeat de Better Stack; la
API lo notificará únicamente después de completar el mantenimiento.

No configurar un monitor HTTP que consulte `/health` durante toda la noche: impediría el reposo.
`/health` solo comprueba que el proceso responde; `/api/v1/health/ready` también comprueba DB y
leases vencidos; `/api/v1/internal/ops/status` ofrece el diagnóstico protegido.

## Política de datos

Nunca copiar a logs cuerpos HTTP, correos, tokens, slugs de Coro, comercios, montos, números de
cuenta ni parámetros SQL. Para soporte solicitar hora aproximada, acción y `requestId`. La ruta
operativa devuelve referencias y conteos, no movimientos financieros.

En producción mantener `DB_QUERY_LOG_MODE=slow`. `all` solo se permite localmente. El umbral
inicial es 500 ms; investigar primero frecuencia, plan e índices antes de modificar consultas.

## Alertas mínimas

- Heartbeat ausente por 20 minutos dentro de la ventana activa.
- Readiness degradada durante cinco minutos.
- Nuevo error 5xx o excepción no controlada.
- Job pendiente por más de 15 minutos o lease vencido.
- Runner con fallos consecutivos o job que agotó sus intentos.
- Uso de ancho de banda de Render al 70%, 85% y 95%.

No alertar por validaciones 400, recursos 404 o conflictos de negocio esperados.
