import time
import logging
import threading
import redis
from typing import Any, Optional
from app.config import settings

logger = logging.getLogger("smartfarm_redis")

class InMemoryCacheFallback:
    """Thread-safe in-memory cache to mimic Redis GET/SET/INCR operations when Redis is unavailable."""
    def __init__(self):
        self._cache = {}
        self._lock = threading.RLock()
        
    def get(self, key: str) -> Optional[str]:
        with self._lock:
            item = self._cache.get(key)
            if not item:
                return None
            val, expiry = item
            if expiry and time.time() > expiry:
                del self._cache[key]
                return None
            return val
            
    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        with self._lock:
            expiry = time.time() + ex if ex else None
            self._cache[key] = (value, expiry)
            return True
            
    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False
            
    def exists(self, key: str) -> bool:
        return self.get(key) is not None

    def incr(self, key: str, ex: int = 60) -> int:
        with self._lock:
            val = self.get(key)
            if val is None:
                new_val = 1
                self.set(key, str(new_val), ex=ex)
                return new_val
            else:
                try:
                    new_val = int(val) + 1
                except ValueError:
                    new_val = 1
                
                # Preserve remaining expiry if set
                item = self._cache.get(key)
                expiry = item[1] if item else None
                self._cache[key] = (str(new_val), expiry)
                return new_val


class RedisService:
    _client: Optional[redis.Redis] = None
    _fallback: InMemoryCacheFallback = InMemoryCacheFallback()
    _use_fallback: bool = False

    @classmethod
    def get_client(cls) -> Optional[redis.Redis]:
        if cls._use_fallback:
            return None
        if cls._client is not None:
            return cls._client
            
        try:
            # Connect to Redis with strict socket and connection timeouts
            cls._client = redis.Redis.from_url(
                settings.REDIS_URL, 
                decode_responses=True, 
                socket_timeout=2.0, 
                socket_connect_timeout=2.0
            )
            # Ping database to check connection liveness
            cls._client.ping()
            cls._use_fallback = False
            logger.info("Successfully connected to Redis cache database.")
        except Exception as e:
            logger.warning(f"Could not connect to Redis at {settings.REDIS_URL}: {e}. Falling back to InMemoryCache.")
            cls._use_fallback = True
            cls._client = None
            
        return cls._client

    @classmethod
    def get(cls, key: str) -> Optional[str]:
        client = cls.get_client()
        if cls._use_fallback or not client:
            return cls._fallback.get(key)
        try:
            return client.get(key)
        except Exception as e:
            logger.warning(f"Redis get failed: {e}. Reverting to fallback cache.")
            cls._use_fallback = True
            return cls._fallback.get(key)

    @classmethod
    def set(cls, key: str, value: str, ex: Optional[int] = None) -> bool:
        client = cls.get_client()
        if cls._use_fallback or not client:
            return cls._fallback.set(key, value, ex)
        try:
            return bool(client.set(key, value, ex=ex))
        except Exception as e:
            logger.warning(f"Redis set failed: {e}. Reverting to fallback cache.")
            cls._use_fallback = True
            return cls._fallback.set(key, value, ex)

    @classmethod
    def delete(cls, key: str) -> bool:
        client = cls.get_client()
        if cls._use_fallback or not client:
            return cls._fallback.delete(key)
        try:
            return bool(client.delete(key))
        except Exception as e:
            logger.warning(f"Redis delete failed: {e}. Reverting to fallback cache.")
            cls._use_fallback = True
            return cls._fallback.delete(key)

    @classmethod
    def check_rate_limit(cls, rate_key: str, limit: int, window: int = 60) -> bool:
        """Increments key and checks if rate limit has been exceeded. Returns True if OK, False if blocked."""
        client = cls.get_client()
        if cls._use_fallback or not client:
            current = cls._fallback.incr(rate_key, ex=window)
            return current <= limit
        try:
            # Thread-safe pipeline execution for incrementing and setting expiry
            pipe = client.pipeline()
            pipe.incr(rate_key)
            pipe.ttl(rate_key)
            res = pipe.execute()
            current = res[0]
            ttl = res[1]
            if ttl == -1: # Expire flag was lost or not set yet
                client.expire(rate_key, window)
            return current <= limit
        except Exception as e:
            logger.warning(f"Redis rate limit check failed: {e}. Falling back to memory limits.")
            cls._use_fallback = True
            current = cls._fallback.incr(rate_key, ex=window)
            return current <= limit
