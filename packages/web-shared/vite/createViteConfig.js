// Configuración de Vite común al panel de administración y a la pantalla de
// cocina. Cada proyecto solo dice en qué puerto corre (ver su vite.config.js):
// el destino del backend, el proxy y los assets de marca son los mismos, y
// si uno de los dos apuntara a otro servidor, el tiempo real quedaría
// desincronizado entre ellos.
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// A qué backend habla el frontend en desarrollo cuando VITE_API_URL no está
// definida (el .env de este proyecto suele venir vacío). Se deja como una
// sola constante porque context/socketContext.jsx necesita EXACTAMENTE
// este mismo destino: si el proxy de /api y el socket apuntaran a servidores
// distintos, las peticiones REST y el tiempo real quedarían desincronizados
// (ej. verías los pedidos de un backend pero las notificaciones de otro).
//
// El backend local (SYSCOR-backEnd, puerto 4000 por defecto) es el destino
// correcto para desarrollo: es lo que corre en la máquina de quien está
// programando, y usar Render aquí escondería endpoints nuevos que todavía no
// se han desplegado (como pasó con /users/payroll: existía en local pero no
// en producción, y el 404 confundía). Si Render llegara a ser lo que se
// quiere probar en local, basta con definir VITE_API_URL en el .env.
const DEFAULT_BACKEND_URL = 'http://localhost:4000';

// Logos, fondos del login y favicon: una sola copia para ambos proyectos.
const SHARED_PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));

export default function createViteConfig({ port }) {
  return defineConfig(({ mode }) => {
    // Carga el .env de la raíz del proyecto que se está corriendo (incluida
    // VITE_API_URL si la definieras ahí) para poder usarla también aquí, no
    // solo en el código de React vía import.meta.env. npm corre los scripts
    // de cada workspace desde su propia carpeta, así que process.cwd() es la
    // raíz de ese proyecto.
    const env = loadEnv(mode, process.cwd(), '');
    const backendTarget = env.VITE_API_URL
      ? env.VITE_API_URL.replace(/\/api\/?$/, '')
      : DEFAULT_BACKEND_URL;

    return {
      plugins: [react(), tailwindcss()],
      publicDir: SHARED_PUBLIC_DIR,
      resolve: {
        // Los componentes compartidos viven fuera de cada proyecto: sin esto,
        // un import de React desde ahí podría resolver a otra copia y los
        // hooks/contextos dejarían de funcionar entre ambas.
        dedupe: ['react', 'react-dom', 'react-router-dom'],
      },
      server: {
        port,
        strictPort: true,
        proxy: {
          '/api': {
            target: backendTarget,
            changeOrigin: true,
            secure: false,
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyReq, req) => {
                // Pasar las cookies del navegador al backend
                if (req.headers.cookie) {
                  proxyReq.setHeader('cookie', req.headers.cookie);
                }
              });
            }
          },
          // Socket.IO no pasa por axios/fetch, así que no comparte el proxy de
          // '/api' de forma automática: sin esta entrada, io('/‍') en el
          // navegador intentaría conectar contra el propio Vite en vez del
          // backend real, y el handshake nunca llegaría a socket.js.
          // "ws: true" habilita el upgrade a WebSocket a través del proxy.
          '/socket.io': {
            target: backendTarget,
            changeOrigin: true,
            secure: false,
            ws: true,
          },
        }
      }
    }
  })
}
