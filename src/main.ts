import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app/app.component';

const STALE_MOCK_API_RELOAD_KEY = 'hal-stale-mock-api-worker-reload';

removeStaleMockApiServiceWorker()
  .catch((error) => {
    console.warn('Stale mock API service worker cleanup failed.', error);
  })
  .finally(() => {
    bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
  });

async function removeStaleMockApiServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const staleRegistrations = registrations.filter((registration) =>
    [registration.active, registration.waiting, registration.installing].some((worker) =>
      worker?.scriptURL.endsWith('/mock-api-sw.js'),
    ),
  );

  await Promise.all(staleRegistrations.map((registration) => registration.unregister()));

  const staleController =
    navigator.serviceWorker.controller?.scriptURL.endsWith('/mock-api-sw.js') ?? false;

  if (!staleController) {
    sessionStorage.removeItem(STALE_MOCK_API_RELOAD_KEY);
    return;
  }

  if (sessionStorage.getItem(STALE_MOCK_API_RELOAD_KEY) !== 'done') {
    sessionStorage.setItem(STALE_MOCK_API_RELOAD_KEY, 'done');
    window.location.reload();
    await new Promise(() => undefined);
  }

  console.warn('Stale mock API service worker still controls this page.');
}
