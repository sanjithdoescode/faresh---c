declare global {
  interface ServiceWorkerGlobalScope {
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    registration: ServiceWorkerRegistration;
    skipWaiting(): Promise<void>;
    clients: Clients;
    localStorage: Storage;
  }

  interface ExtendableEvent extends Event {
    waitUntil(fn: Promise<any>): void;
  }

  interface FetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
  }
}

export {}; 