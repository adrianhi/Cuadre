# Runbooks de beta

## Un usuario no ve movimientos nuevos

1. Pedir hora aproximada y código de soporte; no pedir capturas con datos financieros.
2. Ejecutar `npm run ops:user -- --email <email>` y revisar conexión, último sync y código de error.
3. Ejecutar `npm run ops:queues`; comprobar pendientes, antigüedad y leases vencidos.
4. Buscar el `requestId` y la referencia de workspace en Better Stack.
5. Ejecutar `gmail:verify-recovery`; usar `gmail:replay` primero en dry-run y después con `--apply`
   solamente si el candidato y el workspace son correctos.

## Maintenance o runners detenidos

1. Consultar `/api/v1/internal/ops/status` mediante `npm run ops:status`.
2. Confirmar `processRole=all`, uptime y estado `running` de los cuatro runners.
3. Revisar el último heartbeat y los eventos de inicio/parada en Better Stack.
4. Si Render durmió fuera de horario, esperar el arranque en frío y repetir el tick.
5. Si un runner continúa fallando, conservar el job durable, desplegar la corrección y reprocesar;
   no editar directamente su estado en PostgreSQL.

## Base de datos lenta o no disponible

1. Revisar readiness y `database.latencyMs` en `ops:status`.
2. Buscar `database_slow_query` y agrupar por `fingerprint`.
3. Consultar Query Performance y Postgres Logs en Supabase.
4. Verificar región, pooler, conexiones activas y límites antes de añadir índices.
5. Probar el índice o cambio en desarrollo y ejecutar el plan de verificación completo.

## Despliegue o migración fallida

1. No aplicar SQL manual para “completar” una migración parcialmente entendida.
2. Revisar release, primer error de bootstrap y estado de Prisma Migrate.
3. Corregir con una migración compatible; no reescribir una migración ya desplegada.
4. Restaurar la versión anterior solo si el esquema sigue siendo compatible.
5. Ejecutar health, readiness, autenticación y una lectura de transacciones como smoke test.

## Pico de ancho de banda

1. Revisar frecuencia de maintenance y que no exista otro keepalive 24/7.
2. Agrupar consultas lentas y actividad por runner, sin habilitar SQL completo en producción.
3. Confirmar delays efectivos de 60 s/50 ms/10 s en logs de inicio.
4. Revisar reconciliaciones Gmail, reintentos y conexiones en error.
5. Si la demanda real requiere disponibilidad permanente, mover el web service a Starter en vez de
   aumentar keepalives o reducir artificialmente el backoff.
