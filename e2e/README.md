# E2E — Validación de RAT, Extensión ARCO y Feriados

Pruebas end-to-end con Playwright para los 3 flujos entregados. Ejecutan la UI
real contra el frontend (`npm run dev`) y el backend, iniciando sesión por la
pantalla de login y capturando pantallazos en `e2e/.artifacts/report/`.

## Requisitos previos

1. **Backend corriendo** y accesible en la URL de `NEXT_PUBLIC_API_BASE_URL`
   (por defecto `http://localhost:8000/api/v1`), con su base de datos.
2. **Frontend corriendo**: `npm run dev` (por defecto en `http://localhost:3000`).
3. **Playwright instalado** (no está en el repo por falta de red en el entorno
   donde se generó):

   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

## Datos que deben existir (semilla)

- Un usuario **admin de empresa** con permisos de `treatments` (view/create/
  edit/activate/archive) y `arcoRequests` (view/respond).
- Al menos una **finalidad** (`TreatmentPurpose`) global o de la empresa; sin
  ella el paso "completar y activar" del RAT se salta automáticamente.
- Un usuario **SUPERADMIN** (para feriados).
- Una solicitud **ARCO en estado PENDING/IN_PROGRESS** y otra **cerrada**
  (COMPLETED/REJECTED) para validar la visibilidad del botón "Extender plazo".

## Variables de entorno

| Variable                 | Descripción                                              |
| ------------------------ | -------------------------------------------------------- |
| `E2E_BASE_URL`           | URL del frontend (default `http://localhost:3000`)       |
| `E2E_ADMIN_USER`         | Usuario admin de empresa                                 |
| `E2E_ADMIN_PASS`         | Clave del admin                                          |
| `E2E_SUPERADMIN_USER`    | Usuario SUPERADMIN                                       |
| `E2E_SUPERADMIN_PASS`    | Clave del SUPERADMIN                                     |
| `E2E_ARCO_PENDING_ID`    | ID de solicitud ARCO pendiente (opcional; si falta, skip)|
| `E2E_ARCO_CLOSED_ID`     | ID de solicitud ARCO cerrada (opcional; si falta, skip)  |

## Ejecutar

```bash
# Todos los flujos
E2E_ADMIN_USER=... E2E_ADMIN_PASS=... \
E2E_SUPERADMIN_USER=... E2E_SUPERADMIN_PASS=... \
E2E_ARCO_PENDING_ID=... E2E_ARCO_CLOSED_ID=... \
npm run e2e

# Modo interactivo (UI)
npm run e2e:ui

# Ver el reporte HTML tras una corrida
npm run e2e:report
```

Las capturas quedan en `e2e/.artifacts/report/` y el reporte HTML en
`e2e/.report/`.

## Notas

- Los specs son **auto-contenidos** donde es posible (RAT crea su propio
  tratamiento). ARCO depende de IDs sembrados porque no crea solicitudes.
- El spec de RAT valida además la **guarda anti-sobrescritura** del frontend:
  editar en dos pestañas y guardar secuencialmente debe mostrar conflicto en la
  segunda, sin pisar el cambio de la primera.
