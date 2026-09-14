import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { installBrowserStorageHost } from './storage/browserStorageHost';

async function bootstrap() {
  // IndexedDB is available in both local development and static hosting.
  // The in-memory mock remains isolated in src/dev for explicit tests only.
  installBrowserStorageHost();

  const { default: App } = await import('./App');
  const root = createRoot(document.getElementById('root') as HTMLElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void bootstrap();
