# # backend/core/redis_config.py
# import os
# from redis import Redis, ConnectionPool

# # --- Configuration ---
# REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
# REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
# REDIS_DB = int(os.getenv("REDIS_DB", 0))
# REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# # --- Connection Pool (Production-Ready) ---
# # Using a connection pool is critical for stability under load
# _pool = ConnectionPool(
#     host=REDIS_HOST,
#     port=REDIS_PORT,
#     db=REDIS_DB,
#     password=REDIS_PASSWORD,
#     max_connections=50,
#     decode_responses=True,
# )

# def get_redis_client() -> Redis:
#     """Returns a Redis client using the shared connection pool."""
#     return Redis(connection_pool=_pool)

# def get_redis_storage_uri() -> str:
#     """Returns Redis URI for SlowAPI storage backend."""
#     auth = f":{REDIS_PASSWORD}@" if REDIS_PASSWORD else ""
#     return f"redis://{auth}{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}