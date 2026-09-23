// Identifies what a prerendered page shows, so the browser can tell whether the HTML it
// received matches the current URL (and can be hydrated) or must be rendered afresh.
// Every challenge code shares one prerendered page.
export const routeKey = (route) =>
  [route.name, route.language, route.name === 'challenge' ? '' : route.params.slug || ''].join(':')
