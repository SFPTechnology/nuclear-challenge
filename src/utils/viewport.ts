export const getDeviceClass = () => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const getViewportScale = () => {
  if (typeof window === 'undefined') return 1;
  const widthScale = window.innerWidth / 390;
  const heightScale = window.innerHeight / 844;
  return Math.max(0.78, Math.min(1.18, Math.min(widthScale, heightScale)));
};

export const localDay = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return {
    key: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    year,
    month,
    day,
    weekday: date.getDay(),
  };
};
