const CACHE_PREFIX = 'pet-toolkit-'
const CACHE_VERSION = 'pet-toolkit-shell-v1'
const APP_PAGES = ['/', '/schedule/', '/cost/', '/lost-pet/', '/records/', '/guide/']
const STATIC_PREFIX = '/assets/'

const pagePath = (pathname) => {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  return APP_PAGES.includes(normalized) ? normalized : '/'
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_PAGES)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_VERSION).map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  const navigation = request.mode === 'navigate' && APP_PAGES.includes(url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`)
  const staticAsset = url.pathname.startsWith(STATIC_PREFIX)
  if (!navigation && !staticAsset) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION)
    try {
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    } catch {
      if (navigation) return (await cache.match(request)) ?? (await cache.match(pagePath(url.pathname))) ?? (await cache.match('/')) ?? Response.error()
      return (await cache.match(request)) ?? Response.error()
    }
  })())
})
