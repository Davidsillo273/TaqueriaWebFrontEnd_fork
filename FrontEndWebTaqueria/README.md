# SYSCOR — Panel Web de Administración (Frontend)

Panel web de administración de SYSCOR para Taquería El Corral. Es la interfaz que usan administradores y empleados para gestionar el menú (combos, bebidas, platillos, extras, recetas), pedidos, mesas, inventario, clientes y personal. Consume la API REST del backend de SYSCOR (repositorio separado).

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Funcionalidades](#funcionalidades)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Dependencias del Proyecto](#dependencias-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Convenciones](#convenciones)
- [Roles del Sistema](#roles-del-sistema)
- [Licencia](#licencia)

## Descripción General

Esta aplicación es el panel de administración web de SYSCOR: una SPA (single-page application) construida con React 19 y Vite que consume la API REST del backend (repositorio `SYSCOR/backEnd`, aparte de este). Aquí no vive lógica de negocio ni acceso a base de datos — toda la persistencia, validación y autorización ocurre en el backend; este proyecto solo se encarga de la interfaz, el enrutamiento entre pantallas y el manejo de la sesión del usuario.

> El proyecto sigue la convención **PascalCase** para archivos y componentes de React, y **camelCase** para hooks, utilidades, contextos y constantes (ver [Convenciones](#convenciones)).

## Funcionalidades

- **Autenticación**: inicio de sesión con correo/contraseña, código de acceso alterno para empleados, recuperación de contraseña (envío de código, verificación, restablecimiento) e invitación de nuevo personal/administradores.
- **Dashboard**: actividad reciente, estadísticas de combos, alertas de inventario, uso de mesas y accesos rápidos.
- **Gestión de menú**: combos, bebidas (y sets de bebidas), platillos, extras y recetas.
- **Pedidos**: pedidos locales y en línea, detalle y cancelación de órdenes, facturación.
- **Mesas**: gestión de estado y uso de mesas.
- **Inventario**: control de existencias y alertas de stock.
- **Clientes**: gestión de clientes, tabla de clientes y tabla de líderes (leaderboard).
- **Personal**: gestión de empleados, invitación de staff, tabla de líderes de empleados.
- **Notificaciones**: centro de notificaciones con filtros por categoría y estado de lectura.
- **Ajustes**: configuración general y apariencia (modo claro/oscuro).
- **Asistente de chat**: widget flotante de asistente con formularios dinámicos.

## Tecnologías Utilizadas

- **React 19** — librería de UI
- **Vite** — servidor de desarrollo y bundler
- **React Router (`react-router` / `react-router-dom`) v7** — enrutamiento de la SPA
- **Tailwind CSS v4** — utilidades de estilos (cargado vía CDN en `index.html`, sistema de diseño "clay")
- **Axios** — cliente HTTP para consumir la API del backend
- **React Hook Form** — manejo de formularios
- **Recharts** — gráficas del dashboard
- **Sonner** — notificaciones tipo *toast*
- **Font Awesome** (`@fortawesome/fontawesome-free`) y **Lucide React** — iconografía
- **ESLint** — linting (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

## Dependencias del Proyecto

### Producción (`package.json`)

| Paquete | Versión | Uso |
|---|---|---|
| `react` / `react-dom` | ^19.2.7 | Librería de UI |
| `react-router` / `react-router-dom` | ^7.15.1 | Enrutamiento de la SPA |
| `axios` | ^1.18.1 | Cliente HTTP hacia la API del backend |
| `react-hook-form` | ^7.80.0 | Manejo de formularios |
| `recharts` | ^3.10.0 | Gráficas (dashboard) |
| `sonner` | ^2.0.7 | Notificaciones tipo *toast* |
| `tailwindcss` | ^4.3.0 | Utilidades de estilos |
| `@fortawesome/fontawesome-free` | ^7.2.0 | Iconografía (Font Awesome) |
| `lucide-react` | ^1.23.0 | Iconografía (Lucide) |

**Dependencias de desarrollo:**

| Paquete | Versión | Uso |
|---|---|---|
| `vite` | ^8.0.12 | Servidor de desarrollo y build |
| `@vitejs/plugin-react` | ^6.0.1 | Integración de React con Vite |
| `eslint` | ^10.3.0 | Linting |
| `eslint-plugin-react-hooks` | ^7.1.1 | Reglas de lint para hooks de React |
| `eslint-plugin-react-refresh` | ^0.5.2 | Reglas de lint para Fast Refresh |
| `@types/react` / `@types/react-dom` | ^19.x | Tipos (autocompletado en editor; el proyecto es JavaScript, no TypeScript) |

## Estructura del Proyecto

```
FrontEndWebTaqueria/
├── index.html              # Carga Tailwind (CDN) y fuentes de Google Fonts
├── vite.config.js          # Config de Vite (puerto 5173, proxy /api -> backend)
├── eslint.config.js
├── src/
│   ├── main.jsx             # Entry point
│   ├── App.jsx               # Definición de rutas (react-router)
│   ├── index.css / App.css   # Estilos globales y overrides de modo oscuro
│   ├── pages/                 # Pantallas de nivel de ruta (una por cada <Route>)
│   ├── components/
│   │   ├── auth/               # ProtectedRoute, PublicRoute, DigitInput
│   │   ├── commons/             # Componentes reutilizables (Card, FAIcon, PrimaryButton...)
│   │   ├── dashboard/            # Componentes propios del dashboard (Sidebar, TopBar, tarjetas...)
│   │   ├── chat/                  # Widget del asistente de IA
│   │   └── <dominio>/              # client/, dishes/, drinks/, employee/, extras/, inventory/, orders/, tables/
│   ├── hooks/                # Hooks de datos y lógica (useEmployees, useOrders, hooks/auth/...)
│   ├── context/               # AuthContext, ThemeContext, NotificationsContext
│   ├── constants/              # Catálogos compartidos (permissions.js, units.js)
│   └── utils/                   # Utilidades puras (payroll.js, recipeRowUtils.js)
└── public/                  # Assets estáticos (logos, favicon)
```

## Instalación y Configuración

### Prerrequisitos

- Node.js v18 o superior
- npm
- Backend de SYSCOR corriendo (local o remoto) — ver `SYSCOR/backEnd`

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto (ver [Variables de Entorno](#variables-de-entorno)).

### 3. Levantar el servidor de desarrollo

```bash
npm run dev
```

La aplicación corre por defecto en `http://localhost:5173`. En desarrollo, `vite.config.js` incluye un proxy de `/api` hacia el backend (por defecto apunta a `https://syscor-mll9.onrender.com`), reenviando también las cookies del navegador para que la sesión funcione.

### 4. Compilar para producción

```bash
npm run build
```

Genera el build de producción en `dist/`. Puede previsualizarse con:

```bash
npm run preview
```

### 5. Lint

```bash
npm run lint
```

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con:

```env
# URL base de la API del backend. Si no se define, el código usa por
# defecto https://syscor-mll9.onrender.com/api
VITE_API_URL=https://syscor-mll9.onrender.com/api
```

`VITE_API_URL` es la única variable de entorno que consume el código de esta aplicación (Vite solo expone al cliente las variables prefijadas con `VITE_`). Se usa en `authContext.jsx`, `notificationsContext.jsx`, `useInvitation.js`, `useLogout.js`, `useProfile.js` y `useSettings.js` para construir la URL base de las peticiones con Axios.

> El archivo `.env` nunca debe subirse al repositorio.

## Convenciones

- **Componentes de React**: archivo y nombre exportado en **PascalCase** (ej. `EmployeeModal.jsx` exporta `EmployeeModal`). Las pantallas de nivel de ruta viven en `src/pages/`; los componentes reutilizables o específicos de un dominio viven en `src/components/<dominio>/`.
- **Hooks, utilidades, contextos y constantes**: archivo en **camelCase** (ej. `useEmployees.js`, `payroll.js`, `themeContext.jsx`). Es la convención estándar de la comunidad de React/JS y se mantiene así intencionalmente — no es una inconsistencia a corregir.
- **Modo oscuro**: se activa agregando el atributo `data-theme="dark"` al elemento `<html>` (ver `src/context/themeContext.jsx`, persistido en `localStorage`). En vez de usar la estrategia `dark:` de Tailwind, `src/index.css` sobrescribe directamente las clases utilitarias ya usadas por el sistema de diseño (`bg-white`, `text-gray-900/600`, `border-white/80`, sombras `shadow-[...]`, etc.) bajo el selector `html[data-theme="dark"]`. Por eso los componentes nuevos deben reutilizar esas mismas clases "cubiertas" en vez de introducir colores nuevos sin cobertura en modo oscuro.
- **Sistema de diseño "clay"**: tarjetas con `rounded-3xl`, sombras compuestas neumórficas (`shadow-[...]` con realces internos `inset`), bordes `border-white/80`, tipografía `font-display` y color de acento `red-500`. Ver `src/components/commons/Card.jsx` y `src/components/commons/PrimaryButton.jsx` como referencia.
- **Iconos**: se usa el componente `FAIcon` (`src/components/commons/FAIcon.jsx`) como envoltorio de Font Awesome en vez de escribir clases `fas fa-*` sueltas.

## Roles del Sistema

El rol del usuario autenticado se define en el backend (JWT en la cookie httpOnly `authCookie`) y se consulta desde el frontend vía `GET /auth/me` al cargar la aplicación (`AuthContext`, `src/context/authContext.jsx`). Este panel web es usado por dos de los tres roles del sistema:

| Rol | Acceso en este panel |
|---|---|
| **Administrador** | Acceso completo a todas las pantallas y funciones. |
| **Empleado** | Acceso limitado a las pantallas/funciones habilitadas en su catálogo de permisos (`src/constants/permissions.js`), asignado por un administrador. |
| **Cliente** | No usa este panel — el rol cliente corresponde a la aplicación móvil de pedidos, fuera de este repositorio. |

Las rutas privadas están protegidas en el cliente por `ProtectedRoute` (`src/components/auth/ProtectedRoute.jsx`): sin sesión iniciada redirige al login; con sesión pero sin el permiso requerido, muestra la pantalla de "no autorizado" (`src/pages/ErrorScreen.jsx`, variante 403). Cualquier URL sin ruta coincidente muestra la misma pantalla en su variante 404. Esta protección es solo de experiencia de usuario: la autorización real y definitiva ocurre en el backend en cada endpoint.

La documentación interactiva de la API que este frontend consume (Swagger UI) vive en el backend, en `/api-docs`.

## Licencia

Proyecto desarrollado como propuesta tecnológica para Taquería El Corral. Todos los derechos reservados.
