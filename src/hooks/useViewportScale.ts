import { useEffect, useState } from 'react';
import { getViewportScale } from '@utils/viewport';

export function useViewportScale() {
  const [scale, setScale] = useState(getViewportScale);

  useEffect(() => {
    const update = () => setScale(getViewportScale());
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return scale;
}
