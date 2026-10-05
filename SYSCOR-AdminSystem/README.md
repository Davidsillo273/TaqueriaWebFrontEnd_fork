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
- **Ajustes**: configuración general, apariencia (modo claro/oscuro) y **Sistema de cocina**: habilitar/deshabilitar la pantalla de comandas (`SYSCOR-kitchenSystem`) en tiempo real y definir sus tiempos de alerta.
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

Este proyecto vive dentro del workspace de npm `TaqueriaWebFrontEnd/`, junto a la pantalla de cocina (`SYSCOR-kitchenSystem`) y al paquete compartido `@syscor/web-shared` (ver el `README.md` de la raíz).

```
SYSCOR-AdminSystem/
├── index.html              # Fuentes de Google Fonts e iconos Phosphor
├── vite.config.js          # Puerto 5173; el resto viene de @syscor/web-shared/vite
├── eslint.config.js
└── src/
    ├── main.jsx             # Entry point
    ├── App.jsx               # Definición de rutas (react-router)
    ├── index.css / App.css   # Importa los tokens compartidos + estilos propios del panel
    ├── pages/                 # Pantallas de nivel de ruta (una por cada <Route>)
    ├── components/
    │   ├── auth/               # ProtectedRoute, PublicRoute, DigitInput
    │   ├── commons/             # Componentes reutilizables propios del panel (PageShell, Select...)
    │   ├── dashboard/            # Componentes propios del dashboard (Sidebar, TopBar, tarjetas...)
    │   ├── chat/                  # Widget del asistente de IA
    │   └── <dominio>/              # client/, dishes/, drinks/, employee/, extras/, inventory/, orders/, tables/
    ├── hooks/                # Hooks de datos y lógica (useEmployees, useOrders, useSettings...)
    ├── context/               # NotificationsContext, AssistantContext
    ├── constants/              # Catálogos (permissions.js, units.js)
    └── utils/                   # Utilidades puras (payroll.js, recipeRowUtils.js)
```

Lo que comparte con la pantalla de cocina se importa desde `@syscor/web-shared/src/...`: tokens de color y tipografía, `FAIcon`, `Logo`, `FormModal`/`ConfirmModal`, `ToastProvider`, `PanchitaIcon`, `ThemeToggle`, los contextos de tema/sesión/socket, `useLogin`/`useLogout`, `socketEvents` y `orderCode`. Los assets de `public/` (logos, fondos, favicon) también viven en el paquete compartido.

## Instalación y Configuración

### Prerrequisitos

- Node.js v18 o superior
- npm
- Backend de SYSCOR corriendo (local o remoto) — ver `SYSCOR/backEnd`

### 1. Instalar dependencias

Desde la **raíz del workspace** (`TaqueriaWebFrontEnd/`), no desde esta carpeta: npm instala una sola vez las dependencias del panel, de la pantalla de cocina y del paquete compartido.

```bash
cd TaqueriaWebFrontEnd
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz de este proyecto (ver [Variables de Entorno](#variables-de-entorno)).

### 3. Levantar el servidor de desarrollo

```bash
npm run admin        # desde la raíz del workspace
# o bien, desde esta carpeta:
npm run dev
```

La aplicación corre en `http://localhost:5173`. En desarrollo, el proxy de Vite (`packages/web-shared/vite/createViteConfig.js`) manda `/api` y `/socket.io` al backend local (`http://localhost:4000`), reenviando también las cookies del navegador para que la sesión funcione.

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
# defecto /api (aprovechando el proxy de Vite en desarrollo hacia http://localhost:4000)
# VITE_API_URL=https://syscor-mll9.onrender.com/api

# Dirección de la pantalla de cocina, para el botón "Abrir pantalla de cocina"
# de Ajustes → Sistema de cocina. En desarrollo no hace falta (usa el 5174).
# VITE_KITCHEN_URL=https://cocina.ejemplo.com
```

`VITE_API_URL` construye la URL base de las peticiones (y del socket) en todo el panel. `VITE_KITCHEN_URL` solo se usa en la pestaña **Sistema de cocina** de Ajustes; si falta en producción, el botón de abrir la cocina simplemente no aparece.

> El archivo `.env` nunca debe subirse al repositorio.

## Convenciones

- **Componentes de React**: archivo y nombre exportado en **PascalCase** (ej. `EmployeeModal.jsx` exporta `EmployeeModal`). Las pantallas de nivel de ruta viven en `src/pages/`; los componentes reutilizables o específicos de un dominio viven en `src/components/<dominio>/`.
- **Hooks, utilidades, contextos y constantes**: archivo en **camelCase** (ej. `useEmployees.js`, `payroll.js`, `themeContext.jsx`). Es la convención estándar de la comunidad de React/JS y se mantiene así intencionalmente — no es una inconsistencia a corregir.
- **Modo oscuro**: se activa agregando el atributo `data-theme="dark"` al elemento `<html>` (ver `packages/web-shared/src/context/themeContext.jsx`, persistido en `localStorage`). Los colores son tokens (`bg-surface`, `text-ink`, `border-line`, `text-ac`...) definidos en `packages/web-shared/src/styles/tokens.css`, que el modo oscuro redefine de golpe; los componentes nuevos deben usar esos tokens en vez de colores sueltos.
- **Iconos**: se usa el componente `FAIcon` (`@syscor/web-shared/src/components/FAIcon`), que traduce los nombres de Font Awesome a iconos Phosphor, en vez de escribir clases sueltas.
- **Código compartido con la cocina**: si algo lo van a usar el panel y la pantalla de cocina, va en `packages/web-shared` y se importa como `@syscor/web-shared/src/...`; si solo lo usa el panel, se queda en este proyecto.

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
