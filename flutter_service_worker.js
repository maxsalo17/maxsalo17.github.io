'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "3014115bd52300edffb1f0191460c8cf",
"assets/assets/icons/angular.png": "a8b573fc4d037a30047f7fc7cfc4b571",
"assets/assets/icons/asp.png": "29c877c9eec4666b9e13aed2110102bb",
"assets/assets/icons/firebase.png": "3dc07e0389e4b2288aa0a69ed7f956e5",
"assets/assets/icons/flutter.png": "fb428f2e241a222666b877989113165b",
"assets/assets/icons/git.png": "daf4885938f3d4fa8c0c4630245919d1",
"assets/assets/icons/instagram.png": "d043f1f81292dd847ff9a7d4b860d824",
"assets/assets/icons/linkedin.png": "6d307bae2d0b14c64586dc878a06eb70",
"assets/assets/icons/node.png": "d42895788cef84b809eb8bb27f2250fd",
"assets/assets/icons/react.png": "c4870ef1193a2a63b72ee4c2848c90e6",
"assets/assets/images/api-server.png": "a00d0238665d2960320696ea34625ac3",
"assets/assets/images/api.png": "d4744b9f2cdb1eba801f1fe536ac905a",
"assets/assets/images/cross-mobile.png": "37e7544b75055b61f316792d1f264639",
"assets/assets/images/elements/Cat.png": "016716289c43cbaf03d86860aba38598",
"assets/assets/images/elements/Dog.png": "087581b4cec012f0da31a6ee6b03f5ef",
"assets/assets/images/elements/logo.gif": "b743f4482a91c612112f80ae2beb38b1",
"assets/assets/images/elements/post.png": "8c953c2109d34c1c7c6e9a66395b0bf5",
"assets/assets/images/elements/splash.png": "010d3a2e74d59a0fea0c7ffa7e14f59a",
"assets/assets/images/elements/worker.png": "c0be06927e277a9872906c7b25b42665",
"assets/assets/images/logo.png": "1e75f3cccd868a794d0d6cd60cc516da",
"assets/assets/images/me.png": "18bced0a81a0128adc74f7619e01c07f",
"assets/assets/images/serverless.png": "989dcc96f5d09c9b33d28a01498630c4",
"assets/assets/images/serverless_white.png": "59de30e33ade3846de126352fe9ff760",
"assets/assets/images/web.png": "e252dd87ccb23c181bfc38f8368fd451",
"assets/assets/lottie/logo.json": "f13566cf9081eea5f4f99e542f61f04c",
"assets/FontManifest.json": "01700ba55b08a6141f33e168c4a6c22f",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/NOTICES": "7c92e9a77f20e7d732e593809d6dbb83",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "2def70cdfb9efbc99017bc85e0c5e804",
"/": "2def70cdfb9efbc99017bc85e0c5e804",
"main.dart.js": "d5b3faf359e290d3895d0826de77e143",
"manifest.json": "5a2c0526f1fe73e6f211bc7a9d15c210"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
