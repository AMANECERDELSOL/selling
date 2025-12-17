# Cashout - E-commerce Platform

Plataforma de comercio electrónico para venta de productos digitales con sistema multi-rol (compradores, vendedores, super admin).

## 🚀 Inicio Rápido

### Backend (API)

```bash
cd server
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:5000`

**Credenciales de Super Admin por defecto:**
- Email: admin@cashout.com
- Password: Admin123!

### Frontend (Cliente)

```bash
cd client
npm install
npm run dev
```

La aplicación se ejecutará en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
Pagina Cashout/
├── server/              # Backend Express + SQLite
│   ├── database/       # Esquema y configuración de DB
│   ├── routes/         # Rutas de API
│   ├── middleware/     # Autenticación
│   └── server.js       # Servidor principal
├── client/             # Frontend React + Vite
    ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/      # Páginas por rol
│   │   ├── context/    # Context API
│   │   └── index.css   # Estilos responsivos
    └── database.db     # Base de datos SQLite
```

## 👥 Roles de Usuario

### Comprador (Buyer)
- Auto-registro público
- Explorar catálogo de productos
- Filtrar por categorías
- Carrito de compras
- Checkout con Binance Pay
- Seguimiento de órdenes

### Vendedor (Seller)
- Creado solo por super admin
- Ver ganancias totales
- Gestionar órdenes pendientes
- Actualizar estados de órdenes
- Acceso a información de contacto

### Super Admin
- Panel de analíticas completo
- Crear/editar/eliminar productos
- Crear/gestionar vendedores
- Asignar ganancias  Asignar ventas a vendedores
- Vista completa del sistema

## 🎨 Categorías de Productos

1. **Gift Cards** - Tarjetas de regalo
2. **Chips** - Monedas/chips para juegos
3. **Artículos Didácticos** - Materiales educativos
4. **Cuentas de Juegos** - Cuentas verificadas

## 💳 Integración Binance Pay

El sistema incluye integración simulada de Binance Pay para desarrollo.

Para producción, configure las credenciales en `server/.env`:
```env
BINANCE_API_KEY=tu_api_key
BINANCE_SECRET_KEY=tu_secret_key
BINANCE_MERCHANT_ID=tu_merchant_id
```

## 📱 Diseño Responsive

La aplicación está optimizada para:
- 📱 Móviles (<768px)
- 📋 Tablets (768px-1024px)
- 🖥️ Escritorio (>1024px)

Características móviles:
- Menú hamburguesa
- Carrito drawer
- Interacciones táctiles
- Formularios optimizados

## 🔒 Seguridad

- Autenticación JWT
- Passwords hasheados con bcrypt
- Rutas protegidas por rol
- Validación de datos
- SQL injection protection

## 📊 Base de Datos

SQLite con las siguientes tablas:
- `users` - Usuarios y roles
- `categories` - Categorías de productos
- `products` - Catálogo de productos
- `orders` - Órdenes de compra
- `order_items` - Items por orden
- `transactions` - Transacciones de pago
- `seller_earnings` - Ganancias de vendedores

## 🛠️ Tecnologías

**Backend:**
- Express.js
- SQLite + better-sqlite3
- JWT
- bcryptjs
- Binance Pay API

**Frontend:**
- React 18
- Vite
- React Router
- CSS Variables (Glassmorphism)
- Mobile-first responsive design

## 📝 Notas

- Los compradores pueden auto-registrarse
- Los vendedores son creados por el admin
- Solo hay un super admin en el sistema
- La base de datos incluye productos de ejemplo

## 🎯 Próximos Pasos

1. Configurar credenciales de Binance Pay
2. Cambiar la contraseña del super admin
3. Crear vendedores desde el panel admin
4. Agregar productos personalizados
5. Probar el flujo completo de compra
