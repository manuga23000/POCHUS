# Cómo agregar tu logo a POCHUS

## Pasos para agregar tu logo:

### 1. Prepara tu logo
- Guarda tu logo como `logo.png` o `logo.svg`
- Tamaño recomendado: 200x200 píxeles mínimo

### 2. Coloca el archivo en la carpeta `public`
- Copia tu archivo de logo en la carpeta: `public/logo.png`

### 3. Actualiza el código

#### En `app/page.tsx` (línea 20):
Reemplaza esto:
```tsx
<div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center">
  <span className="text-white font-bold text-lg">P</span>
</div>
```

Por esto:
```tsx
<img src="/logo.png" alt="POCHUS Logo" className="w-10 h-10 rounded-lg" />
```

#### En `app/admin/page.tsx` (línea 24):
Reemplaza esto:
```tsx
<div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
  <span className="text-white font-bold text-xl">P</span>
</div>
```

Por esto:
```tsx
<img src="/logo.png" alt="POCHUS Logo" className="w-12 h-12 rounded-lg" />
```

### 4. Guarda los cambios y recarga la página

¡Listo! Tu logo ya debería aparecer en el header de la aplicación.
