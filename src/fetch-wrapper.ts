/* eslint-disable @typescript-eslint/no-var-requires */
// Cross-platform fetch wrapper that works in both Node.js and browsers

// In browsers, fetch is available globally
// In Node.js 18+, fetch is also available globally
// For older Node.js versions, we fall back to node-fetch

interface GlobalWithFetch {
  fetch?: typeof fetch;
  FormData?: typeof FormData;
  Blob?: typeof Blob;
}

// Declare window for TypeScript when in browser context
declare const window: GlobalWithFetch & typeof globalThis;

let fetchImpl: typeof fetch;
let FormDataImpl: typeof FormData;
let BlobImpl: typeof Blob;

// Check if we're in a browser environment
if (typeof window !== 'undefined' && typeof window.fetch !== 'undefined') {
  // Browser environment
  fetchImpl = window.fetch.bind(window);
  FormDataImpl = window.FormData;
  BlobImpl = window.Blob;
} else if (typeof globalThis !== 'undefined' && typeof globalThis.fetch !== 'undefined') {
  // Node.js 18+ with native fetch
  fetchImpl = globalThis.fetch;
  FormDataImpl = globalThis.FormData;
  BlobImpl = globalThis.Blob;
} else {
  // Older Node.js versions - use node-fetch
  // This will be tree-shaken out in browser builds
  try {
    // Dynamic import to avoid bundling in browsers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const nodeFetch = require('node-fetch');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    fetchImpl = nodeFetch.default || nodeFetch;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    FormDataImpl = nodeFetch.FormData || FormData;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    BlobImpl = nodeFetch.Blob || Blob;
  } catch {
    throw new Error(
      'Fetch is not available. Please use Node.js 18+ or a modern browser, or install node-fetch.',
    );
  }
}

export { fetchImpl as fetch, FormDataImpl as FormData, BlobImpl as Blob };
