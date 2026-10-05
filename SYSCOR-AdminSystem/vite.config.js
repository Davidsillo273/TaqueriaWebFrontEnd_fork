// El destino del backend, el proxy de /api y /socket.io y los assets de marca
// son comunes con la pantalla de cocina: viven en el paquete compartido.
import createViteConfig from '@syscor/web-shared/vite/createViteConfig.js'

export default createViteConfig({ port: 5173 })
