// El destino del backend, el proxy de /api y /socket.io y los assets de marca
// son comunes con el panel de administración: viven en el paquete compartido.
// La pantalla de cocina corre en el 5174, que el backend ya permite por CORS.
import createViteConfig from '@syscor/web-shared/vite/createViteConfig.js'

export default createViteConfig({ port: 5174 })
