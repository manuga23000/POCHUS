# POCHUS ECO TIENDA - Sistema de Gestión de Inventario

Sistema móvil-first para gestión de inventario y ventas en ferias. Diseñado específicamente para POCHUS ECO TIENDA, permite gestionar productos, registrar ventas y generar reportes en PDF.

## Características

- **Gestión de Productos**: Carga, edita y elimina productos con múltiples talles y stock
- **Registro de Ventas**: Interfaz intuitiva para registrar ventas en ferias con carrito de compras
- **Reportes en PDF**: Genera reportes detallados de ventas y ganancias con diseño profesional
- **Diseño Mobile-First**: Optimizado para usar en el celular durante las ferias
- **Base de datos en tiempo real**: Sincronización automática con Firebase Firestore
- **Offline Ready**: Funciona sin conexión gracias a las capacidades de Firebase

## Tecnologías

- **Next.js 16** - Framework de React
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Firebase** - Base de datos y autenticación
- **jsPDF** - Generación de reportes PDF
- **Lucide React** - Iconos

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Activá **Firestore Database** en el proyecto
3. Copiá las credenciales de configuración
4. Creá un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Configurar reglas de Firestore

En Firebase Console, andá a **Firestore Database** > **Reglas** y usá estas reglas (para desarrollo):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**IMPORTANTE**: Para producción, configurá reglas más restrictivas con autenticación.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Cargar productos iniciales

1. Andá a [http://localhost:3000/admin](http://localhost:3000/admin)
2. Hacé clic en "Cargar Productos Iniciales"
3. Confirmá la carga

¡Listo! Ya tenés todos los productos cargados.

## Uso de la Aplicación

### Pantalla de Productos

- **Ver todos los productos**: Lista completa con stock por talle
- **Buscar productos**: Buscador en tiempo real
- **Agregar producto**: Botón "+" para agregar nuevos productos
- **Editar producto**: Ícono de lápiz para editar
- **Eliminar producto**: Ícono de tacho de basura

### Pantalla de Ventas

- **Buscar productos**: Encontrá rápidamente lo que necesitás
- **Seleccionar talle**: Tocá el talle disponible
- **Ajustar cantidad**: Usá los botones +/- para cambiar la cantidad
- **Agregar al carrito**: Tocá "Agregar al carrito"
- **Ver carrito**: Ícono de carrito en el header (muestra cantidad de items)
- **Modificar carrito**: Ajustá cantidades o eliminá items
- **Agregar notas**: Escribí observaciones sobre la venta
- **Confirmar venta**: Botón "Confirmar Venta" para registrar

### Pantalla de Reportes

- **Filtrar por fecha**: Seleccioná rango de fechas
- **Ver estadísticas**: Total ventas, ganancias, productos vendidos
- **Ver detalle de ventas**: Lista completa con fecha, productos y totales
- **Descargar PDF**: Botón "Descargar Reporte PDF"

## Estructura del Proyecto

```
pochus/
├── app/
│   ├── admin/          # Panel de administración
│   ├── page.tsx        # Página principal
│   ├── layout.tsx      # Layout global
│   └── globals.css     # Estilos globales
├── components/
│   ├── ui/             # Componentes reutilizables
│   ├── Navigation.tsx  # Navegación inferior
│   ├── ProductsTab.tsx # Pantalla de productos
│   ├── SalesTab.tsx    # Pantalla de ventas
│   └── ReportsTab.tsx  # Pantalla de reportes
├── lib/
│   ├── firebase.ts     # Configuración de Firebase
│   ├── db.ts           # Funciones de base de datos
│   ├── types.ts        # Tipos TypeScript
│   ├── pdf-generator.ts # Generador de PDFs
│   └── initial-products.ts # Productos iniciales
└── public/             # Archivos estáticos
```

## Deploy

### Opción 1: Vercel (Recomendado)

1. Subí el proyecto a GitHub
2. Importá el repositorio en [Vercel](https://vercel.com)
3. Agregá las variables de entorno de Firebase
4. Deploy automático

### Opción 2: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Usar en el Celular

### Como Web App

1. Abrí la URL de tu aplicación en el navegador del celular
2. En el menú del navegador, seleccioná "Agregar a pantalla de inicio"
3. La app funcionará como una app nativa

### PWA (Progressive Web App)

Para convertir en PWA completa, agregá un `manifest.json` y service worker.

## Soporte

Para reportar problemas o sugerir mejoras, contactá al desarrollador.

## Licencia

Uso privado para POCHUS ECO TIENDA.
