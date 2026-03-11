# Checklist exacto para instalar Ubuntu Server en VMware Workstation Pro 17

Este documento deja lista la VM base para desplegar este proyecto. El objetivo es terminar con una VM Ubuntu estable, accesible por red, con Docker listo y preparada para correr el stack productivo.

## 1. Antes de crear la VM

Confirma estos prerequisitos:

- Tienes el ISO de Ubuntu Server 24.04 LTS.
- Tienes un nombre de dominio o al menos subdominios planeados para la app y Supabase.
- Puedes crear registros DNS tipo `A` hacia la IP de la VM.
- El equipo host donde corre VMware puede mantener la VM encendida de forma continua.
- El firewall o router de la red permite trafico entrante a `80` y `443`.

Valores recomendados para esta VM:

- Nombre de la VM: `ziiipos-prod`
- Sistema operativo invitado: `Ubuntu 64-bit`
- CPU: `4 vCPU`
- RAM: `8 GB` minimo; `12 GB` recomendado
- Disco: `80 GB` en SSD, un solo disco virtual esta bien
- Red: `Bridged`

## 2. Crear la VM en VMware Workstation Pro 17

1. Abre VMware Workstation Pro 17.
2. Selecciona `Create a New Virtual Machine`.
3. Elige `Custom (advanced)` para controlar mejor el hardware.
4. Hardware compatibility: deja la sugerida por VMware 17.
5. Installer disc image file (iso): selecciona el ISO de Ubuntu Server 24.04.
6. Guest operating system: `Linux`.
7. Version: `Ubuntu 64-bit`.
8. Virtual machine name: `ziiipos-prod`.
9. Ubicacion: usa un disco rapido del host.
10. Processors: `1` socket y `4` cores por socket, o equivalente a `4 vCPU`.
11. Memory: `8192 MB` o mas.
12. Network type: `Use bridged networking`.
13. I/O controller: deja `LSI Logic` o el default sugerido.
14. Disk type: `NVMe` si VMware lo ofrece; si no, el default tambien funciona.
15. Create a new virtual disk.
16. Disk capacity: `80 GB` o mas.
17. Elige `Store virtual disk as a single file` si el host tiene espacio estable.
18. Finaliza la creacion.

## 3. Ajustes recomendados antes del primer arranque

En `Edit virtual machine settings`:

- Quita dispositivos que no necesitas, por ejemplo `Printer`, `Sound Card` y `USB Controller`, salvo que los uses.
- Activa `Accelerate 3D graphics` solo si tienes un motivo. Para servidor no aporta valor.
- Verifica que la NIC este en `Bridged`, no en NAT.
- Si tu host tiene varias interfaces de red, en el Virtual Network Editor fija el bridge a la NIC correcta.

## 4. Instalar Ubuntu Server 24.04

1. Arranca la VM.
2. Selecciona `Try or Install Ubuntu Server`.
3. Idioma: el que prefieras; para operaciones tecnicas suele ser mas practico ingles.
4. Keyboard layout: confirma el correcto para evitar errores al escribir secretos.
5. Installer update: puedes usar la version actual si la red ya funciona.

Red:

6. Confirma que la interfaz de red obtiene IP por DHCP.
7. Si tu red productiva requiere IP fija, deja nota de la IP que vas a reservar.
    
Proxy y mirror:

8. Proxy: dejalo vacio salvo que tu red lo requiera.
9. Ubuntu archive mirror: usa el predeterminado, salvo restricciones internas.

Storage:

10. Selecciona `Use an entire disk`.
11. Si no manejas cifrado operativo, no actives LVM cifrado en esta primera pasada. Complica recuperacion y automatizacion si no esta bien documentado.
12. Acepta el particionado propuesto.

Perfil del servidor:

13. Server name: `ziiipos`.
14. Username administrativo: uno distinto de `root`, por ejemplo `deploy`.
15. Password: usa una contrasena fuerte y guardala en un gestor de secretos.

SSH:

16. Marca `Install OpenSSH server`.
17. Si ya tienes clave publica, puedes importarla desde GitHub o pegarla manualmente.

Snaps del instalador:

18. No selecciones paquetes extra por ahora. Mantener la base minima es mejor.
19. Finaliza la instalacion y reinicia.

## 5. Primer acceso y validaciones basicas

Inicia sesion localmente o por SSH y ejecuta:

```bash
hostnamectl
ip a
ip route
ping -c 3 1.1.1.1
ping -c 3 google.com
timedatectl
df -h
free -h
```

Debes confirmar:

- El hostname es correcto.
- La VM tiene IP de la red real.
- Hay salida a internet.
- DNS resuelve.
- La hora del sistema es correcta.
- El disco y la RAM coinciden con lo que configuraste.

## 6. Endurecimiento minimo del sistema base

Actualiza el sistema:

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt autoremove -y
```

Instala utilidades base:

```bash
sudo apt install -y curl git unzip ca-certificates gnupg ufw fail2ban htop jq net-tools
```

Configura zona horaria si hace falta:

```bash
sudo timedatectl set-timezone America/Mexico_City
timedatectl
```

## 7. Configurar firewall de Ubuntu

Permite solo lo necesario:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

No abras `5432`, `8000` ni otros puertos internos al exterior.

## 8. Configurar acceso SSH correctamente

Si usaras claves SSH, valida permisos:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Luego endurece SSH:

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart ssh
sudo systemctl status ssh --no-pager
```

Si ya validaste acceso por clave, puedes cambiar `PasswordAuthentication` a `no`.

## 9. Instalar Docker Engine y Docker Compose Plugin

Ejecuta exactamente:

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
newgrp docker
docker --version
docker compose version
sudo systemctl enable docker
sudo systemctl status docker --no-pager
```

## 10. Crear estructura base para despliegues

Usa un directorio claro para aplicaciones:

```bash
sudo mkdir -p /srv/ziiipos
sudo chown -R $USER:$USER /srv/ziiipos
```

Si vas a clonar por SSH, prepara tu clave o usa un deploy key.

## 11. Verificaciones de red antes del despliegue

Antes de mover el codigo, confirma estos puntos con tu infraestructura:

- El dominio principal de la app apunta a la IP de la VM.
- El dominio de Supabase apunta a la misma IP de la VM.
- Los puertos `80` y `443` llegan hasta la VM.
- No hay otro servicio ocupando `80/443` dentro de la VM.

Comandos utiles:

```bash
ss -tulpn | grep -E ':80|:443' || true
curl -I http://example.com
```

## 12. Snapshot recomendado en VMware

Antes de desplegar la aplicacion, crea un snapshot llamado por ejemplo:

- `ubuntu-base-updated`

Hazlo solo cuando:

- Ubuntu ya este actualizado.
- SSH funcione.
- Firewall este activo.
- Docker funcione.
- La red bridged este confirmada.

Ese snapshot te da un punto limpio para volver atras sin perder tiempo.

## 13. Criterio de salida de esta checklist

No avances al despliegue de la app hasta que todo esto sea verdadero:

- Puedes entrar por SSH sin problemas.
- `docker --version` responde.
- `docker compose version` responde.
- `ufw status` muestra `80`, `443` y `OpenSSH` permitidos.
- `hostnamectl` y `timedatectl` estan correctos.
- La VM tiene IP estable.
- Ya creaste un snapshot base.

Cuando completes este checklist, sigue con `deploy/VMWARE_PRODUCTION.md` para desplegar el proyecto.