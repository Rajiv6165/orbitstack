import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 users
    { duration: '30s', target: 20 }, // Sustain 20 users for 30s
    { duration: '10s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    // Fail if more than 1% of requests fail
    http_req_failed: ['rate<0.01'], 
    // Fail if 95% of requests take longer than 500ms
    http_req_duration: ['p(95)<500'], 
  },
};

const AUTH_URL = __ENV.AUTH_URL || 'http://localhost:8001';
const CATALOG_URL = __ENV.CATALOG_URL || 'http://localhost:8002';
const ORDER_URL = __ENV.ORDER_URL || 'http://localhost:8003';

export function setup() {
  // Create a product to order during the load test
  const sku = `TEST-SKU-${Math.random().toString(36).substring(2, 10)}`;
  const payload = JSON.stringify({
    name: 'Load Test Product',
    description: 'A product automatically generated for k6 load testing',
    price: 49.99,
    stock: 9999999,
    sku: sku
  });
  
  const res = http.post(`${CATALOG_URL}/products/`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  let productId = 1; // Default fallback
  if (res.status === 201) {
    productId = res.json('id');
  } else {
    console.error(`Failed to create setup product. Status: ${res.status}`);
  }
  
  return { productId: productId };
}

export default function (data) {
  const rId = Math.random().toString(36).substring(2, 10);
  const email = `k6_${__VU}_${__ITER}_${rId}@orbitstack.io`;
  const password = 'LoadTestPassword123!';
  const headers = { 'Content-Type': 'application/json' };

  // 1. Register a new user
  let res = http.post(`${AUTH_URL}/auth/register`, JSON.stringify({ email, password }), { headers });
  check(res, {
    'register status is 201': (r) => r.status === 201,
  });

  // 2. Login to get JWT
  res = http.post(`${AUTH_URL}/auth/login`, JSON.stringify({ email, password }), { headers });
  check(res, {
    'login status is 200': (r) => r.status === 200,
    'has access token': (r) => r.json('access_token') !== undefined,
  });

  let token = null;
  if (res.status === 200) {
    token = res.json('access_token');
  }

  // 3. Place an Order for the setup product
  if (token) {
    const orderHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    const orderPayload = JSON.stringify({
      product_id: data.productId,
      quantity: 1
    });
    res = http.post(`${ORDER_URL}/orders/`, orderPayload, { headers: orderHeaders });
    check(res, {
      'order status is 201': (r) => r.status === 201,
    });
  }

  // Brief pause between iterations to simulate real user wait time
  sleep(1);
}
