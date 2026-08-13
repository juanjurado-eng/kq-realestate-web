// Crea (o actualiza) el usuario administrador del sitio.
// Uso:
//   ADMIN_EMAIL=karen@... ADMIN_PASSWORD='ClaveSegura123' ADMIN_NOMBRE='Karen Quezada' node scripts/seed-admin.js
const { pool } = require('../lib/db');
const auth = require('../lib/auth');

(async () => {
  const email = (process.env.ADMIN_EMAIL || process.argv[2] || '').trim().toLowerCase();
  const pass = process.env.ADMIN_PASSWORD || process.argv[3];
  const nombre = process.env.ADMIN_NOMBRE || process.argv[4] || 'Karen Quezada';
  if (!email || !pass) {
    console.error('Faltan datos. Uso: ADMIN_EMAIL=.. ADMIN_PASSWORD=.. [ADMIN_NOMBRE=..] node scripts/seed-admin.js');
    process.exit(1);
  }
  if (String(pass).length < 8) { console.error('La contraseña debe tener al menos 8 caracteres.'); process.exit(1); }
  const ph = await auth.hash(pass);
  await pool.query(
    `INSERT INTO web_usuarios (nombre,email,password_hash,rol,email_verificado)
     VALUES ($1,$2,$3,'admin_sitio',TRUE)
     ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, rol='admin_sitio', nombre=EXCLUDED.nombre`,
    [nombre, email, ph]
  );
  console.log('✔ Administrador listo:', email);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
