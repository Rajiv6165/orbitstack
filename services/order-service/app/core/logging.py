import logging
import sys
import time
import uuid
from contextvars import ContextVar

from fastapi import Request
from pythonjsonlogger import jsonlogger
from starlette.middleware.base import BaseHTTPMiddleware

request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON log formatter to standardize fields across OrbitStack services."""

    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record["timestamp"] = self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ")
        log_record["level"] = record.levelname
        log_record["logger"] = record.name
        log_record["request_id"] = request_id_var.get() or record.__dict__.get("request_id", "N/A")


def setup_json_logging(service_name: str, log_level: int = logging.INFO):
    """Configures root logger to output structured JSON formatted logs."""
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJsonFormatter(
        "%(timestamp)s %(level)s %(logger)s %(message)s %(request_id)s",
    )
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that extracts or generates a unique X-Request-ID,
    binds it to the request context for structured logging,
    and returns it in the HTTP response headers.
    """

    def __init__(self, app, service_name: str):
        super().__init__(app)
        self.service_name = service_name
        self.logger = logging.getLogger(f"{service_name}.http")

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:12]}"
        token = request_id_var.set(request_id)
        start_time = time.perf_counter()

        self.logger.info(
            "HTTP Request Received",
            extra={
                "service": self.service_name,
                "http_method": request.method,
                "http_path": request.url.path,
                "client_ip": request.client.host if request.client else "unknown",
            },
        )

        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

            self.logger.info(
                "HTTP Request Completed",
                extra={
                    "service": self.service_name,
                    "http_method": request.method,
                    "http_path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                },
            )
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            self.logger.error(
                "HTTP Request Failed",
                extra={
                    "service": self.service_name,
                    "http_method": request.method,
                    "http_path": request.url.path,
                    "error": str(exc),
                    "duration_ms": duration_ms,
                },
                exc_info=True,
            )
            raise
        finally:
            request_id_var.reset(token)
