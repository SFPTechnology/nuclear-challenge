import { useEffect, useState } from 'react';
import { getDeviceClass } from '@utils/viewport';

export function useDeviceClass() {
  const [device, setDevice] = useState(getDeviceClass);

  useEffect(() => {
    const update = () => setDevice(getDeviceClass());
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return device;
}
