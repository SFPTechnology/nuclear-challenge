import { Plate } from './Plate';
import { Label } from './Label';

interface PauseButtonProps {
  onClick: () => void;
}

export function PauseButton({ onClick }: PauseButtonProps) {
  return (
    <button type="button" onClick={onClick} aria-label="Pausar sistema">
      <Plate className="px-2.5 py-1.5 h-full flex items-center">
        <Label size={8}>Pausar</Label>
      </Plate>
    </button>
  );
}
