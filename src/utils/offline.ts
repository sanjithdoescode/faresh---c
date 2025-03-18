// Service Worker for offline functionality

declare var self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'farm-connect-v1';
const OFFLINE_MUTATION_KEY = 'offline-mutations';

interface MutationData {
  type: string;
  payload: any;
  timestamp: number;
}

interface ServiceWorkerEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

self.addEventListener('install', (event: ServiceWorkerEvent) => {
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

// Queue mutations when offline
export const queueMutation = async (mutation: MutationData): Promise<void> => {
  const mutations = await localStorage.getItem(OFFLINE_MUTATION_KEY);
  const queue = mutations ? JSON.parse(mutations) : [];
  queue.push(mutation);
  await localStorage.setItem(OFFLINE_MUTATION_KEY, JSON.stringify(queue));
}; 