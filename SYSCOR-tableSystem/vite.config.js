// Mismo destino del backend, proxy y assets de marca que el panel, cocina y
// caja (paquete compartido). La página de la mesa corre en el 5176, que el
// backend permite por CORS.
import createViteConfig from '@syscor/web-shared/vite/createViteConfig.js'

export default createViteConfig({ port: 5176 })
