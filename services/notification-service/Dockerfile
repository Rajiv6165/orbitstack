# ── Stage 1: Builder ────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder
WORKDIR /build

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime
WORKDIR /app

COPY --from=builder /install /usr/local

RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

COPY . .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

# notification-service has no DB migrations — start directly
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
