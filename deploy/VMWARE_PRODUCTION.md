# Produccion en VMware Workstation Pro 17

Esta guia deja el proyecto listo para correr en una VM Linux sobre VMware Workstation Pro 17 con Docker Compose.

Antes de empezar con esta guia, completa la instalacion base del servidor siguiendo `deploy/VMWARE_UBUNTU_CHECKLIST.md`.

Esta guia ahora tiene dos rutas distintas:

- Ruta A: produccion local en la VM, accesible por IP dentro de la LAN. Esta es la adecuada para tu etapa actual.
- Ruta B: despliegue publico con dominio y TLS. Esta se usa despues.

## Ruta A: produccion local en la VM

Usa esta ruta cuando todavia no vas a publicar el sistema en internet y quieres validar operacion real dentro de la red local.

### Objetivo

- App disponible en `http://IP_DE_LA_VM:3000`
- API Supabase disponible en `http://IP_DE_LA_VM:8000`
- Studio disponible en `http://IP_DE_LA_VM:3001`
- Sin DNS publico
- Sin TLS publico

### Archivos de esta ruta

- `docker-compose.vm-local.yml`
- `.env.vm-local.example`

### Preparacion

1. Clona el repositorio dentro de la VM.
2. Copia el archivo de entorno local:

```bash
cp .env.vm-local.example .env.vm-local
```

3. Genera secretos locales para Supabase self-hosted en la misma VM:

```bash
python3 deploy/generate_local_supabase_keys.py
```

Ese script no usa Supabase Cloud. Genera localmente:

- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_PASSWORD`
- `DASHBOARD_PASSWORD`

4. Edita `.env.vm-local` y reemplaza `VM_IP` por la IP actual de la VM.

Ejemplo:

```env
VM_IP=192.168.100.112
SUPABASE_DB_ADMIN_USER=supabase_admin
NEXT_PUBLIC_SUPABASE_URL=http://${VM_IP}:8000
SITE_URL=http://${VM_IP}:3000
API_EXTERNAL_URL=http://${VM_IP}:8000
SUPABASE_PUBLIC_URL=http://${VM_IP}:8000
```

5. Completa secretos reales con la salida del script:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DASHBOARD_PASSWORD`

### Despliegue local

Si mantienes UFW activo, abre los puertos necesarios para esta etapa local:

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 8000/tcp
sudo ufw status verbose
```

Si no quieres exponer Studio, puedes omitir `3001/tcp`.

Valida el compose:

```bash
docker compose --env-file .env.vm-local -f docker-compose.vm-local.yml config
```

Levanta el stack:

```bash
docker compose --env-file .env.vm-local -f docker-compose.vm-local.yml up -d --build
```

Verifica estado:

```bash
docker compose --env-file .env.vm-local -f docker-compose.vm-local.yml ps
docker compose --env-file .env.vm-local -f docker-compose.vm-local.yml logs -f app
docker compose --env-file .env.vm-local -f docker-compose.vm-local.yml logs -f kong
```

### Validaciones iniciales de la ruta local

1. Abre `http://IP_DE_LA_VM:3000/api/health`
2. Abre `http://IP_DE_LA_VM:3000`
3. Abre `http://IP_DE_LA_VM:8000/auth/v1/health`
4. Si necesitas administracion, abre `http://IP_DE_LA_VM:3001`

En esta ruta, Supabase corre self-hosted dentro de la misma VM mediante Docker Compose. No se usa Supabase Cloud.

### Cuándo pasar a la ruta pública

Pasa a la ruta publica solo cuando estas condiciones sean verdaderas:

- La app ya funciona estable desde la LAN.
- El modelo de datos ya fue validado.
- Ya definiste dominio publico.
- Ya existe reenvio de puertos `80/443` desde internet hacia la VM.

## Ruta B: despliegue publico con dominio y TLS

## Arquitectura recomendada

- VM invitada: Ubuntu Server 24.04 LTS.
- CPU: 4 vCPU minimo.
- RAM: 8 GB minimo; 12 a 16 GB recomendado si Studio y procesos auxiliares quedaran encendidos.
- Disco: 80 GB SSD minimo.
- Red VMware: `Bridged`.
- DNS publico:
  - `pos.midominio.com` para la app.
  - `supabase.midominio.com` para Kong y servicios HTTP de Supabase.

## Por que `Bridged` y no NAT

Para produccion, Caddy necesita recibir trafico real por `80/443` para emitir y renovar certificados TLS automaticamente. Con NAT en VMware, eso depende de reenvios adicionales desde el host y se vuelve mas fragil. `Bridged` simplifica el despliegue y la operacion.

## Preparacion de la VM

1. Instala Ubuntu Server 24.04 LTS.
2. Asigna IP fija por DHCP reservation o configuracion estatica.
3. Instala Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

4. Reinicia sesion para aplicar el grupo `docker`.

## Preparacion de la aplicacion

1. Clona el repositorio dentro de la VM.
2. Crea el archivo de entorno:

```bash
cp .env.production.example .env.production
```

3. Completa como minimo:

- `APP_DOMAIN`
- `SUPABASE_DOMAIN`
- `ACME_EMAIL`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DASHBOARD_PASSWORD`

## Despliegue

Levanta el stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Verifica estado:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy
```

## Validaciones iniciales

1. Abre `https://APP_DOMAIN/api/health`.
2. Confirma certificado TLS valido.
3. Confirma acceso a `https://SUPABASE_DOMAIN/auth/v1/health`.
4. Comprueba persistencia reiniciando la VM y verificando que los volumenes conservan datos.

## Lo que aun necesitas antes de operacion real

- Configurar RLS sobre tablas sensibles.
- Crear usuarios, roles y politicas de acceso.
- Implementar autenticacion real para POS y backoffice.
- Definir estrategia de backups para Postgres y storage.
- Agregar monitoreo, alertas y rotacion de logs.
- Restringir o apagar Studio si no se requiere en linea.

## Respaldo minimo recomendado

- Backup diario de Postgres con `pg_dump` hacia almacenamiento externo.
- Snapshot programado de la VM antes de cambios mayores.
- Copia de `.env.production` fuera de la VM en un gestor seguro de secretos.

## Comandos utiles

Actualizar contenedores:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Apagar stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

No uses `down -v` en produccion salvo que quieras borrar base de datos y archivos persistentes.