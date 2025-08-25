# 🎨 CONFIGURACIÓN DE TEMAS SHADCN EN VITE

## ✅ **YA CONFIGURADO**

Las variables CSS de Shadcn ya están agregadas en:
```
📁 src/index.css
```

### 🎯 **Estructura del Archivo**

```css
/* 1. Imports de Tailwind */
@import "tailwindcss";
@import "tw-animate-css";

/* 2. Configuración de variantes */
@custom-variant dark (&:is(.dark *));

/* 3. Mapeo de variables para Tailwind */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  /* ... todas las variables mapeadas */
}

/* 4. TEMA CLARO (:root) */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... todas las variables de tema claro */
}

/* 5. TEMA OSCURO (.dark) */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... todas las variables de tema oscuro */
}

/* 6. Estilos base */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 🚀 **CÓMO USAR LOS TEMAS**

### **1. Tema por Defecto (Claro)**
La aplicación usa el tema claro por defecto.

### **2. Activar Tema Oscuro**
Agrega la clase `dark` al elemento `<html>`:

```javascript
// Activar tema oscuro
document.documentElement.classList.add('dark');

// Desactivar tema oscuro (volver a claro)
document.documentElement.classList.remove('dark');
```

### **3. Componente de Toggle de Tema**
He creado un componente para cambiar temas:

```typescript
// Importar el componente
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Usar en cualquier componente
<ThemeToggle />
```

### **4. Agregar Toggle al Dashboard**
Para agregar el botón de cambio de tema al dashboard:

```typescript
// En src/pages/super-admin/Dashboard.tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Agregar en el header o donde prefieras
<div className="flex items-center gap-4">
  <h1>Super Admin Dashboard</h1>
  <ThemeToggle />
</div>
```

## 🎨 **VARIABLES DE COLOR DISPONIBLES**

### **Colores Principales:**
- `background` - Fondo principal
- `foreground` - Texto principal
- `card` - Fondo de tarjetas
- `primary` - Color primario
- `secondary` - Color secundario
- `muted` - Color apagado
- `accent` - Color de acento
- `destructive` - Color de error/peligro

### **Colores de UI:**
- `border` - Bordes
- `input` - Campos de entrada
- `ring` - Anillos de enfoque

### **Colores de Sidebar:**
- `sidebar` - Fondo del sidebar
- `sidebar-primary` - Primario del sidebar
- `sidebar-accent` - Acento del sidebar

## 📱 **EJEMPLO DE USO EN COMPONENTES**

```typescript
// Usar las variables CSS directamente
<div className="bg-background text-foreground border border-border rounded-lg p-4">
  <h2 className="text-primary">Título</h2>
  <p className="text-muted-foreground">Descripción</p>
  <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
    Botón
  </button>
</div>
```

## 🔧 **PERSONALIZACIÓN**

### **Cambiar Colores del Tema:**
Modifica los valores oklch en `src/index.css`:

```css
:root {
  --primary: oklch(0.205 0 0); /* Negro */
  --primary: oklch(0.647 0.222 220.523); /* Azul */
}
```

### **Herramientas para Colores:**
- [oklch.com](https://oklch.com) - Convertir y generar colores OKLCH
- [Shadcn Theme Generator](https://ui.shadcn.com/themes) - Generar temas

## ✅ **VERIFICAR QUE FUNCIONA**

1. **Agregar el toggle al dashboard:**
   ```typescript
   import { ThemeToggle } from '@/components/ui/theme-toggle';
   ```

2. **Probar el cambio de tema:**
   - Haz clic en el botón de luna/sol
   - La aplicación debe cambiar entre claro y oscuro

3. **Verificar en DevTools:**
   - Inspecciona el `<html>`
   - Debe tener/quitar la clase `dark`

¡Los temas de Shadcn ya están completamente configurados en tu proyecto! 🎉
