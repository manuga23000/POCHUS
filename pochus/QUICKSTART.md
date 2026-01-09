# Guía Rápida de Inicio - POCHUS ECO TIENDA

Esta es una guía paso a paso para tener tu app funcionando en 10 minutos.

## Paso 1: Crear proyecto en Firebase (5 minutos)

1. Andá a [Firebase Console](https://console.firebase.google.com/)
2. Hacé clic en "Agregar proyecto" o "Add project"
3. Nombre del proyecto: `pochus-inventario` (o el que prefieras)
4. Desactivá Google Analytics (no lo necesitás por ahora)
5. Hacé clic en "Crear proyecto"

## Paso 2: Configurar Firestore (2 minutos)

1. En el menú lateral, andá a **Compilación** > **Firestore Database**
2. Hacé clic en "Crear base de datos"
3. Seleccioná "Comenzar en modo de prueba" (test mode)
4. Elegí la ubicación: **southamerica-east1** (São Paulo)
5. Hacé clic en "Habilitar"

## Paso 3: Obtener credenciales (1 minuto)

1. En Firebase Console, hacé clic en el ícono de engranaje ⚙️ > **Configuración del proyecto**
2. Bajá hasta **Tus apps**
3. Hacé clic en el ícono web `</>`
4. Nombre de la app: `POCHUS Web App`
5. NO marques Firebase Hosting
6. Hacé clic en "Registrar app"
7. **Copiá** todo el objeto `firebaseConfig` que aparece

## Paso 4: Configurar tu aplicación (2 minutos)

1. En tu proyecto, creá un archivo llamado `.env.local` en la raíz
2. Copiá y pegá esto (reemplazando con tus valores):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key-aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Ejemplo real:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxyz123ABC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pochus-inventario.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pochus-inventario
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pochus-inventario.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321:web:abc123def456
```

## Paso 5: Iniciar la aplicación

```bash
npm run dev
```

Abrí tu navegador en [http://localhost:3000](http://localhost:3000)

## Paso 6: Cargar productos iniciales

1. Andá a [http://localhost:3000/admin](http://localhost:3000/admin)
2. Hacé clic en "Cargar Productos Iniciales"
3. Confirmá
4. Esperá a que se carguen todos los productos

¡Listo! Ya podés empezar a usar la app.

## Siguientes pasos

- Probá agregar una venta desde la pestaña "Ventas"
- Generá un reporte PDF desde "Reportes"
- Editá o agregá nuevos productos desde "Productos"

## Para usar en tu celular

1. Una vez que funcione en tu computadora, podés:
   - **Opción fácil**: Desplegá gratis en Vercel (ver README.md)
   - **Opción local**: En tu celular, andá a `http://TU-IP-LOCAL:3000`
     (ej: `http://192.168.1.10:3000`)

## Problemas comunes

**Error "Firebase: Error (auth/invalid-api-key)"**
- Verificá que copiaste bien las credenciales en `.env.local`
- Asegurate de que el archivo se llame exactamente `.env.local`

**No se cargan los productos**
- Verificá que Firestore esté habilitado en Firebase Console
- Revisá la consola del navegador (F12) para ver errores

**La app no inicia**
- Ejecutá `npm install` de nuevo
- Verificá que tenés Node.js 18 o superior

## Soporte

Si algo no funciona, revisá el README.md completo para más detalles.
