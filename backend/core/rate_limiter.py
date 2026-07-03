from slowapi import Limiter
from slowapi.util import get_remote_address

# --- In-Memory Storage (No Redis Required) ---
# Perfect for local development and single-instance deployments
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],
    headers_enabled=False,
)





















# from slowapi import Limiter
# from slowapi.util import get_remote_address
# from limits.storage import RedisStorage
# from backend.core.redis_config import get_redis_storage_uri

# # --- Production Redis Storage ---
# # RedisStorage ensures rate limits are shared across all FastAPI instances
# storage = RedisStorage(get_redis_storage_uri())

# # --- Limiter Instance ---
# # key_func: identifies client by IP.
# # storage_uri: pass Redis URI for shared storage across instances
# limiter = Limiter(
#     key_func=get_remote_address,
#     storage_uri=get_redis_storage_uri(),  # Correct way to pass Redis storage
#     default_limits=["200/minute"],        # Global fallback limit
#     headers_enabled=True,                 # Adds X-RateLimit-* headers
# )