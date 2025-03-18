declare var self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'farm-connect-v1';
const OFFLINE_MUTATION_KEY = 'offline-mutations';

interface MutationData {
  type: string;
  payload: any;
  timestamp: number;
}

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/static/css/main.css',
        '/static/js/bundle.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});

export const queueMutation = async (mutation: MutationData): Promise<void> => {
  const mutations = await self.localStorage.getItem(OFFLINE_MUTATION_KEY);
  const queue = mutations ? JSON.parse(mutations) : [];
  queue.push(mutation);
  await self.localStorage.setItem(OFFLINE_MUTATION_KEY, JSON.stringify(queue));
}; 