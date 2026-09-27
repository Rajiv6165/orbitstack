# OrbitStack Operations & Incident Response Manual 🛠️

This runbook documents production operations, database backup and recovery procedures, service scaling policies, and an incident-response checklist for the OrbitStack microservices platform running on **k3s / Kubernetes** (namespace: `orbitstack`).

---

## 📚 Table of Contents

- [1. PostgreSQL Database Backup Workflow](#1-postgresql-database-backup-workflow)
  - [Prerequisites & Pod Discovery](#prerequisites--pod-discovery)
  - [Backing Up Individual Service Databases](#backing-up-individual-service-databases)
  - [Backing Up All Databases (Full Cluster Dump)](#backing-up-all-databases-full-cluster-dump)
  - [Compressed Custom-Format Backups](#compressed-custom-format-backups)
- [2. PostgreSQL Database Restore Workflow](#2-postgresql-database-restore-workflow)
  - [Pre-Restore Safety Checklist](#pre-restore-safety-checklist)
  - [Restoring SQL Text Dumps](#restoring-sql-text-dumps)
  - [Restoring Compressed Dumps (`pg_restore`)](#restoring-compressed-dumps-pg_restore)
  - [Post-Restore Data Verification](#post-restore-data-verification)
- [3. Manual Service Scaling (`kubectl scale`)](#3-manual-service-scaling-kubectl-scale)
  - [Scaling Deployments Up or Down](#scaling-deployments-up-or-down)
  - [Interactions with HorizontalPodAutoscaler (HPA)](#interactions-with-horizontalpodautoscaler-hpa)
  - [Monitoring Scale Rollout Progress](#monitoring-scale-rollout-progress)
- [4. Incident Response Checklist & SOP](#4-incident-response-checklist--sop)
  - [Step 1: Check Pod & Cluster Health](#step-1-check-pod--cluster-health)
  - [Step 2: Inspect Application Logs & Correlation Traces](#step-2-inspect-application-logs--correlation-traces)
  - [Step 3: Analyze Grafana Metrics & Alertmanager Alerts](#step-3-analyze-grafana-metrics--alertmanager-alerts)
  - [Step 4: Emergency Rollback (`kubectl rollout undo`)](#step-4-emergency-rollback-kubectl-rollout-undo)
- [5. Secrets Management (Sealed Secrets)](#5-secrets-management-sealed-secrets)
  - [Generating Sealed Secrets](#generating-sealed-secrets)
  - [Updating Secrets](#updating-secrets)

---

## 1. PostgreSQL Database Backup Workflow

OrbitStack follows a **database-per-service** isolation pattern. Three logical databases reside within the PostgreSQL deployment ([`k8s/03-postgres.yaml`](file:///c:/Users/rajiv/OneDrive/Desktop/Projects/Main%20Projects/Orbitstack/k8s/03-postgres.yaml)):
- `auth_db`: User accounts, bcrypt password hashes, and security credentials.
- `catalog_db`: Product listings, SKUs, pricing, and stock inventory.
- `order_db`: Historical order records, customer emails, and transactional states.

### Prerequisites & Pod Discovery

Verify the PostgreSQL pod is `Running` in the `orbitstack` namespace:

```bash
# Locate the active PostgreSQL pod
kubectl get pods -n orbitstack -l app=postgres
```

Sample output:
```text
NAME                        READY   STATUS    RESTARTS   AGE
postgres-799d554d75-x29jk   1/1     Running   0          4h
```

---

### Backing Up Individual Service Databases

Use `kubectl exec` and `pg_dump` to capture individual database backups directly to your local workstation or backup server.

#### 1. Back up `auth_db`
```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  pg_dump -U postgres -d auth_db > backup_auth_db_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Back up `catalog_db`
```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  pg_dump -U postgres -d catalog_db > backup_catalog_db_$(date +%Y%m%d_%H%M%S).sql
```

#### 3. Back up `order_db`
```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  pg_dump -U postgres -d order_db > backup_order_db_$(date +%Y%m%d_%H%M%S).sql
```

---

### Backing Up All Databases (Full Cluster Dump)

To back up all databases (`auth_db`, `catalog_db`, `order_db`, roles, and schemas) in a single operation, use `pg_dumpall`:

```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  pg_dumpall -U postgres > backup_orbitstack_all_$(date +%Y%m%d_%H%M%S).sql
```

---

### Compressed Custom-Format Backups

For large databases, format the output as a compressed binary archive (`-F c`), which enables parallel restore and flexible object selection:

```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  pg_dump -U postgres -F c -d catalog_db > catalog_db_$(date +%Y%m%d_%H%M%S).dump
```

---

## 2. PostgreSQL Database Restore Workflow

> [!WARNING]
> Restoring a database overwrites existing table data. Ensure you take a safety snapshot before performing any restore operation in staging or production.

### Pre-Restore Safety Checklist

1. **Pause or Scale Down Application Services**: Prevent incoming write traffic during the restore to prevent dirty reads or foreign key locks:
   ```bash
   kubectl scale deployment auth-service catalog-service order-service notification-service \
     -n orbitstack --replicas=0
   ```

2. **Verify Database Connectivity**:
   ```bash
   kubectl exec -it -n orbitstack deploy/postgres -- psql -U postgres -c "\l"
   ```

---

### Restoring SQL Text Dumps

#### 1. Restore a Single Service Database (`catalog_db`)
```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  psql -U postgres -d catalog_db < backup_catalog_db_20260725_230000.sql
```

#### 2. Restore Full Cluster (`pg_dumpall` script)
```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  psql -U postgres < backup_orbitstack_all_20260725_230000.sql
```

---

### Restoring Compressed Dumps (`pg_restore`)

To restore a custom-format dump file (`.dump`) with automatic table cleanup:

```bash
kubectl exec -i -n orbitstack deploy/postgres -- \
  pg_restore -U postgres -d catalog_db --clean --if-exists < catalog_db_20260725_230000.dump
```

---

### Post-Restore Data Verification

1. **Verify Record Counts**:
   ```bash
   # Check user count in auth_db
   kubectl exec -it -n orbitstack deploy/postgres -- \
     psql -U postgres -d auth_db -c "SELECT COUNT(*) FROM \"user\";"

   # Check product count in catalog_db
   kubectl exec -it -n orbitstack deploy/postgres -- \
     psql -U postgres -d catalog_db -c "SELECT COUNT(*) FROM product;"

   # Check order count in order_db
   kubectl exec -it -n orbitstack deploy/postgres -- \
     psql -U postgres -d order_db -c "SELECT COUNT(*) FROM \"order\";"
   ```

2. **Scale Application Services Back Up**:
   ```bash
   kubectl scale deployment auth-service order-service notification-service \
     -n orbitstack --replicas=1
   kubectl scale deployment catalog-service \
     -n orbitstack --replicas=2
   ```

---

## 3. Manual Service Scaling (`kubectl scale`)

All OrbitStack services can be dynamically scaled horizontally to handle traffic surges or minimize cluster resource consumption.

### Scaling Deployments Up or Down

To scale a specific microservice deployment, pass `--replicas=<count>` to `kubectl scale`:

```bash
# Scale catalog-service to 5 replicas
kubectl scale deployment catalog-service -n orbitstack --replicas=5

# Scale order-service to 3 replicas
kubectl scale deployment order-service -n orbitstack --replicas=3

# Scale auth-service to 3 replicas
kubectl scale deployment auth-service -n orbitstack --replicas=3

# Scale notification-service to 2 replicas
kubectl scale deployment notification-service -n orbitstack --replicas=2

# Scale frontend to 3 replicas
kubectl scale deployment frontend -n orbitstack --replicas=3
```

---

### Interactions with HorizontalPodAutoscaler (HPA)

`catalog-service` has an automated `HorizontalPodAutoscaler` enabled ([`k8s/20-hpa-catalog.yaml`](file:///c:/Users/rajiv/OneDrive/Desktop/Projects/Main%20Projects/Orbitstack/k8s/20-hpa-catalog.yaml)) configured with:
- **Min Replicas**: `2`
- **Max Replicas**: `10`
- **Target CPU Utilization**: `70%`

> [!NOTE]
> If you manually scale `catalog-service` using `kubectl scale`, the HPA controller will eventually overwrite your manual replica count based on CPU metrics.

#### Check Active HPA Status
```bash
kubectl get hpa -n orbitstack
```

#### Temporarily Pause / Remove HPA for Manual Overrides
```bash
# Delete HPA if manual scaling must be fixed permanently during an incident
kubectl delete hpa hpa-catalog -n orbitstack

# Re-apply HPA manifest when incident is resolved
kubectl apply -f k8s/20-hpa-catalog.yaml
```

---

### Monitoring Scale Rollout Progress

Verify pod creation and readiness status:

```bash
# Watch real-time pod rollout status
kubectl get pods -n orbitstack -w

# Check deployment replica status
kubectl get deployments -n orbitstack
```

---

## 4. Incident Response Checklist & SOP

When an alert fires or system instability occurs, follow this 4-step Standard Operating Procedure (SOP) to isolate and resolve the issue.

```
 [1. Check Pod Status] ──> [2. Check Logs & Traces] ──> [3. Check Grafana] ──> [4. Rollback Deployment]
```

---

### Step 1: Check Pod & Cluster Health

First, determine if pods are crashing, failing health probes, or out of memory.

```bash
# List all pods in orbitstack namespace
kubectl get pods -n orbitstack -o wide

# Check for recent cluster events (warnings/errors)
kubectl get events -n orbitstack --sort-by='.metadata.creationTimestamp'
```

#### Common Pod States & Immediate Actions

| Pod Status | Probable Cause | Action |
|------------|----------------|--------|
| `CrashLoopBackOff` | Application crash, missing database connection, or bad config | Run `kubectl describe pod <pod_name> -n orbitstack` and check container logs. |
| `OOMKilled` | Container exceeded memory limits (e.g. 512Mi limit on `catalog-service`) | Increase `resources.limits.memory` in deployment manifest or scale replicas. |
| `ImagePullBackOff` | Bad image tag or registry authentication issue | Verify image tag with `kubectl get deployment <name> -n orbitstack -o yaml`. |
| `Pending` | Insufficient CPU/Memory node capacity | Check node resources with `kubectl describe nodes`. |

---

### Step 2: Inspect Application Logs & Correlation Traces

Tail structured JSON logs to diagnose runtime errors and trace correlation IDs.

#### 1. Tail Microservice Logs
```bash
# Tail last 100 log lines for order-service
kubectl logs -n orbitstack -l app=order-service --tail=100 -f

# Tail logs for catalog-service across all replicas
kubectl logs -n orbitstack -l app=catalog-service --all-containers --tail=100
```

#### 2. Trace Distributed Requests using `X-Request-ID`
All 4 microservices emit structured single-line JSON logs with `request_id`. Filter logs by correlation ID across services:

```bash
# Search for a specific request ID in logs
kubectl logs -n orbitstack -l app.kubernetes.io/part-of=orbitstack-platform | grep "req-7f8a9b0c1234"
```

#### 3. Inspect Crashed Container Logs
If a pod restarted, inspect the previous container instance logs:

```bash
kubectl logs -n orbitstack <pod_name> --previous --tail=100
```

---

### Step 3: Analyze Grafana Metrics & Alertmanager Alerts

Access cluster observability to evaluate system throughput, error rates, and resource utilization.

#### 1. Port-Forward Grafana
```bash
kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring
```
- **URL**: `http://localhost:3000`
- **User**: `admin` / **Password**: `admin`

#### 2. Key Dashboard Metrics to Review
- **Per-Service Error Rate**: Check if 5xx HTTP responses exceed **5%** (triggers `HighServiceErrorRate` alert).
- **Per-Service p95 Latency**: Identify downstream latency bottlenecks in `auth-service` or `catalog-service`.
- **Pod CPU & Memory Footprint**: Check if container limits are causing throttling or imminent `OOMKilled` events.

---

### Step 4: Emergency Rollback (`kubectl rollout undo`)

If a newly deployed image or code update causes service outage, execute an immediate zero-downtime rollback to the previous revision.

#### 1. Inspect Rollout History
```bash
kubectl rollout history deployment/catalog-service -n orbitstack
kubectl rollout history deployment/order-service -n orbitstack
```

#### 2. Execute Emergency Rollback to Previous Version
```bash
# Rollback catalog-service to previous revision
kubectl rollout undo deployment/catalog-service -n orbitstack

# Rollback order-service to previous revision
kubectl rollout undo deployment/order-service -n orbitstack
```

#### 3. Rollback to a Specific Revision Number
```bash
kubectl rollout undo deployment/catalog-service -n orbitstack --to-revision=2
```

#### 4. Verify Rollback Completion
```bash
# Monitor rollout status until successfully finished
kubectl rollout status deployment/catalog-service -n orbitstack
```

---

### Step 5: Canary Deployment Rollback (`order-service`)

The `order-service` utilizes a Canary deployment strategy where 10% of incoming API traffic is routed to a separate `order-service-canary` deployment. If the canary's error rate spikes or latency increases significantly during an active canary phase:

1. **Halt traffic to the Canary**: Immediately route all traffic back to the stable production deployment by setting the canary weight to 0.
   ```bash
   kubectl annotate ingress orbitstack-ingress-order-canary -n orbitstack nginx.ingress.kubernetes.io/canary-weight="0" --overwrite
   ```

2. **Rollback the Canary Deployment**: Revert the canary deployment to the previous stable image (or simply scale it to 0).
   ```bash
   kubectl rollout undo deployment/order-service-canary -n orbitstack
   ```

3. **Investigate Logs**: Isolate and check the logs of the failing canary pods to diagnose the issue without impacting the main production traffic.
   ```bash
   kubectl logs -n orbitstack -l app=order-service-canary --tail=100
   ```

---

## 📑 Summary Quick-Reference Command Sheet

```bash
# ─── BACKUP & RESTORE ────────────────────────────────────────────────────────
kubectl exec -i -n orbitstack deploy/postgres -- pg_dump -U postgres -d catalog_db > catalog_backup.sql
kubectl exec -i -n orbitstack deploy/postgres -- psql -U postgres -d catalog_db < catalog_backup.sql

# ─── SERVICE SCALING ──────────────────────────────────────────────────────────
kubectl scale deployment/catalog-service -n orbitstack --replicas=5
kubectl get hpa -n orbitstack

# ─── INCIDENT RESPONSE ───────────────────────────────────────────────────────
kubectl get pods -n orbitstack
kubectl logs -n orbitstack -l app=order-service --tail=100 -f
kubectl rollout undo deployment/order-service -n orbitstack

# ─── SECRETS MANAGEMENT ──────────────────────────────────────────────────────
kubeseal --format=yaml < my-secret.yaml > 02-sealed-secret.yaml
kubectl apply -f 02-sealed-secret.yaml
```

---

## 5. Secrets Management (Sealed Secrets)

OrbitStack utilizes **Sealed Secrets** by Bitnami to ensure secrets are never stored as plaintext (base64) in the Git repository. The Sealed Secrets Controller is provisioned automatically during k3s cluster initialization (via Terraform user data).

### Generating Sealed Secrets

To encrypt a new secret so it can be safely committed to the repository, you need the `kubeseal` CLI tool.

1. **Install `kubeseal`**:
   Follow instructions on the [Sealed Secrets GitHub](https://github.com/bitnami-labs/sealed-secrets) to download the CLI.

2. **Create a local plain Secret** (Do NOT commit this file):
   Create a standard `my-secret.yaml`:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: orbitstack-secrets
     namespace: orbitstack
   type: Opaque
   stringData:
     POSTGRES_PASSWORD: "super-secure-password"
   ```

3. **Seal the Secret**:
   Ensure you are connected to the cluster (so `kubeseal` can fetch the public key from the controller):
   ```bash
   kubeseal --format=yaml < my-secret.yaml > k8s/02-sealed-secret.yaml
   ```

4. **Clean up**:
   Delete `my-secret.yaml` immediately.

### Updating Secrets

The Sealed Secrets controller seamlessly decrypts `SealedSecret` resources into regular Kubernetes `Secret` resources. When you `kubectl apply -f k8s/02-sealed-secret.yaml`, the controller updates the underlying `orbitstack-secrets` Secret, and pods will continue to consume it as normal. There is no need for init containers or CSI drivers.
