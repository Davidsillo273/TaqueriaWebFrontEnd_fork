# SYSCOR — Sistema de Cocina (KDS)

Pantalla de comandas para la cocina de Taquería El Corral. Muestra los pedidos como tickets en tiempo real, con colores por estación y alertas de tiempo, y se maneja también por voz con **Chef Panchita**. Usa el mismo backend (SYSCOR-backEnd), el mismo sistema de diseño y los mismos componentes base que el panel de administración (`SYSCOR-AdminSystem`).

## Cómo funciona

1. **Lobby de emparejamiento.** No hay login. Al abrir, la pantalla genera su identificador persistente y muestra un **código de 6 dígitos**. Mientras no tenga token, no pide ningún dato de comandas. Un administrador va a **Ajustes → Sistema de cocina** del panel, activa **Habilitar** y escribe ese código: la pantalla recibe su token por socket y pasa sola al tablero (ver [Seguridad](#seguridad-token-de-dispositivo)). Si el admin la desvincula o apaga el sistema, regresa sola al lobby.
2. **Tablero.** Cada comanda es un ticket en una cuadrícula responsiva (una columna en el teléfono). Primero van las que están **En cocina**, luego la cola de **Pendientes** (numerada) y al final las que todavía no se pueden empezar: 2º tiempo esperando al mesero, cliente agregando productos o pedido programado para más tarde.
3. **Cola automática.** La aplica el backend mientras el sistema está habilitado (`utils/orders/kitchenQueueUtils.js`): si no hay ninguna comanda en cocina, el pedido nuevo entra directo a **En cocina**; si ya hay una, queda **Pendiente**; cuando la cocina se libera, entra la que más tiempo lleva esperando.
4. **Botones.** "Marcar lista" en lo que está en cocina; "Empezar" y "Lista" en lo pendiente. Lo marcado como listo queda unos minutos en **Listas recientes**, con un botón para regresarlo a cocina si fue un error.
5. **Detalle.** El interruptor global **Sin detalles / Con detalles** muestra solo el platillo ("2× Burrito de res") o además su receta, sacada del catálogo del menú (para cocineros nuevos). Las notas del pedido se ven siempre.

## Número de cocina

Cada ticket muestra en grande su **número de cocina**: 1, 2, 3… en el orden en que llegan los pedidos del día, sin importar si son del local, a domicilio o para llevar. Se reinicia cada día (hora de El Salvador). Lo asigna el backend al crear el pedido (`kitchenNumber`, ver `orderCodeUtils.nextKitchenNumber`), así que es el mismo en todas las pantallas.

Es solo un apodo para la cocina: el código de la orden ("CL04-03") sigue existiendo y se ve al lado, más chico. Cuando el cocinero dice «la orden 3», Panchita busca primero ese número; como es único en el día, ya no hay que aclarar si es la CL, la AD o la PL.

## Colores

- **Franja izquierda = estación**: Tacos y carnes, Antojitos y sopas, Postres, Bebidas y Extras (`constants/kitchenCategories.js`). Si una comanda junta varias estaciones es **Pedido mixto**: la franja se divide con el color de cada una, aparece la etiqueta MIXTO y cada producto lleva su cuadrito de color.
- **Fondo y borde = tiempo** desde que se pidió: normal, **amarillo** al llegar a la advertencia y **rojo parpadeante** al pasar el máximo. Los minutos los define el admin en Ajustes (por defecto 10 y 15). El amarillo y el rojo no se usan como color de estación, para que no se confundan.

## Rendimiento de los cronómetros

Con 30 comandas en pantalla, cada ticket NO tiene su propio `setInterval`:

- Hay **un solo temporizador** para toda la app (`utils/kitchenClock.js`), alineado al cambio de segundo y pausado cuando la pestaña no está visible.
- Los componentes lo leen con `useSyncExternalStore` pidiendo un valor ya derivado (`hooks/useKitchenClock.js`): el `<TicketTimer>` pide el texto "12:34" y el ticket pide solo su nivel (`ok`/`warn`/`late`). React compara el valor y solo re-renderiza a quien le cambió: cada segundo se actualizan los textos de los cronómetros y nada más; un ticket completo solo se vuelve a pintar cuando cambia de color.
- Los tickets están memorizados (`React.memo`) y las comandas se guardan por id: un evento de socket reemplaza un solo objeto y los demás tickets ni se enteran.
- Cada ticket usa `contain: layout paint` y el parpadeo rojo solo anima `opacity` en un `::after` (lo resuelve el compositor, sin repintar).

Medido con 30 comandas (27 con cronómetro): 27 actualizaciones de texto por segundo, 0 re-renders estructurales y 1 temporizador por segundo.

## Chef Panchita (voz)

Usa la Web Speech API del navegador: `SpeechRecognition` para escuchar y `SpeechSynthesis` para contestar (`hooks/useSpeech.js`). Las frases se interpretan con reglas fijas, sin IA y sin pasar por el backend (`utils/voice/kitchenCommands.js`).

- **Botón del micrófono**: escucha una frase.
- **Escucha continua**: queda escuchando y atiende solo lo que empieza con «Panchita». Mientras habla deja de escuchar, para no oírse a sí misma. Se recuerda en la pantalla (`kds_panchita_continuous`): al recargar se reactiva sola. Solo se apaga con el interruptor o diciendo «deja de escuchar».
- **Bienvenida de turno**: cuando un admin habilita la pantalla, Panchita saluda y explica cómo se trabaja (números de cocina, colores, tiempos y cómo hablarle). Recargar no la repite.
- Chrome no deja hablar ni usar el micrófono a una página que nadie ha tocado desde que se abrió. Si pasa, la frase pendiente se dice (y la escucha se reanuda) en el primer toque a la pantalla, y el panel lo avisa.
- Ejemplos: «Panchita, marca la orden 3 como lista», «¿Cuánto tiempo lleva la mesa 5?», «¿Cuál es la orden más pesada?», «¿Cuál lleva más tiempo?», «¿Qué sigue?», «Panchita, deshaz», «muestra los detalles». La lista completa está en el botón de ayuda del panel.
- «La orden 3» busca el número del código (CL04-**03**). Si hay varias con ese número (local, domicilio, para llevar), Panchita pregunta cuál.

Requiere **Chrome o Edge** y la página en **https** o `localhost`. En otros navegadores el panel avisa que no hay reconocimiento de voz y todo lo demás funciona igual.

## Seguridad (token de dispositivo)

La pantalla no tiene login: se autentica como **dispositivo**, no como usuario.

- **Identidad**: `kds_device_id` (UUID en localStorage, se genera una vez) y `kds_device_token` (el token que entrega el servidor). Ver `utils/deviceStorage.js`.
- **Emparejamiento**: sin token, el socket se conecta al namespace `/kitchen` solo con su deviceId y recibe un código de 6 dígitos. El admin, con su sesión, escribe el código en el panel. El backend genera un JWT con rol `KITCHEN_DEVICE`, el deviceId y los permisos `orders:read` y `orders:update_status`, y lo entrega **solo al socket que mostró ese código** (`context/KitchenDeviceProvider.jsx`).
- **Uso**: toda petición lleva `Authorization: Bearer <token>` y no manda cookies (`services/kitchenApi.js`). El socket manda el token en el handshake (`auth.token`): los navegadores no permiten cabeceras propias en un WebSocket, y Socket.IO usa ese campo para lo mismo.
- **Menor privilegio**: la pantalla solo llega a `/api/kitchen/*` (estado, comandas, menú y pasar comandas a En cocina o Lista). Cualquier otra ruta del backend le responde **403**, aunque el navegador tenga una sesión de admin abierta. Las comandas le llegan sin totales, pagos ni datos de contacto.
- **Vuelta al lobby**: ante un **401 o 403**, un rechazo del socket o el aviso `kitchen:device_revoked`, se borra el token y la pantalla muestra un código nuevo.
- **Kill switch**: apagar el sistema en el panel, o desvincular la pantalla, revoca el token en el servidor al instante, sin esperar a que venza (30 días).

## Estructura

```
SYSCOR-kitchenSystem/
├── index.html
├── vite.config.js            # Puerto 5174; el resto viene de @syscor/web-shared/vite
└── src/
    ├── App.jsx               # Tema + identidad del dispositivo (sin login ni rutas)
    ├── index.css             # Tokens compartidos + colores de estación y alertas
    ├── pages/                # Kitchen (lobby de emparejamiento o tablero)
    ├── components/
    │   ├── kitchen/          # Lobby, tablero, ticket, cronómetro, leyenda...
    │   └── voice/            # Panel de Chef Panchita y ayuda de comandos
    ├── context/              # KitchenDeviceProvider: deviceId, token y socket /kitchen
    ├── services/             # kitchenApi: Bearer + vuelta al lobby en 401/403
    ├── hooks/                # Estado del sistema, comandas, menú, reloj, voz
    ├── constants/            # Estados, estaciones, eventos del dispositivo
    └── utils/                # Fases y cola, contenido del pedido, tiempo, voz
```

## Instalación y desarrollo

Desde la raíz del workspace (`TaqueriaWebFrontEnd/`):

```bash
npm install          # una sola vez para todo el workspace
npm run kitchen      # http://localhost:5174
```

El proxy de Vite manda `/api` y `/socket.io` al backend local (`http://localhost:4000`), igual que el panel.

```bash
npm run build --workspace @syscor/web-kitchen
npm run lint --workspace @syscor/web-kitchen
```

## Variables de entorno

```env
# URL de la API del backend (en producción). En desarrollo se usa el proxy.
# VITE_API_URL=https://syscor-mll9.onrender.com/api
```

## Despliegue (Vercel)

- **Root Directory**: `SYSCOR-kitchenSystem`. Vercel detecta el workspace e instala desde la raíz.
- El dominio de esta pantalla debe agregarse a `FRONTEND_URL` del backend: la misma lista habilita CORS y el socket.
