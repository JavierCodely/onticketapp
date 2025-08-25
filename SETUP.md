# 🚀 Configuración del Sistema de Login con Supabase

## 📋 Resumen
Este sistema implementa un login sin registro usando Supabase y Shadcn UI, con gestión de roles y autenticación completa.

## 🔧 Configuración Inicial

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL de tu proyecto Supabase (Project Settings > API)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave pública/anon de Supabase (Project Settings > API)
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 2. Configuración de Supabase
Ejecuta el script SQL que está en `src/supabaseDoc/supabase-0001.txt` en tu proyecto Supabase:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a SQL Editor
3. Copia y pega todo el contenido del archivo `supabase-0001.txt`
4. Ejecuta el script completo

### 3. Crear Usuario de Prueba
Para probar el sistema, necesitas crear usuarios manualmente:

#### Opción 1: Desde Supabase Dashboard
1. Ve a Authentication > Users
2. Haz clic en "Invite a user"
3. Ingresa email y contraseña temporal
4. El usuario recibirá un email para confirmar

#### Opción 2: Desde SQL Editor
```sql
-- Insertar usuario directamente (para testing)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Test"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

### 4. Asignar Roles
Después de crear un usuario, asigna roles desde SQL Editor:

```sql
-- Hacer super administrador
UPDATE profiles 
SET is_super_admin = true, role = 'super_admin' 
WHERE email = 'admin@test.com';

-- O crear relación con club (usa el ID del club demo)
INSERT INTO user_clubs (user_id, club_id, role) 
VALUES (
  (SELECT id FROM profiles WHERE email = 'admin@test.com'),
  (SELECT id FROM clubs WHERE slug = 'club-demo'),
  'owner'
);
```

## 🖥️ Ejecutar la Aplicación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🧪 Probar el Sistema

### Credenciales de Prueba
- **Email**: admin@test.com
- **Contraseña**: 123456

### Funcionalidades Implementadas
✅ Login sin registro  
✅ Gestión de roles (super_admin, club_admin)  
✅ Roles por club (owner, manager, supervisor, staff)  
✅ Dashboard con información del usuario  
✅ Logout  
✅ Rutas protegidas  
✅ Contexto de autenticación global  

## 📁 Estructura de Archivos Creados

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Formulario de login con Shadcn
│   │   └── ProtectedRoute.tsx    # Componente para rutas protegidas
│   └── ui/
│       ├── button.tsx           # Componente Button de Shadcn
│       ├── card.tsx             # Componente Card de Shadcn
│       └── input.tsx            # Componente Input para formularios
├── context/
│   └── AuthContext.tsx          # Contexto global de autenticación
├── lib/
│   ├── supabase.ts             # Cliente de Supabase configurado
│   └── utils.ts                # Utilidades (función cn)
├── pages/
│   └── Dashboard.tsx           # Página principal con info del usuario
├── types/
│   ├── auth.ts                # Tipos de autenticación
│   └── database.ts            # Tipos de base de datos
└── App.tsx                    # Aplicación principal
```

## 🔍 Puntos Importantes

### Seguridad
- ❌ **No hay auto-registro**: Solo admins pueden crear usuarios
- ✅ **RLS habilitado**: Row Level Security en todas las tablas
- ✅ **Roles granulares**: Sistema de roles a nivel sistema y club
- ✅ **Sesiones seguras**: Manejo automático de tokens

### Comentarios en el Código
Cada línea de código importante tiene comentarios explicativos en español para facilitar el entendimiento y mantenimiento.

### Próximos Pasos
1. Configurar variables de entorno
2. Ejecutar script SQL en Supabase
3. Crear usuarios de prueba
4. Asignar roles apropiados
5. Probar el sistema completo

## 🆘 Troubleshooting

### Error de Variables de Entorno
Si ves error de variables no configuradas, verifica que el archivo `.env` esté en la raíz y tenga las variables correctas.

### Error de Base de Datos
Si hay errores de autenticación, verifica que el script SQL se ejecutó correctamente y que los usuarios tienen perfiles creados.

### Error de Roles
Si no se muestran clubs o roles, verifica que el usuario tenga relaciones en la tabla `user_clubs`.
