import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up
    { duration: '30s', target: 100 }, // Sustained load
    { duration: '5s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<80'], // 95% of requests must complete below 80ms
    http_req_failed: ['rate<0.05'],   // Less than 5% errors
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:4000';

export default function () {
  // 1. Benchmark Autocomplete (Target p95 <= 25ms)
  const suggestRes = http.get(`${BASE_URL}/api/v1/suggest?q=iph`);
  check(suggestRes, {
    'suggest status is 200': (r) => r.status === 200,
    'suggest latency < 25ms': (r) => r.timings.duration < 25,
  });

  // 2. Benchmark Short Link Redirect (Target p95 <= 15ms on cache hit)
  const redirectRes = http.get(`${BASE_URL}/api/v1/links/redirect/aB3xY9q`, {
    headers: { Accept: 'application/json' },
  });
  check(redirectRes, {
    'redirect status is 200': (r) => r.status === 200,
  });

  // 3. Benchmark Catalog Read
  const catalogRes = http.get(`${BASE_URL}/api/v1/products?limit=10`);
  check(catalogRes, {
    'catalog status is 200': (r) => r.status === 200,
  });

  sleep(0.1);
}
