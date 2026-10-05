import { ThemeProvider } from '@syscor/web-shared/src/context/themeContext'
import { ToastProvider } from '@syscor/web-shared/src/components/ToastProvider'
import KitchenDeviceProvider from './context/KitchenDeviceProvider'
import Kitchen from './pages/Kitchen'

// App entry de la pantalla de cocina. No hay login ni rutas: la pantalla se
// identifica como dispositivo (KitchenDeviceProvider) y muestra el lobby de
// emparejamiento o el tablero de comandas, según tenga o no su token.
export default function App() {
	return (
		<ThemeProvider>
			<KitchenDeviceProvider>
				<ToastProvider>
					<Kitchen />
				</ToastProvider>
			</KitchenDeviceProvider>
		</ThemeProvider>
	)
}
