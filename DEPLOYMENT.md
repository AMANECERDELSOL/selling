# Guía de Despliegue - Netlify + Render

## 📦 Arquitectura de Despliegue

- **Frontend**: Netlify (gratis, CDN global)
- **Backend**: Render (gratis, servidor persistente)
- **Base de Datos**: SQLite en Render (incluida con el servidor)

## 🚀 Paso 1: Desplegar Backend en Render

### 1.1 Preparar Repositorio
```bash
cd "c:\Users\DELL\Downloads\Pagina Cashout"
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Subir a GitHub
1. Crear repositorio en GitHub
2. Conectar y pushear:
```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 1.3 Desplegar en Render
1. Ir a [render.com](https://render.com)
2. Sign up / Login con GitHub
3. Click "New +" → "Web Service"
4. Conectar tu repositorio
5. Configurar:
   - **Name**: `cashout-api` (o el que prefieras)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. Variables de entorno (Environment):
```
PORT=5000
NODE_ENV=production
DB_PATH=./database.db
JWT_SECRET=tu_secreto_super_seguro_cambiar_esto_en_produccion
SUPERUSER_EMAIL=admin@cashout.com
SUPERUSER_PASSWORD=Admin123!
BINANCE_API_KEY=tu_api_key
BINANCE_SECRET_KEY=tu_secret_key
BINANCE_MERCHANT_ID=tu_merchant_id
```

7. Click "Create Web Service"
8. Esperar deployment (~5 min)
9. **Copiar la URL** (ej: `https://cashout-api.onrender.com`)

## 🎨 Paso 2: Desplegar Frontend en Netlify

### 2.1 Configurar URL del Backend
1. Editar `client/.env`:
```
VITE_API_URL=https://cashout-api.onrender.com
```
(Reemplazar con tu URL de Render del paso 1.9)

2. Commit los cambios:
```bash
git add client/.env
git commit -m "Configure production API URL"
git push
```

### 2.2 Desplegar en Netlify

**Opción A: Deploy automático con Git**
1. Ir a [netlify.com](https://netlify.com)
2. Sign up / Login con GitHub
3. Click "Add new site" → "Import an existing project"
4. Conectar con GitHub
5. Seleccionar tu repositorio
6. Netlify detectará automáticamente la configuración de `netlify.toml`
7. Variables de entorno:
   - Ir a "Site settings" → "Environment variables"
   - Agregar: `VITE_API_URL=https://cashout-api.onrender.com`
8. Click "Deploy site"
9. Esperar deployment (~2 min)
10. Tu sitio estará en: `https://NOMBRE-ALEATORIO.netlify.app`

**Opción B: Deploy manual (más rápido para probar)**
```bash
cd client
npm run build
```
Luego arrastra la carpeta `client/dist` a Netlify drop zone

### 2.3 Configurar Dominio Personalizado (Opcional)
1. En Netlify: "Domain settings" → "Add custom domain"
2. Configurar DNS según instrucciones

## 🔧 Paso 3: Configurar CORS en Backend

El backend ya tiene CORS habilitado para todos los orígenes en desarrollo. Para producción, es recomendable restringirlo.

Editar `server/server.js`:
```javascript
// Antes de app.use(cors()):
const allowedOrigins = [
  'https://tu-sitio.netlify.app',
  'http://localhost:3000' // Para desarrollo local
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

Commit y push para redesplegar en Render.

## ✅ Paso 4: Verificar Deployment

1. **Frontend**: Visita tu URL de Netlify
2. **Backend**: Prueba `https://tu-api.onrender.com/api/health`
3. **Login**: Intenta iniciar sesión con admin@cashout.com / Admin123!

## 🔄 Actualizaciones Futuras

### Backend (Render)
- Render auto-despliega al hacer push a GitHub (si configuraste CD)
- O manualmente: Dashboard de Render → "Manual Deploy"

### Frontend (Netlify)
- Netlify auto-despliega al hacer push a GitHub
- O manualmente: `npm run build` y arrastra `dist` folder

## 💾 Persistencia de Base de Datos en Render

⚠️ **Importante**: Render Free tier **NO** garantiza persistencia del disco. La BD puede perderse en redeploys.

### Soluciones:

**Opción 1: Backup Manual**
Antes de redesplegar, descargar `database.db` via Render Shell

**Opción 2: Base de Datos Externa (Recomendado para producción)**
- **Supabase** (PostgreSQL gratis): supabase.com
- **PlanetScale** (MySQL gratis): planetscale.com
- **Railway** (PostgreSQL con plan gratis): railway.app

Cambiar en `server/database/db.js` para usar PostgreSQL en vez de SQLite.

**Opción 3: Render Persistent Disk (Paid)**
Agregar persistent disk en Render (plan pagado)

## 🛡️ Checklist de Seguridad Para Producción

- [ ] Cambiar `JWT_SECRET` a valor seguro único
- [ ] Cambiar contraseña del super admin después del primer login
- [ ] Configurar CORS con orígenes específicos
- [ ] Habilitar HTTPS (Netlify y Render lo hacen automáticamente)
- [ ] Configurar rate limiting en backend
- [ ] Hacer backup regular de la base de datos
- [ ] Configurar variables de entorno de Binance Pay
- [ ] Revisar logs de errores regularmente

## 📊 Monitoreo

### Render
- Dashboard → Logs (ver logs en tiempo real)
- Dashboard → Metrics (CPU, memoria)

### Netlify
- Site dashboard → Deploys (historial)
- Analytics (en plan pagado)

## 🐛 Troubleshooting

### Error: "API calls failing"
- Verificar que `VITE_API_URL` en Netlify apunta a Render
- Verificar que backend esté corriendo en Render
- Revisar CORS settings

### Error: "Database not found"
- Verificar que Render tiene permisos de escritura
- Verificar que `DB_PATH` está configurado en Render

### Error: "Build failed en Netlify"
- Verificar que `client/package.json` tenga el script `build`
- Revisar logs de build en Netlify dashboard

## 💰 Costos

- **Netlify Free**: 100 GB bandwidth/mes, builds ilimitados
- **Render Free**: 750 horas/mes, 512 MB RAM, duerme después de 15 min inactividad
- **Total**: $0/mes (suficiente para desarrollo y demos)

Para producción con tráfico real, considerar planes pagados o alternativas.

## 🔗 URLs de Referencia

- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

¡Tu aplicación estará online y accesible desde cualquier lugar! 🌍
