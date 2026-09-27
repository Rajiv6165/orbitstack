# OrbitStack Load Testing

This directory contains automated load tests using [k6](https://k6.io/) to simulate realistic user traffic (registrations, logins, and order placements) against the OrbitStack services.

## Automated CI Load Tests
A GitHub Action (`.github/workflows/load-test.yml`) is configured to run these load tests against a `docker-compose` staging environment on every Pull Request. 

The test enforces the following reliability thresholds:
- **Error Rate**: Less than 1% of requests fail (`http_req_failed < 0.01`).
- **Latency (p95)**: 95% of requests complete in under 500ms (`http_req_duration < 500`).

## Running Locally

To manually verify system performance or test threshold adjustments locally, you can run the k6 script against the local docker-compose environment.

### 1. Start the Stack
First, ensure your local OrbitStack environment is running via Docker Compose:
```bash
docker-compose up -d
```
Wait a few seconds for the databases and APIs to fully initialize.

### 2. Install k6
If you don't have k6 installed locally, install it via your package manager:
- **macOS**: `brew install k6`
- **Windows**: `winget install k6`
- **Linux (Debian/Ubuntu)**: `sudo apt-get install k6`

### 3. Execute the Load Test
Run the k6 script from the root directory of the repository:
```bash
k6 run tests/load/script.js
```

### 4. Advanced Configuration (Custom Environment)
If you want to run the load tests against a live deployed cluster (e.g., your k3s staging environment behind the NGINX ingress), you can override the base URLs using environment variables:

```bash
AUTH_URL=http://staging.orbitstack.io/api \
CATALOG_URL=http://staging.orbitstack.io/api \
ORDER_URL=http://staging.orbitstack.io/api \
k6 run tests/load/script.js
```
