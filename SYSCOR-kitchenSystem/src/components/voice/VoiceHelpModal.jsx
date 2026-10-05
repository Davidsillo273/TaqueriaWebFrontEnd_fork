// components/voice/VoiceHelpModal.jsx
// Qué se le puede decir a Chef Panchita en cocina. Usa las mismas piezas de
// modal que el panel de administración (paquete compartido).
import {
  ModalShell,
  ModalHeader,
  ModalBody,
  ModalFooter,
  MODAL_BTN_PRIMARY,
} from '@syscor/web-shared/src/components/FormModal';

const GROUPS = [
  {
    title: 'Acciones',
    commands: [
      { say: 'Panchita, marca la orden 3 como lista', does: 'Pasa la comanda a Lista' },
      { say: 'Panchita, la mesa 5 está lista', does: 'También se puede decir por mesa' },
      { say: 'Panchita, empieza la orden 4', does: 'Pasa una pendiente a En cocina' },
      { say: 'Panchita, regresa la orden 3', does: 'Una lista vuelve a cocina (o "deshaz" la última)' },
    ],
  },
  {
    title: 'Preguntas',
    commands: [
      { say: '¿Cuánto tiempo lleva la orden 3?', does: 'Tiempo desde que se pidió y su lugar en la cola' },
      { say: '¿Cuál es la orden más pesada?', does: 'La que más platillos tiene entre las activas' },
      { say: '¿Cuál lleva más tiempo?', does: 'La comanda que más ha esperado' },
      { say: '¿Qué sigue?', does: 'La siguiente pendiente de la cola' },
      { say: '¿Qué lleva la orden 3?', does: 'Lee los productos y las notas' },
      { say: '¿Qué ingredientes lleva el burrito especial?', does: 'Lee la receta de un producto del menú, con cantidades' },
      { say: '¿Cómo se prepara la piña colada?', does: 'También: «la receta de los tacos al pastor»' },
      { say: '¿Cuántas hay?', does: 'Cuántas en cocina y cuántas pendientes' },
    ],
  },
  {
    title: 'Pantalla',
    commands: [
      { say: 'Panchita, muestra los detalles', does: 'Tickets con receta' },
      { say: 'Panchita, quita los detalles', does: 'Tickets solo con el platillo' },
      { say: 'Panchita, deja de escuchar', does: 'Apaga la escucha continua' },
    ],
  },
  {
    title: 'Conversación',
    commands: [
      { say: 'Hola, Panchita', does: 'Saluda según la hora y cuenta cómo va la cocina' },
      { say: '¿Cómo estás? / ¿Quién eres? / Gracias', does: 'Contesta como una compañera más' },
      { say: '¿Qué hora es?', does: 'Da la hora y el estado de la cocina' },
    ],
  },
];

export default function VoiceHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <ModalShell maxWidth="max-w-lg" zIndex="z-[80]">
      <ModalHeader
        icon="microphone"
        title="Comandos de voz"
        subtitle="Con escucha continua, empieza cada frase con «Panchita». Con el botón del micrófono no hace falta."
        onClose={onClose}
      />
      <ModalBody>
        {GROUPS.map((group) => (
          <section key={group.title} className="bg-white dark:bg-surface rounded-xl border border-line p-4 shadow-2xs">
            <h4 className="kick text-ink mb-3">{group.title}</h4>
            <ul className="space-y-2.5">
              {group.commands.map((command) => (
                <li key={command.say}>
                  <p className="text-[13px] text-ink font-medium">“{command.say}”</p>
                  <p className="text-[12px] text-muted">{command.does}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-[12px] text-muted leading-relaxed">
          «La orden 3» es el <strong>número de cocina</strong>: el número grande de cada ticket, que empieza en 1
          cada día. También entiende el código completo («orden C L 3») y la mesa («la mesa 5»).
        </p>
      </ModalBody>
      <ModalFooter note="Funciona en Chrome y Edge">
        <button type="button" onClick={onClose} className={MODAL_BTN_PRIMARY}>
          Entendido
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
