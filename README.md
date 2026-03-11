# POS System Achsas

Sistema POS y backoffice para restaurantes construido con Next.js, Tailwind CSS y Supabase self-hosted.

Incluye tres perfiles de despliegue:

- `docker-compose.yml` para desarrollo local.
- `docker-compose.vm-local.yml` para produccion local dentro de una VM o LAN.
- `docker-compose.prod.yml` para produccion en una VM Linux, por ejemplo en VMware Workstation Pro 17.

## Lo que incluye esta base

- Dashboard ejecutivo con KPIs, alertas e inventario critico.
- Pantalla POS optimizada para tactil con categorias, productos y mesas.
- Esquema relacional PostgreSQL para ventas, recetas, pagos, inventario y caja.
- `docker-compose.yml` con la app de Next.js y una base operativa de Supabase self-hosted para desarrollo local.

## Estructura

- `src/app`: rutas App Router.
- `src/components`: UI reutilizable.
- `src/lib`: utilidades, datos de demostracion y clientes de Supabase.
- `deploy`: configuracion auxiliar para proxy reverso y despliegue.
- `supabase/migrations`: esquema inicial de base de datos.
- `supabase/seed`: datos semilla para pruebas visuales.

## Puesta en marcha

1. Copia `.env.example` a `.env` y reemplaza las claves de Supabase.
2. Ejecuta `npm install`.
3. Levanta la aplicacion con `npm run dev` o usa Docker Compose.
4. Inicializa la base con el SQL de `supabase/migrations/20260310_0001_init_pos.sql`.

## Docker

`docker compose up --build`

Servicios principales:

- App Next.js: `http://localhost:3000`
- Kong / Supabase API: `http://localhost:8000`
- Studio: `http://localhost:8000`
- Postgres directo: `localhost:5432`

## Produccion en VMware Workstation Pro 17

Archivos relevantes:

- `.env.vm-local.example`: plantilla para produccion local en la VM.
- `docker-compose.vm-local.yml`: stack de validacion productiva local, accesible por IP en LAN.
- `.env.production.example`: plantilla de variables para produccion.
- `docker-compose.prod.yml`: stack productivo con Caddy, app y Supabase.
- `deploy/Caddyfile`: proxy reverso con TLS automatico.

Ruta recomendada por etapas:

1. Primero levantar `docker-compose.vm-local.yml` para validar operacion real dentro de la VM sin depender de DNS publico.
2. Despues pasar a `docker-compose.prod.yml` cuando ya exista dominio, reenvio de puertos y TLS publico.

En ambas rutas, Supabase corre self-hosted en tus propios contenedores. No hay dependencia de Supabase Cloud.

Flujo recomendado:

1. Crear una VM Linux, idealmente Ubuntu Server 24.04 LTS.
2. Configurar la red de la VM en modo `Bridged` para que tenga IP visible en la red y pueda emitir certificados TLS.
3. Instalar Docker Engine y Docker Compose Plugin dentro de la VM.
4. Copiar `.env.production.example` a `.env.production` y reemplazar todos los secretos y dominios.
5. Apuntar DNS publico a la IP de la VM para `APP_DOMAIN` y `SUPABASE_DOMAIN`.
6. Levantar el stack con `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`.
7. Verificar salud en `/api/health` y acceso HTTPS al dominio principal.

Notas operativas:

- El stack productivo ya no expone Postgres ni servicios internos de Supabase al host.
- El acceso publico se concentra en Caddy por `80/443`.
- Si la VM usa NAT en lugar de `Bridged`, el TLS automatico de Let's Encrypt normalmente no funcionara sin reglas externas de reenvio.
- Studio queda interno por seguridad. Si necesitas acceso administrativo, exponlo solo mediante VPN, tunel SSH o una regla temporal.

Guias detalladas:

- `deploy/VMWARE_UBUNTU_CHECKLIST.md`: instalacion paso a paso de la VM Ubuntu en VMware.
- `deploy/VMWARE_PRODUCTION.md`: despliegue de la aplicacion dentro de la VM.

## Notas

- El compose base esta preparado para desarrollo local.
- El compose de produccion usa una imagen de Next.js optimizada con `standalone output` y usuario no root.
- Antes de salir a produccion falta completar endurecimiento funcional: autenticacion real, RLS, backups y monitoreo.