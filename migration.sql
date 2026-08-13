-- =============================================================================
-- KQ Real Estate — Migración de base de datos para el sitio web
-- Crea tablas web_* SIN tocar las tablas operativas kqv_*. Idempotente.
-- Ejecutar una vez en el Postgres del VPS (DB n8n).
-- =============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.web_usuarios (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(80)  NOT NULL,
    apellido         VARCHAR(80),
    email            VARCHAR(160) NOT NULL UNIQUE,
    password_hash    VARCHAR(200) NOT NULL,
    whatsapp         VARCHAR(30),
    rol              VARCHAR(20)  NOT NULL DEFAULT 'cliente',
    email_verificado BOOLEAN      NOT NULL DEFAULT FALSE,
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_login       TIMESTAMP,
    CONSTRAINT chk_web_rol CHECK (rol IN ('cliente','admin_sitio'))
);
CREATE INDEX IF NOT EXISTS idx_web_usuarios_email ON public.web_usuarios (lower(email));

CREATE TABLE IF NOT EXISTS public.web_favoritos (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER NOT NULL REFERENCES public.web_usuarios(id) ON DELETE CASCADE,
    propiedad_codigo VARCHAR(30) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, propiedad_codigo)
);
CREATE INDEX IF NOT EXISTS idx_web_fav_usuario ON public.web_favoritos (usuario_id);

CREATE TABLE IF NOT EXISTS public.web_visitas (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER REFERENCES public.web_usuarios(id) ON DELETE SET NULL,
    propiedad_codigo VARCHAR(30) NOT NULL,
    fecha_solicitada TIMESTAMP,
    estado           VARCHAR(20) NOT NULL DEFAULT 'solicitada',
    notas            TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_web_visita_estado CHECK (estado IN ('solicitada','confirmada','realizada','cancelada'))
);
CREATE INDEX IF NOT EXISTS idx_web_visitas_prop ON public.web_visitas (propiedad_codigo);

CREATE TABLE IF NOT EXISTS public.web_leads (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(120),
    apellido         VARCHAR(120),
    email            VARCHAR(160),
    whatsapp         VARCHAR(30),
    mensaje          TEXT,
    origen           VARCHAR(20) NOT NULL DEFAULT 'contacto',
    propiedad_codigo VARCHAR(30),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_web_lead_origen CHECK (origen IN ('contacto','vende','busqueda','favorito','visita'))
);

CREATE TABLE IF NOT EXISTS public.web_contenido (
    clave      VARCHAR(40) PRIMARY KEY,
    valor      JSONB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.web_propiedad_media (
    id               SERIAL PRIMARY KEY,
    propiedad_codigo VARCHAR(30) NOT NULL,
    tipo             VARCHAR(15) NOT NULL,
    url              TEXT NOT NULL,
    titulo           VARCHAR(160),
    orden            INTEGER NOT NULL DEFAULT 0,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_web_media_tipo CHECK (tipo IN ('foto','youtube','hero_clip'))
);
CREATE INDEX IF NOT EXISTS idx_web_media_prop ON public.web_propiedad_media (propiedad_codigo, tipo, orden);

CREATE TABLE IF NOT EXISTS public.web_descripcion_override (
    propiedad_codigo VARCHAR(30) PRIMARY KEY,
    descripcion_web  TEXT NOT NULL,
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.web_feedback (
    id         SERIAL PRIMARY KEY,
    estrellas  INTEGER,
    le_gusto   TEXT,
    mejoraria  TEXT,
    nombre     VARCHAR(120),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Semilla de secciones (editable desde el admin).
INSERT INTO public.web_contenido (clave, valor) VALUES
 ('hero', '{"eyebrow":"Inmobiliaria boutique · Lima & playa","title":"Encuentra el lugar donde <span class=''sig''>quieres vivir</span>.","sub":"Propiedades residenciales de alto nivel en Lima y los mejores balnearios del sur. Recorre nuestras propiedades en video y encuentra tu próximo hogar."}'),
 ('sell', '{"title":"¿Quieres vender o alquilar tu propiedad?","body":"La comercializamos con estrategia de precio, marketing y fotografía profesional, y una red de compradores calificados."}'),
 ('video', '{"title":"Video destacado","sub":"Recorridos y propiedades del canal de Karen Quezada","url":""}'),
 ('contacto', '{"whatsapp":"996 044 424","email":"kqv1101@hotmail.com"}'),
 ('social', '{"ig":"https://instagram.com/karenquezada_real_state","fb":"https://facebook.com/Karenquezadainmobiliaria","tiktok":"https://tiktok.com/@karen.agenteinmobiliario","yt":""}')
ON CONFLICT (clave) DO NOTHING;

COMMIT;
