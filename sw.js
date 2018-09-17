let cacheName = 'mws-50';

self.addEventListener('install', function(event) {
  console.log ('attempting to add things to cache')
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll([
          '/',
          '/css/responsive.css',
          '/css/styles.css',

          '/data/restaurants.json',

          '/img/1.jpg',
          '/img/2.jpg',
          '/img/3.jpg',
          '/img/4.jpg',
          '/img/5.jpg',
          '/img/6.jpg',
          '/img/7.jpg',
          '/img/8.jpg',
          '/img/9.jpg',
          '/img/10.jpg',
          '/img/thumbs.db',

          '/js/dbhelper.js',
          '/js/main.js',
          '/js/restaurant_info.js',

          '/index.html',
          '/README.md',
          '/restaurant.html',
          '/sw.js',

          '/offline.html'
      ]);
    })
  );
});
/*
//always do cache
self.addEventListener('fetch', function(event) {
  // If a match isn't found in the cache, the response
  // will look like a connection error
  event.respondWith(caches.match(event.request));
});
*/
/*
//something that actually talks to the network
// fetch event // match cache
self.addEventListener('fetch', function(event) {
  console.log ('caches.match')
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response){
      //  console.log (event.request);
      //  console.log (response);
      //  console.log ('there is a response');
      }
      if (!response){
      //  console.log (event.request);
      //  console.log (response);
      //  console.log ('there is not a response');
      }
      return response || fetch(event.request);
    })
  );
});
*/
/*
//returns offline.html
self.addEventListener('fetch', function(event) {
  event.respondWith(
     fetch(event.request).catch(function(error) {
       //offline fallback
       return caches.open(cacheName).then(function(cache) {
         return cache.match('offline.html');
       });
     })
   );
});
*/
/*
//always returns index.html
self.addEventListener('fetch', function(event) {
  event.respondWith(
     fetch(event.request).catch(function(error) {
       //offline fallback
       //matching event.request says it's an object that's
       //not a request
       return caches.open(cacheName).then(function(cache) {
         return cache.match('index.html');
       });
     })
   );
});
*/
/*
//jank but works?
self.addEventListener('fetch', function(event) {
  event.respondWith(
     fetch(event.request).catch(function(error) {
       //well ok this is crap but at least it
       //seems to work?
       return caches.open(cacheName).then(function(cache) {
         return cache.match('/');
       });
     })
   );
});
*/

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
