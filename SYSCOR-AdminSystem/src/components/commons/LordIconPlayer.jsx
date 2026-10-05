import { useRef } from 'react';
import { Player } from '@lordicon/react';

const LordIconPlayer = ({
  icon,
  size = 24,
  colorize,
  className = '',
  trigger = 'none',
}) => {
  const playerRef = useRef(null);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      playerRef.current?.playFromBeginning();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      playerRef.current?.goToFirstFrame();
    }
  };

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Player
        ref={playerRef}
        icon={icon}
        size={size}
        colorize={colorize}
      />
    </div>
  );
};

export default LordIconPlayer;