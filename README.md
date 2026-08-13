# KQ Real Estate — Sitio web (www.kq-realestate.cloud)

Sitio público con **catálogo en vivo** desde `kqv_propiedades`, **cuentas de usuario**
(registro/login con roles), y **administración del sitio** — todo sobre el VPS actual,
sin tocar n8n ni el panel de leads.

- **Stack:** Node.js + Express + PostgreSQL (el mismo Postgres del stack).
- **Reverse proxy:** Caddy (ya existente) enruta `www.kq-realestate.cloud` → `kqv-web:3000`.
- **Roles:** `cliente` (público) y `admin_sitio` (Karen/equipo). El rol se valida **en el servidor**.

---

## Despliegue (terminal web de Hostinger, como `root`)

> Recuerda: al pegar en la consola web, empieza cada bloque con `echo GO;` para evitar
> que se coma el primer comando.

### 1) Clonar el repositorio dentro del stack
```
echo GO; cd /home/kqv/kqv-stack && git clone https://github.com/<TU_USUARIO>/<TU_REPO>.git kqv-web && ls kqv-web
```

### 2) Secreto de sesión (para las cookies de login)
```
echo GO; grep -q '^WEB_SESSION_SECRET=' .env || echo "WEB_SESSION_SECRET=$(openssl rand -hex 32)" >> .env; grep WEB_SESSION_SECRET .env
```

### 3) Agregar el servicio `kqv-web` al docker-compose
Abre el compose y pega el bloque de `kqv-web/deploy/compose.kqv-web.yml` **dentro de `services:`**
(misma indentación que `postgres`/`n8n`/`caddy`):
```
echo GO; nano /home/kqv/kqv-stack/docker-compose.yml
```
(El contenido a pegar está en `kqv-web/deploy/compose.kqv-web.yml`.)

### 4) Agregar el bloque de `www` al Caddyfile
Pega al final del Caddyfile el bloque de `kqv-web/deploy/Caddyfile.snippet`:
```
echo GO; cat kqv-web/deploy/Caddyfile.snippet >> /home/kqv/kqv-stack/Caddyfile; tail -8 /home/kqv/kqv-stack/Caddyfile
```

### 5) Crear las tablas del sitio (web_*) — no toca las kqv_*
```
echo GO; set -a; . /home/kqv/kqv-stack/.env; set +a; docker exec -i kqv-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < /home/kqv/kqv-stack/kqv-web/sql/migration.sql
```

### 6) Construir y levantar la web
```
echo GO; cd /home/kqv/kqv-stack && docker compose up -d --build kqv-web && docker compose ps kqv-web
```

### 7) Recargar Caddy (para que tome el subdominio www)
```
echo GO; docker exec kqv-caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || docker compose restart caddy
```

### 8) Crear el usuario administrador (Karen)
Elige un correo y una contraseña segura (mínimo 8 caracteres). **Tú** los escribes aquí:
```
echo GO; cd /home/kqv/kqv-stack && docker compose exec -e ADMIN_EMAIL='karen@kq-realestate.cloud' -e ADMIN_PASSWORD='TU_CLAVE_SEGURA' -e ADMIN_NOMBRE='Karen Quezada' kqv-web node scripts/seed-admin.js
```

### 9) Verificar
- Público: **https://www.kq-realestate.cloud**
- Login admin: entra con el correo/clave del paso 8 → botón **Administración**.

---

## Comprobación del catálogo (importante)
La app mapea las columnas de `kqv_propiedades` de forma tolerante. Verifica que carguen bien:
```
echo GO; set -a; . /home/kqv/kqv-stack/.env; set +a; docker exec -it kqv-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d kqv_propiedades"
```
Si en la web **no aparecen propiedades** (o faltan datos como precio/dormitorios), pásame
la salida de ese comando y ajusto el mapeo de columnas en `lib/catalog.js`.

## Actualizaciones futuras
```
echo GO; cd /home/kqv/kqv-stack/kqv-web && git pull && cd .. && docker compose up -d --build kqv-web
```

## Notas de seguridad
- Contraseñas con **bcrypt**; sesión en cookie **httpOnly** (JWT).
- Endpoints de escritura protegidos por sesión; `/admin/*` exige rol `admin_sitio` en el servidor.
- El sitio **solo lee** `kqv_propiedades` (no la modifica). Fotos, video, descripción web,
  destacadas y secciones viven en tablas `web_*` propias.
- Pendiente del proyecto: rotar las API keys expuestas en `Pagina Web/Contexto-Perplexity.md`.
